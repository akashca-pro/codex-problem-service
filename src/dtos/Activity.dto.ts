export interface IActivity {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface IRecentActivity {
  title: string;
  difficulty: string;
  status: string;
  createdAt: Date;
}