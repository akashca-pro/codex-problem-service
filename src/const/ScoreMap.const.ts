import { DIFFICULTY } from "./Difficulty.const";

export const SCORE_MAP = {
    [DIFFICULTY.EASY]: 2,
    [DIFFICULTY.MEDIUM]: 5,
    [DIFFICULTY.HARD]: 8,
} as const

export type ScoreMap = typeof SCORE_MAP[keyof typeof SCORE_MAP];