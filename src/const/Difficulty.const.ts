export const DIFFICULTY = {
    EASY : 'easy',
    MEDIUM : 'medium',
    HARD : 'hard'
}

export type Difficulty = typeof DIFFICULTY[keyof typeof DIFFICULTY];