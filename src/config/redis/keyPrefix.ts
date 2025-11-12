export const REDIS_PREFIX = {
  PROBLEM_CACHE: 'public:problem:details:',
  PROBLEM_CACHE_ADMIN: 'admin:problem:details:',
  CODE_MANAGE_PROBLEM_DETAILS: 'codemanage:problem:details:',

  DASHBOARD_HEATMAP: 'dashboard:heatmap:',                // + userId
  DASHBOARD_STREAK: 'dashboard:streak:',                  // + userId
  DASHBOARD_LEADERBOARD: 'dashboard:leaderboard:',        // + userId
  DASHBOARD_PROBLEMS_SOLVED: 'dashboard:problemsSolved:', // + userId
  DASHBOARD_PROBLEMS_SOLVED_BY_DIFFICULTY: 'dashboard:problemsSolvedByDifficulty:', // + userId
  DASHBOARD_RECENT_ACTIVITY: 'dashboard:recentActivity:', // + userId
  DASHBOARD_ADMIN_STATS : 'dashboard:adminStats',

  GLOBAL_LEADERBOARD: 'leaderboard:global:',
  COUNTRY_LEADERBOARD: 'leaderboard:country:',            // + countryCode

  USER_STATS: 'user:stats:',                              // + userId
  USER_ACTIVITY: 'user:activity:',                        // + userId
} as const;