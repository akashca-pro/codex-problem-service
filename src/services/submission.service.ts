import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { inject, injectable } from "inversify";
import { ISubmissionService } from "./interfaces/submission.service.interface";
import { ISubmissionRepository } from "@/repos/interfaces/submission.repository.interface";
import mongoose, { Types } from "mongoose";
import { PaginationDTO } from "@/dtos/PaginationDTO";
import { CreateSubmissionRequest, GetDashboardStatsRequest, GetSubmissionsRequest, ListProblemSpecificSubmissionRequest, ListTopKCountryLeaderboardRequest, ListTopKGlobalLeaderboardRequest, UpdateCountryRequest, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { IProblemRepository } from "@/repos/interfaces/problem.repository.interface";
import { PROBLEM_ERROR_MESSAGES, SUBMISSION_ERROR_MESSAGES } from "@/const/ErrorType.const"
import { SubmissionMapper } from "@/dtos/mappers/SubmissionMapper";
import logger from '@/utils/pinoLogger';
import { IFirstSubmissionRepository } from "@/repos/interfaces/firstSubmission.repository.interface";
import { ILeaderboard } from "@/libs/leaderboard/leaderboard.interface";
import { SCORE_MAP } from "@/const/ScoreMap.const";
import { IActivity } from "@/dtos/Activity.dto";
import { format, subDays, differenceInHours, differenceInDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { LeaderboardData } from "@/dtos/Leaderboard.dto";

/**
 * Class representing the service for managing submissions and leaderboard.
 * @class
 * @implements {ISubmissionService}
 */
@injectable()
export class SubmissionService implements ISubmissionService {

    #_submissionRepo : ISubmissionRepository;
    #_problemRepo : IProblemRepository;
    #_firstSubmissionRepo : IFirstSubmissionRepository;
    #_leaderboard : ILeaderboard;
    #_cacheProvider : ICacheProvider;

    constructor(
        @inject(TYPES.ISubmissionRepository) submissionRepo : ISubmissionRepository,
        @inject(TYPES.IProblemRepository) problemRepo : IProblemRepository,
        @inject(TYPES.IFirstSubmissionRepository) firstSubmissionRepo : IFirstSubmissionRepository,
        @inject(TYPES.ILeaderboard) leaderboard : ILeaderboard,
        @inject(TYPES.ICacheProvider) cacheProvider : ICacheProvider
    ){
        this.#_submissionRepo = submissionRepo;
        this.#_problemRepo = problemRepo;
        this.#_firstSubmissionRepo = firstSubmissionRepo;
        this.#_leaderboard = leaderboard;
        this.#_cacheProvider = cacheProvider;
    }

    async createSubmission(data: CreateSubmissionRequest): Promise<ResponseDTO> {
        const method = 'createSubmission';
        logger.info(`[SERVICE] ${method} started`, { userId: data.userId, problemId: data.problemId, language: data.language });
        
        const submissionExist = await this.#_submissionRepo.findOne({
            userId : data.userId, problemId : data.problemId
        })
        
        const dto = SubmissionMapper.toCreateSubmissionService(data);
        const submissionData = {
            ...dto,
            isFirst : submissionExist ? false : true,
            problemId : new mongoose.Types.ObjectId(data.problemId),
        }
        
        logger.debug(`[SERVICE] ${method}: isFirst=${submissionData.isFirst}`, { userId: data.userId, problemId: data.problemId });

        const submission = await this.#_submissionRepo.create(submissionData)
        const outDTO = SubmissionMapper.toOutDTO(submission);
        
        logger.info(`[SERVICE] ${method} completed successfully`, { submissionId: submission._id.toString(), isFirst: submissionData.isFirst });
        
        return {
            data : outDTO,
            success : true
        }
    }

    async getSubmission(filter: GetSubmissionsRequest): Promise<PaginationDTO> {
        const method = 'getSubmission (Paginated List)';
        logger.info(`[SERVICE] ${method} started`, { page: filter.page, limit: filter.limit, userId: filter.userId, problemId: filter.problemId });

        const updatingfilter : Record<string, any> = {};
        if(filter.problemId) updatingfilter.problemId = filter.problemId;
        if(filter.battleId) updatingfilter.battleId = filter.battleId;
        if(filter.userId) updatingfilter.userId = filter.userId;
        
        const skip = (filter.page - 1) * filter.limit;
        
        const [totalItems,submissions] = await Promise.all([
            await this.#_submissionRepo.countDocuments(updatingfilter),
            await this.#_submissionRepo.findPaginated(updatingfilter,skip,filter.limit)
        ]);
        
        const totalPages = Math.ceil(totalItems/ filter.limit);
        const outDTO = submissions.map(SubmissionMapper.toOutDTO);
        
        logger.info(`[SERVICE] ${method} completed successfully`, { totalItems, currentPage: filter.page });

        return {
            body : outDTO,
            currentPage : filter.page,
            totalItems,
            totalPages
        }
    }

    async updateSubmission(request : UpdateSubmissionRequest): Promise<ResponseDTO> {
        const method = 'updateSubmission';
        logger.info(`[SERVICE] ${method} started`, { submissionId: request.Id, status: request.status });

        const updatedData = SubmissionMapper.toUpdateSubmissionService(request);
        const submissionId = request.Id;
        
        const submissionExist = await this.#_submissionRepo.findById(submissionId);
        if(!submissionExist){
            logger.warn(`[SERVICE] ${method} failed: Submission not found`, { submissionId });
            return {
                data : null,
                success : false,
                errorMessage : SUBMISSION_ERROR_MESSAGES.SUBMISSION_NOT_FOUND
            }
        }
        const score = SCORE_MAP[submissionExist.difficulty];

        const updatedSubmission = await this.#_submissionRepo.update(submissionId, {
            executionResult : updatedData.executionResult,
            status : updatedData.status,
            score : updatedData.status === 'accepted' ? score : undefined
        });

        if (updatedSubmission && updatedSubmission.status === 'accepted' && submissionExist.isFirst) {
            
            logger.info(`[SERVICE] ${method}: First accepted submission detected`, { submissionId, userId: updatedSubmission.userId });
            const cacheKeyLeaderboard = `${REDIS_PREFIX.DASHBOARD_LEADERBOARD}${updatedSubmission.userId}`

            if (score > 0) {
                try {
                    const { _id, ...submissionData } = updatedSubmission.toObject();
                    await Promise.all([
                        this.#_firstSubmissionRepo.create({
                            ...submissionData,
                            submissionId : _id as Types.ObjectId
                        }),
                        this.#_leaderboard.incrementScore(
                            updatedSubmission.userId,
                            updatedSubmission.country ?? '',
                            score
                        ),
                        this.#_leaderboard.incrementProblemsSolved(updatedSubmission.userId),
                        this.#_leaderboard.setUsername(
                            updatedSubmission.userId, 
                            updatedSubmission.username
                        ),
                        this.#_cacheProvider.del(cacheKeyLeaderboard),
                    ])
                    logger.info(`[SERVICE] ${method}: Leaderboard score incremented and problems solved updated`, { userId: updatedSubmission.userId, score });

                } catch (leaderboardError) {
                    logger.error(`[SERVICE] ${method}: Failed to update FirstSubmission or Leaderboard`, { 
                        submissionId, 
                        userId: updatedSubmission.userId, 
                        error: leaderboardError 
                    });
                }
            } else {
                logger.warn(`[SERVICE] ${method}: No score found for difficulty ${updatedSubmission.difficulty}`, { submissionId });
            }
        }
        
        logger.info(`[SERVICE] ${method} completed successfully`, { submissionId, newStatus: request.status });

        return {
            data : updatedSubmission,
            success : true
        }
    }

    async listSubmissionByProblem(
        request: ListProblemSpecificSubmissionRequest
    ): Promise<ResponseDTO> {
        const method = 'listSubmissionByProblem';
        logger.info(`[SERVICE] ${method} started`, { problemId: request.problemId, userId: request.userId, cursor: request.nextCursor, limit: request.limit });

        const problem = await this.#_problemRepo.findByIdLean(request.problemId);
        if(!problem){
            logger.warn(`[SERVICE] ${method} failed: Problem not found`, { problemId: request.problemId });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        let filter: Record<string, any> = {};
        filter.problemId = problem._id;
        filter.status = { $nin: ['pending'] };
        filter.userId = request.userId;
        
        if(request.nextCursor){
            filter.createdAt = { $lt: new Date(request.nextCursor) }
            logger.debug(`[SERVICE] ${method}: Applied cursor filter`, { createdAtLt: request.nextCursor });
        }
        
        const select = ['status','language','executionResult','problemId','userId','createdAt','userCode']
        const submissions = await this.#_submissionRepo.findPaginatedLean(
            filter,
            0,          
            request.limit,
            select,
            { createdAt: -1 }
        );
        
        let nextCursor: string | null = null;
        if (submissions.length === request.limit) {
            nextCursor = submissions[submissions.length - 1].createdAt.toISOString();
        }
        
        const hasMore = submissions.length === request.limit
        const outDTO = SubmissionMapper.toListProblemSpecificSubmissions(
            submissions,
            nextCursor ?? '',
            hasMore
        )
        logger.info(`[SERVICE] ${method} completed successfully`, { count: submissions.length, hasMore, nextCursor });

        return {
            data : outDTO,
            success : true,
        }
    }

    async listTopKGlobalLeaderboard(
        req : ListTopKGlobalLeaderboardRequest
    ): Promise<ResponseDTO> {
        const { k } = req;
        const method = 'listTopKGlobalLeaderboard';
        logger.info(`[SERVICE] ${method} started`, { k });
        const users = await this.#_leaderboard.getTopKGlobal(k);
        console.log(users)
        logger.info(`[SERVICE] ${method} completed successfully`, { k });
        return {
            data : { users },
            success : true
        }
    }

    async listTopKCountryLeaderboard(
        req : ListTopKCountryLeaderboardRequest
    ): Promise<ResponseDTO> {
        const { country, k } = req;
        const method = 'listTopKCountryLeaderboard';
        logger.info(`[SERVICE] ${method} started`, { country, k });
        const users = await this.#_leaderboard.getTopKEntity(country, k)
        logger.info(`[SERVICE] ${method} completed successfully`, { country, k });
        return {
            data : { users },
            success : true
        }
    }

    async getDashboardStats(
        req : GetDashboardStatsRequest
    ) : Promise<ResponseDTO> {
        const { userId, userTimezone } = req;
        const method = 'getDashboardStats';
        logger.info(`[SERVICE] ${method} started`, { userId });

        // Heatmap
        let activity: IActivity[];
        const cacheKeyHeatmap = `${REDIS_PREFIX.DASHBOARD_HEATMAP}${userId}`;
        const cachedHeatmap = await this.#_cacheProvider.get(cacheKeyHeatmap);
        if (cachedHeatmap) {
            activity = cachedHeatmap as IActivity[];
            logger.info(`[SERVICE] ${method} heatmap cache hit`, { userId })
        } else {
            activity = await this.#_submissionRepo.getDailyActivity(userId, userTimezone);
            await this.#_cacheProvider.set(cacheKeyHeatmap, activity, 300); // 5 mins
            logger.info(`[SERVICE] ${method} heatmap cache miss`, { userId })
        }

        // Streak
        let streak: number;
        const cacheKeyStreak = `${REDIS_PREFIX.DASHBOARD_STREAK}${userId}`;
        const cachedStreak = await this.#_cacheProvider.get(cacheKeyStreak);
        if (cachedStreak) {
            streak = cachedStreak as number;
            logger.info(`[SERVICE] ${method} streak cache hit`, { userId })
        } else {
            streak = this.#_calculateStreak(activity, userTimezone);
            await this.#_cacheProvider.set(cacheKeyStreak, streak, 86400); // 24 hours
            logger.info(`[SERVICE] ${method} streak cache miss`, { userId })
        }

        // Leaderboard
        let leaderboardDetails: LeaderboardData;
        const cacheKeyLeaderboard = `${REDIS_PREFIX.DASHBOARD_LEADERBOARD}${userId}`;
        const cachedLeaderboard = await this.#_cacheProvider.get(cacheKeyLeaderboard);
        if (cachedLeaderboard) {
            leaderboardDetails = cachedLeaderboard as LeaderboardData;
            logger.info(`[SERVICE] ${method} leaderboard cache hit`, { userId })
        } else {
            leaderboardDetails = await this.#_leaderboard.getUserLeaderboardData(userId);
            await this.#_cacheProvider.set(cacheKeyLeaderboard, leaderboardDetails, 300); // 5 min
            logger.info(`[SERVICE] ${method} leaderboard cache miss`, { userId })
        }

        // Problems solved
        let problemsSolved: number;
        const cacheKeyProblemsSolved = `${REDIS_PREFIX.DASHBOARD_PROBLEMS_SOLVED}${userId}`;
        const cachedSolved = await this.#_cacheProvider.get(cacheKeyProblemsSolved);
        if (cachedSolved) {
            problemsSolved = cachedSolved as number;
            logger.info(`[SERVICE] ${method} problems solved cache hit`, { userId })
        } else {
            problemsSolved = await this.#_submissionRepo.getProblemsSolvedCount(userId);
            await this.#_cacheProvider.set(cacheKeyProblemsSolved, problemsSolved, 600); // 10 min
            logger.info(`[SERVICE] ${method} problems solved cache miss`, { userId })
        }

        // Recent activities
        const cacheKeyRecentActivities = `${REDIS_PREFIX.DASHBOARD_RECENT_ACTIVITY}${userId}`;
        let recentActivities: {title: string, difficulty: string, status: string, timeAgo: string}[];
        const cachedRecent = await this.#_cacheProvider.get(cacheKeyRecentActivities);
        if (cachedRecent) {
            recentActivities = cachedRecent as {title: string, difficulty: string, status: string, timeAgo: string}[];
            logger.info(`[SERVICE] ${method} recent activities cache hit`, { userId })
        } else {
            const recent = await this.#_submissionRepo.getRecentActivities(userId, 5);
            const now = new Date();
                recentActivities = recent.map(a => {
                const hours = differenceInHours(now, a.createdAt);
                const days = differenceInDays(now, a.createdAt);
                let timeAgo = '';

                if (hours < 1) timeAgo = 'Just now';
                else if (hours < 24) timeAgo = `${hours} hours ago`;
                else timeAgo = `${days} days ago`;

                return {
                    title: a.title,
                    difficulty: a.difficulty,
                    status: a.status,
                    timeAgo,
                };
            });
            await this.#_cacheProvider.set(cacheKeyRecentActivities, recentActivities, 60); // 1 min
            logger.info(`[SERVICE] ${method} recent activities cache miss`, { userId })
        }
        
        logger.info(`[SERVICE] ${method} completed successfully`, { userId });
        return {
            success: true,
            data: {
                heatmap: activity,
                currentStreak: streak,
                leaderboardDetails,
                problemsSolved,
                recentActivities,
            },
        };
    }

    async updateCountryInLeaderboard(
        req : UpdateCountryRequest
    ): Promise<ResponseDTO> {
        const { userId, country } = req;
        const method = 'updateCountryInLeaderboard';
        const isUserExistInLeaderboard =await this.#_firstSubmissionRepo.findOne({ userId })
        if(!isUserExistInLeaderboard){
            logger.warn(`[SERVICE] ${method} failed: User not found in leaderboard`, { userId });
            return {
                data : null,
                success : false,
                errorMessage : SUBMISSION_ERROR_MESSAGES.SUBMISSION_NOT_FOUND
            }
        }
        logger.info(`[SERVICE] ${method} started`, { userId, country });
        await this.#_leaderboard.updateEntityByUserId(userId, country);
        const cacheKeyLeaderboard = `${REDIS_PREFIX.DASHBOARD_LEADERBOARD}${userId}`;
        await this.#_cacheProvider.del(cacheKeyLeaderboard);
        logger.info(`[SERVICE] ${method} completed successfully`, { userId, country });
        return {
            data : null,
            success : true
        }
    }

    async removeUserInLeaderboard(
        req : UpdateCountryRequest
    ): Promise<ResponseDTO> {
        const { userId } = req;
        const method = 'removeUserInLeaderboard';
        logger.info(`[SERVICE] ${method} started`, { userId });
        await this.#_leaderboard.removeUser(userId);
        const cacheKeyLeaderboard = `${REDIS_PREFIX.DASHBOARD_LEADERBOARD}${userId}`;
        await this.#_cacheProvider.del(cacheKeyLeaderboard);
        logger.info(`[SERVICE] ${method} completed successfully`, { userId });
        return {
            data : null,
            success : true
        }
    }

    #_calculateStreak(activity: IActivity[], userTimezone: string): number {
        if (activity.length === 0) {
            return 0;
        }

        // 1. Get "today" and "yesterday" in the user's timezone
        const now = new Date();
        const today = format(toZonedTime(now, userTimezone), 'yyyy-MM-dd');
        const yesterday = format(subDays(toZonedTime(now, userTimezone), 1), 'yyyy-MM-dd');
        
        let streak = 0;
        let expectedDate: string; // The date we expect to see next

        // 2. Check if the most recent submission was today or yesterday
        const mostRecentDate = activity[0].date;

        if (mostRecentDate === today) {
            streak = 1;
            expectedDate = yesterday;
        } else if (mostRecentDate === yesterday) {
            streak = 1;
            expectedDate = format(subDays(toZonedTime(now, userTimezone), 2), 'yyyy-MM-dd');
        } else {
            // Most recent submission was not today or yesterday, so streak is 0
            return 0;
        }

        // 3. Walk backwards through the rest of the activity
        // (Start from the *second* item, since we already processed the first)
        for (let i = 1; i < activity.length; i++) {
            const currentDate = activity[i].date;
            
            if (currentDate === expectedDate) {
                streak++;
                // Update the next date we expect to see
                const expectedDateObj = toZonedTime(new Date(expectedDate), userTimezone);
                expectedDate = format(subDays(expectedDateObj, 1), 'yyyy-MM-dd');
            } else {
                // The streak is broken
                break;
            }
        }
        return streak;
    }

}