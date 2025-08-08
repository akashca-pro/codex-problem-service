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

import { IUpdateProblemService } from '@/services/problem/interfaces/updateProblem.service.interface';
import { CreateProblemService } from '@/services/problem/createProblem.service';
import { UpdateProblemService } from '@/services/problem/updateProblem.service';
import { IGetProblemService } from '@/services/problem/interfaces/getProblem.service.interface';
import { GetProblemService } from '@/services/problem/getProblem.service';

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
    .bind<IUpdateProblemService>(TYPES.IUpdateProblemService)
    .to(UpdateProblemService);
container
    .bind<IGetProblemService>(TYPES.IGetProblemService)
    .to(GetProblemService);
