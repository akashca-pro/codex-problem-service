import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'

import { IProblemRepository } from '@/infra/repos/interfaces/problem.repository.interface';
import { ProblemRepository } from '@/infra/repos/problem.repository';

import { ISubmissionRepository } from '@/infra/repos/interfaces/submission.repository.interface';
import { SubmissionRepository } from '@/infra/repos/submission.repository';

import { ICacheProvider } from '@/libs/cache/ICacheProvider.interface';
import { RedisCacheProvider } from '@/libs/cache/CacheProvider';

import { IProblemService } from '@/services/interfaces/problem.service.interface';
import { ProblemService } from '@/services/problem.service';

import { ISubmissionService } from '@/services/interfaces/submission.service.interface';
import { SubmissionService } from '@/services/submission.service';

import { ProblemHandler } from '@/transport/grpc/handlers/problem.handler';
import { SubmissionHandler } from '@/transport/grpc/handlers/submission.handler';

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