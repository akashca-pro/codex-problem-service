import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'

import { IProblemRepository } from '@/repos/interfaces/problem.repository.interface';
import { ProblemRepository } from '@/repos/problem.repository';

import { ISubmissionRepository } from '@/repos/interfaces/submission.repository.interface';
import { SubmissionRepository } from '@/repos/submission.repository';

import { ICacheProvider } from '@/libs/cache/ICacheProvider.interface';
import { RedisCacheProvider } from '@/libs/cache/CacheProvider';

import { IProblemService } from '@/services/interfaces/problem.service.interface';
import { ProblemService } from '@/services/problem.service';

import { ISubmissionService } from '@/services/interfaces/submission.service.interface';
import { SubmissionService } from '@/services/submission.service';

import { ProblemHandler } from '@/transport/grpc/server/problem.handler';
import { SubmissionHandler } from '@/transport/grpc/server/submission.handler';
import { IFirstSubmissionRepository } from '@/repos/interfaces/firstSubmission.repository.interface';
import { FirstSubmissionRepository } from '@/repos/firstSubmission.repository';
import { RedisLeaderboard } from '@/libs/leaderboard/RedisLeaderboard';
import { ILeaderboard } from '@/libs/leaderboard/leaderboard.interface';

const container = new Container();

/**
 * Providers
 */
container
    .bind<ICacheProvider>(TYPES.ICacheProvider)
    .to(RedisCacheProvider).inSingletonScope();
container
    .bind<ILeaderboard>(TYPES.ILeaderboard)
    .to(RedisLeaderboard).inSingletonScope();

/**
 * Repos
 */
container
    .bind<IProblemRepository>(TYPES.IProblemRepository)
    .to(ProblemRepository).inSingletonScope();
container
    .bind<ISubmissionRepository>(TYPES.ISubmissionRepository)
    .to(SubmissionRepository).inSingletonScope();
container
    .bind<IFirstSubmissionRepository>(TYPES.IFirstSubmissionRepository)
    .to(FirstSubmissionRepository).inSingletonScope();

/**
 * Services
 */
container
    .bind<IProblemService>(TYPES.IProblemService)
    .to(ProblemService).inSingletonScope();
container
    .bind<ISubmissionService>(TYPES.ISubmissionService)
    .to(SubmissionService).inSingletonScope();

/**
 * Grpc handlers.
 */
container
    .bind<ProblemHandler>(TYPES.ProblemHandler)
    .to(ProblemHandler);
container
    .bind<SubmissionHandler>(TYPES.SubmissionHandler)
    .to(SubmissionHandler);


export default container