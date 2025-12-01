import { DIFFICULTY } from "./Difficulty.const";

export const SCORE_MAP = {
    [DIFFICULTY.EASY]: 10,
    [DIFFICULTY.MEDIUM]: 25,
    [DIFFICULTY.HARD]: 40,
} as const

const HINT_PENALTY = {
  [DIFFICULTY.EASY]: 2,
  [DIFFICULTY.MEDIUM]: 5,
  [DIFFICULTY.HARD]: 8,
} as const;


export type ScoreMap = typeof SCORE_MAP[keyof typeof SCORE_MAP];

export function calculateScore(difficulty : string, hintsUsed : number) {
  const base = SCORE_MAP[difficulty];
  const penalty = HINT_PENALTY[difficulty] * hintsUsed;

  if (hintsUsed >= 5) return 0; 
  return Math.max(0, base - penalty);
}
