export const REDIS_PREFIX = {
  PROBLEM_CACHE: 'public:problem:details:',
  PROBLEM_CACHE_ADMIN: 'admin:problem:details:',
  CODE_MANAGE_PROBLEM_DETAILS: 'codemanage:problem:details:',
  
  DASHBOARD_HEATMAP: (userId : string) => `dashboard:${userId}:heatmap`,                
  DASHBOARD_STREAK: (userId : string) => `dashboard:${userId}:streak`,                  
  DASHBOARD_LEADERBOARD: (userId : string) => `dashboard:${userId}:leaderboard`,        
  DASHBOARD_PROBLEMS_SOLVED: (userId : string) => `dashboard:${userId}:problemsSolved`, 
  DASHBOARD_PROBLEMS_SOLVED_BY_DIFFICULTY: (userId : string) => `dashboard:${userId}:problemsSolvedByDifficulty`, 
  DASHBOARD_RECENT_ACTIVITY: (userId : string) => `dashboard:${userId}:recentActivity`, 
  DASHBOARD_ADMIN_STATS : 'dashboard:adminStats',

  GLOBAL_LEADERBOARD: 'leaderboard:global:',
  COUNTRY_LEADERBOARD: 'leaderboard:country:',            

  USER_STATS: 'user:stats:',                              
  USER_ACTIVITY: 'user:activity:',                       
  USER_PROBLEM_FULL_SOLUTION : 'user:problem:fullSolution:',
  USER_PROBLEM_PREVIOUS_HINTS : 'user:problem:previousHints:',
} as const;