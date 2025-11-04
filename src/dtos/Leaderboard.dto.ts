/**
 * Represents a user in the leaderboard.
 */
export interface LeaderboardUser {
    /** The unique identifier for the user (e.g., "player42"). */
    id: string;

    /** * The optional entity or group for this user (e.g., "US", "UK").
     * An empty string or 'undefined' means no entity.
     */
    entity?: string;

    // The user's score.
    score: number;

    // problems solved
    problemsSolved?: number;

}


/**
 * Represents the complete leaderboard data view for a specific user.
 */
export interface LeaderboardData {
    /** The user's unique ID. */
    userId: string;

    /** The user's current score. */
    score: number;

    /** The user's current entity (or an empty string if none). */
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

    /** A list of the top-k users globally. */
    topKGlobal: LeaderboardUser[];

    /** A list of the top-k users in this user's entity (empty if no entity). */
    topKEntity: LeaderboardUser[];
}