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
import { IUpdateBasicProblemDetailsService } from '@/services/problem/interfaces/updateProblem.service.interface';
import { CreateProblemService } from '@/services/problem/createProblem.service';
import { UpdateProblemService } from '@/services/problem/updateProblem.service';
import { IGetProblemService } from '@/services/problem/interfaces/getProblem.service.interface';
import { GetProblemService } from '@/services/problem/getProblem.service';
import { IListProblemService } from '@/services/problem/interfaces/ListProblem.service.interface';
import { ListProblemService } from '@/services/problem/ListProblem.service';
import { IAddTestCaseService } from '@/services/problem/interfaces/addTestCase.service.interface';
import { AddTestCaseService } from '@/services/problem/addTestCase.service';
import { IBulkUploadTestCase } from '@/services/problem/interfaces/bulkUploadTestCase.service.interface';
import { BulkUploadTestCase } from '@/services/problem/bulkUploadTestCase.service';
import { IRemoveTestCaseService } from '@/services/problem/interfaces/removeTestCase.service.interface';
import { RemoveTestCaseService } from '@/services/problem/removeTestCase.service';
import { IAddSolutionCodeService } from '@/services/problem/interfaces/addSolutionCode.service.interface';
import { AddSolutionCodeService } from '@/services/problem/addSolutionCode.service';
import { IUpdateSolutionCodeService } from '@/services/problem/interfaces/updateSolutionCode.service.interface';
import { UpdateSolutionCodeService } from '@/services/problem/updateSolutionCode.service';
import { IRemoveSolutionCodeService } from '@/services/problem/interfaces/removeSolutionCode.service.interface';
import { RemoveSolutionCodeService } from '@/services/problem/removeSolutionCode.service';
import { ICreateSubmissionService } from '@/services/submission/interfaces/createSubmission.service.interface';
import { CreateSubmissionService } from '@/services/submission/createSubmission.service';
import { IUpdateSubmissionService } from '@/services/submission/interfaces/updateSubmission.service.interface';
import { UpdateSubmissionService } from '@/services/submission/updateSubmission.service';

// Submission Services


const container = new Container();

/**
 * Adapters
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
    .bind<IBulkUploadTestCase>(TYPES.IBulkUploadTestCaseService)
    .to(BulkUploadTestCase);
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

/**
 * Submission Services
 */
container
    .bind<ICreateSubmissionService>(TYPES.ICreateSubmissionService)
    .to(CreateSubmissionService);
container
    .bind<IUpdateSubmissionService>(TYPES.IUpdateSubmissionService)
    .to(UpdateSubmissionService);