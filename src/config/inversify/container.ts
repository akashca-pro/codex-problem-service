import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'

// Repos

import { IProblemRepository } from '@/infra/repos/interfaces/problem.repository.interface';
import { ProblemRepository } from '@/infra/repos/problem.repositoy';

import { ISubmissionRepository } from '@/infra/repos/interfaces/submission.repository.interface';
import { SubmissionRepository } from '@/infra/repos/submission.repository';

// Submission services

import { ICreateSubmissionService } from '@/services/submission/interfaces/createSubmission.service.interface';
import { CreateSubmissionService } from '@/services/submission/createSubmission.service';
import { IUpdateSubmissionService } from '@/services/submission/interfaces/updateSubmission.service.interface';
import { UpdateSubmissionService } from '@/services/submission/updateSubmission.service';

// Grpc handlers

import { IGetSubmissionsService } from '@/services/submission/interfaces/getSubmissions.service.interface';
import { GetSubmissionsService } from '@/services/submission/getSubmission.service';
import { GrpcCreateSubmissionhandler } from '@/transport/grpc/handlers/submission/CreateSubmissionHandler';
import { GrpcUpdateSubmissionHandler } from '@/transport/grpc/handlers/submission/UpdateSubmissionHandler';
import { GrpcGetSubmissionsHandler } from '@/transport/grpc/handlers/submission/GetSubmissionHandler';
import { ICacheProvider } from '@/libs/cache/ICacheProvider.interface';
import { RedisCacheProvider } from '@/libs/cache/CacheProvider';
import { IProblemService } from '@/services/problem/interfaces/problem.service.interface';
import { ProblemService } from '@/services/problem/problem.service';
import { ProblemHandler } from '@/transport/grpc/handlers/problem.handler';

// Submission Services


const container = new Container();

/**
 * Providers
 */
container
    .bind<ICacheProvider>(TYPES.ICacheProvider)
    .to(RedisCacheProvider);

/**
 * Repos
 */
container
    .bind<IProblemRepository>(TYPES.IProblemRepository)
    .to(ProblemRepository).inSingletonScope();
container
    .bind<ISubmissionRepository>(TYPES.ISubmissionRepository)
    .to(SubmissionRepository).inSingletonScope();

/**
 * Problem Services
 */
container
    .bind<IProblemService>(TYPES.IProblemService)
    .to(ProblemService).inSingletonScope();

/**
 * Submission Services
 */
container
    .bind<ICreateSubmissionService>(TYPES.ICreateSubmissionService)
    .to(CreateSubmissionService);
container
    .bind<IUpdateSubmissionService>(TYPES.IUpdateSubmissionService)
    .to(UpdateSubmissionService);
container
    .bind<IGetSubmissionsService>(TYPES.IGetSubmissionsService)
    .to(GetSubmissionsService);
    

/**
 * Grpc handlers.
 */
container
    .bind<ProblemHandler>(TYPES.ProblemHandler)
    .to(ProblemHandler);

/**
 * Grpc handlers for submission.
 */
container
    .bind<GrpcCreateSubmissionhandler>(TYPES.GrpcCreateSubmissionhandler)
    .to(GrpcCreateSubmissionhandler)
container
    .bind<GrpcUpdateSubmissionHandler>(TYPES.GrpcUpdateSubmissionHandler)
    .to(GrpcUpdateSubmissionHandler)
container
    .bind<GrpcGetSubmissionsHandler>(TYPES.GrpcGetSubmissionsHandler)
    .to(GrpcGetSubmissionsHandler)

export default container