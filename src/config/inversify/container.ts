import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'

// Repos

import { IProblemRepository } from '@/infra/repos/interfaces/problem.repository.interface';
import { ProblemRepository } from '@/infra/repos/problem.repositoy';

import { ISubmissionRepository } from '@/infra/repos/interfaces/submission.repository.interface';
import { SubmissionRepository } from '@/infra/repos/submission.repository';

// Problem Services

import { ICreateProblemService } from '@/services/problem/interfaces/createProblem.service.interface';
import { IUpdateBasicProblemDetailsService } from '@/services/problem/interfaces/updateBasicProblemDetails.service.interface';
import { CreateProblemService } from '@/services/problem/createProblem.service';
import { UpdateProblemService } from '@/services/problem/updateBasicProblemDetails.service';
import { IGetProblemService } from '@/services/problem/interfaces/getProblem.service.interface';
import { GetProblemService } from '@/services/problem/getProblem.service';
import { IListProblemService } from '@/services/problem/interfaces/ListProblem.service.interface';
import { ListProblemService } from '@/services/problem/ListProblem.service';
import { IAddTestCaseService } from '@/services/problem/interfaces/addTestCase.service.interface';
import { AddTestCaseService } from '@/services/problem/addTestCase.service';
import { IBulkUploadTestCaseService } from '@/services/problem/interfaces/bulkUploadTestCase.service.interface';
import { BulkUploadTestCaseService } from '@/services/problem/bulkUploadTestCase.service';
import { IRemoveTestCaseService } from '@/services/problem/interfaces/removeTestCase.service.interface';
import { RemoveTestCaseService } from '@/services/problem/removeTestCase.service';
import { IAddSolutionCodeService } from '@/services/problem/interfaces/addSolutionCode.service.interface';
import { AddSolutionCodeService } from '@/services/problem/addSolutionCode.service';
import { IUpdateSolutionCodeService } from '@/services/problem/interfaces/updateSolutionCode.service.interface';
import { UpdateSolutionCodeService } from '@/services/problem/updateSolutionCode.service';
import { IRemoveSolutionCodeService } from '@/services/problem/interfaces/removeSolutionCode.service.interface';
import { RemoveSolutionCodeService } from '@/services/problem/removeSolutionCode.service';

// Submission services

import { ICreateSubmissionService } from '@/services/submission/interfaces/createSubmission.service.interface';
import { CreateSubmissionService } from '@/services/submission/createSubmission.service';
import { IUpdateSubmissionService } from '@/services/submission/interfaces/updateSubmission.service.interface';
import { UpdateSubmissionService } from '@/services/submission/updateSubmission.service';

// Grpc handlers

import { GrpcCreateProblemHandler } from '@/transport/grpc/handlers/problem/CreateProblemHandler';
import { IGetSubmissionsService } from '@/services/submission/interfaces/getSubmissions.service.interface';
import { GetSubmissionsService } from '@/services/submission/getSubmission.service';
import { GrpcGetProblemHandler } from '@/transport/grpc/handlers/problem/GetProblemHandler';
import { GrpcListProblemHandler } from '@/transport/grpc/handlers/problem/ListProblemHandler';
import { GrpcUpdateBasicProblemDetailsHandler } from '@/transport/grpc/handlers/problem/UpdateProblemBasicDetailsHandler';
import { GrpcAddTestCaseHandler } from '@/transport/grpc/handlers/problem/AddTestCaseHandler';
import { GrpcBulkUploadTestCaseHandler } from '@/transport/grpc/handlers/problem/bulkUploadTestCaseHandler';
import { GrpcRemoveTestCaseHandler } from '@/transport/grpc/handlers/problem/RemoveTestCaseHandler';
import { GrpcAddSolutionCodeHandler } from '@/transport/grpc/handlers/problem/AddSolutionCodeHandler';
import { GrpcUpdateSolutionCodeHandler } from '@/transport/grpc/handlers/problem/UpdateSolutionCodeHandler';
import { GrpcRemoveSolutionCodeHandler } from '@/transport/grpc/handlers/problem/RemoveSolutionCodeHandler';
import { GrpcCreateSubmissionhandler } from '@/transport/grpc/handlers/submission/CreateSubmissionHandler';
import { GrpcUpdateSubmissionHandler } from '@/transport/grpc/handlers/submission/UpdateSubmissionHandler';
import { GrpcGetSubmissionsHandler } from '@/transport/grpc/handlers/submission/GetSubmissionHandler';
import { ICacheProvider } from '@/libs/cache/ICacheProvider.interface';
import { RedisCacheProvider } from '@/libs/cache/CacheProvider';
import { IGetProblemPublicService } from '@/services/problem/interfaces/getProblemPublic.service.interface';
import { GetProblemPublicService } from '@/services/problem/getProblemPublic.service';
import { GrpcGetProblemPublicHandler } from '@/transport/grpc/handlers/problem/GetProblemPublicHandler';

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
    .to(ProblemRepository);
