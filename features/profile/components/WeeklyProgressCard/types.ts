import type { GoalMode } from '../WeightProgress/types';

export interface WeeklyProgressData {
  weekStart: string;
  weekEnd: string;
  startWeight: number;
  currentWeight: number;
  /** Signed raw delta (currentWeight - startWeight); sign is not goal-normalized. */
  weeklyChange: number;
  goalWeight: number;
  goalMode: GoalMode;
  remainingToGoal: number;
  goalAchieved: boolean;
  userName?: string;
}

export type CardFormat = 'portrait' | 'square';
