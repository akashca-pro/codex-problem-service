import { LeaderboardData, LeaderboardUser } from "@/dtos/Leaderboard.dto";

export interface ILeaderboard {
    /**
     * Initializes the resync method.
     */
    init(): Promise<void>;
    /**
     * Adds a new user or updates an existing user's score and entity.
     * @param user The user data to add or update.
     */
    addUser(user: LeaderboardUser): Promise<void>;

    /**
     * Atomically adds (or subtracts) a value to a user's score.
     * @param userId The user's ID.
     * @param entity An empty string "" will keep the user's current entity.
     * @param scoreIncrement The amount to add.
     */
    incrementScore(userId: string, entity: string, scoreIncrement: number): Promise<void>;

    incrementProblemsSolved(userId: string): Promise<void>;

    /**
     * Atomically subtracts a value from a user's score.
     * @param userId The user's ID.
     * @param entity An empty string "" will keep the user's current entity.
     * @param scoreDecrement The amount to subtract.
     */
    decrementScore(userId: string, entity: string, scoreDecrement: number): Promise<void>;

    /**
     * Deletes a user from all rankings (global and entity).
     * @param userId The ID of the user to remove.
     */
    removeUser(userId: string): Promise<void>;

    /**
     * Moves a user from their current entity to a new one, preserving their score.
     * @param userId The user's ID.
     * @param newEntity The new entity to move the user to.
     */
    updateEntityByUserId(userId: string, newEntity: string): Promise<void>;

    /**
     * Fetches the complete leaderboard data view for a single user.
     * @param userId The user's ID.
     * @returns A promise that resolves with the user's complete data.
     */
    getUserLeaderboardData(userId: string): Promise<LeaderboardData>;

    /**
     * Gets the top K users in the global leaderboard.
     * @returns A promise that resolves with a list of the top K users.
     */
    getTopKGlobal(k : number): Promise<LeaderboardUser[]>;

    /**
     * Gets the top K users for a specific entity.
     * @param entity The entity's name (e.g., "IN").
     * @returns A promise that resolves with a list of the top K users.
     */
    getTopKEntity(entity: string, k: number): Promise<LeaderboardUser[]>;

    /**
     * Gets a user's 0-based global rank.
     * @param userId The user's ID.
     * @returns A promise that resolves with the rank, or -1 if not found.
     */
    getRankGlobal(userId: string): Promise<number>;

    /**
     * Gets a user's 0-based rank within their entity.
     * @param userId The user's ID.
     * @returns A promise that resolves with the rank, or -1 if no entity or not found.
     */
    getRankEntity(userId: string): Promise<number>;

    /**
     * Gets a user's current score.
     * @param userId The user's ID.
     * @returns A promise that resolves with the score, or 0 if not found.
     */
    getUserScore(userId: string): Promise<number>;

    /**
     * Gets a user's current entity.
     * @param userId The user's ID.
     * @returns A promise that resolves with the entity string, or "" if none/not found.
     */
    getUserEntity(userId: string): Promise<string>;

    /**
     * Deletes all Redis keys associated with the leaderboard's namespace.
     * @returns A promise that resolves when the data is cleared.
     */
    forceClearLeaderboard(): Promise<void>;
}
