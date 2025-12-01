export interface IActivity {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface IRecentActivity {
  title: string;
  difficulty: string;
  status: string;
  language : string;
  createdAt: Date;
}

export interface ISolvedByDifficulty {
  difficulty : string;
  count : number;
}

export interface IAdminDashboardSubmissionStats {
  totalSubmissions : number;
  todaysSubmissions : number;
  languageWise : {
    language : string
    count : number
  }[]
}

export interface IAdminDashboardProblemStats {
  totalProblems : number;
  todaysProblems : number;
  difficultyWise : {
    difficulty : string
    count : number
  }[]
}