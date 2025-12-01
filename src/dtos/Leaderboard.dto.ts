/**
 * Represents a user in the leaderboard.
 */
export interface LeaderboardUser {
    id: string;
    /** * The optional entity or group for this user (e.g., "US", "UK").
     * An empty string or 'undefined' means no entity.
     */
    entity?: string;
    score: number;
    problemsSolved?: number;
    username?: string;
    rank?:number;
}


/**
 * Represents the complete leaderboard data view for a specific user.
 */
export interface LeaderboardData {
    userId: string;
    username?: string;
    score: number;
    entity: string;
    /** * The user's 0-based global rank (0 = top). 
     * Will be -1 if the user is not found or not ranked.
     */
    globalRank: number;
    /**
     * The user's 0-based rank within their entity.
     * Will be -1 if the user has no entity or is not ranked.
     */
    entityRank: number;
}