container
    .bind<ISubmissionRepository>(TYPES.ISubmissionRepository)
    .to(SubmissionRepository);

/**
 * Problem Services
 */
container
    .bind<ICreateProblemService>(TYPES.ICreateProblemService)
    .to(CreateProblemService);
container
    .bind<IUpdateBasicProblemDetailsService>(TYPES.IUpdateBasicProblemDetailsService)
    .to(UpdateProblemService);
container
    .bind<IGetProblemService>(TYPES.IGetProblemService)
    .to(GetProblemService);
container
    .bind<IListProblemService>(TYPES.IListProblemService)
    .to(ListProblemService);
container
    .bind<IAddTestCaseService>(TYPES.IAddTestCaseService)
    .to(AddTestCaseService);
container
    .bind<IBulkUploadTestCaseService>(TYPES.IBulkUploadTestCaseService)
    .to(BulkUploadTestCaseService);
container
    .bind<IRemoveTestCaseService>(TYPES.IRemoveTestCaseService)
    .to(RemoveTestCaseService);
container
    .bind<IAddSolutionCodeService>(TYPES.IAddSolutionCodeService)
    .to(AddSolutionCodeService);
container
    .bind<IUpdateSolutionCodeService>(TYPES.IUpdateSolutionCodeService)
    .to(UpdateSolutionCodeService);
container
    .bind<IRemoveSolutionCodeService>(TYPES.IRemoveSolutionCodeService)
    .to(RemoveSolutionCodeService);
container
    .bind<IGetProblemPublicService>(TYPES.IGetProblemPublicService)
    .to(GetProblemPublicService);

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
 * Grpc handlers for problem.
 */
container
    .bind<GrpcCreateProblemHandler>(TYPES.GrpcCreateProblemHandler)
    .to(GrpcCreateProblemHandler);
container
    .bind<GrpcGetProblemHandler>(TYPES.GrpcGetProblemHandler)
    .to(GrpcGetProblemHandler);
container
    .bind<GrpcListProblemHandler>(TYPES.GrpcListProblemHandler)
    .to(GrpcListProblemHandler);
container
    .bind<GrpcUpdateBasicProblemDetailsHandler>(TYPES.GrpcUpdateBasicProblemDetailsHandler)
    .to(GrpcUpdateBasicProblemDetailsHandler);
container
    .bind<GrpcAddTestCaseHandler>(TYPES.GrpcAddTestCaseHandler)
    .to(GrpcAddTestCaseHandler);
container
    .bind<GrpcBulkUploadTestCaseHandler>(TYPES.GrpcBulkUploadTestCaseHandler)
    .to(GrpcBulkUploadTestCaseHandler);
container
    .bind<GrpcRemoveTestCaseHandler>(TYPES.GrpcRemoveTestCaseHandler)
    .to(GrpcRemoveTestCaseHandler);
container
    .bind<GrpcAddSolutionCodeHandler>(TYPES.GrpcAddSolutionCodeHandler)
    .to(GrpcAddSolutionCodeHandler);
container
    .bind<GrpcUpdateSolutionCodeHandler>(TYPES.GrpcUpdateSolutionCodeHandler)
    .to(GrpcUpdateSolutionCodeHandler);
container
    .bind<GrpcRemoveSolutionCodeHandler>(TYPES.GrpcRemoveSolutionCodeHandler)
    .to(GrpcRemoveSolutionCodeHandler);
container
    .bind<GrpcGetProblemPublicHandler>(TYPES.GrpcGetProblemPublicHandler)
    .to(GrpcGetProblemPublicHandler);

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