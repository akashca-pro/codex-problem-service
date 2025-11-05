import { IFirstSubmission } from "@/db/interface/firstSubmission.interface";
import { BaseRepository } from "../base.repository";

export interface IGlobalScore {
  _id: string; 
  totalScore: number; 
}

export interface IUserCountries {
    _id : string;
    entity : string;
}

export interface ICountryScores {
    _id: { 
        userId: string; 
        country: string;
    };
    totalScore: number;
}

export interface IGlobalProblemsSolved {
    _id: string; 
    count: number;
}

export interface IUsernames {
    _id: string;
    username: string;
}

export interface IFirstSubmissionRepository extends BaseRepository<IFirstSubmission> {
    /**
     * Get Global Scores: Aggregates all scores for each user.
     */
    getGlobalScores() : Promise<IGlobalScore[]>
    /**
     * Get Entity/User Map: Find the *last known country* for each user by
     * sort by date.
     */
    getUserCountries() : Promise<IUserCountries[]>
    /**
     * Get Country-Specific Scores
     */
    getCountryScores() : Promise<ICountryScores[]>

    getGlobalProblemsSolved() : Promise<IGlobalProblemsSolved[]>

    getUsernames(): Promise<IUsernames[]>;

}