import type { GoalMode } from '../WeightProgress/types';

export interface JourneyChartPoint {
  date: string;
  weight: number;
}

export interface WeeklyProgressData {
  /** Date of the very first logged entry. */
  journeyStart: string;
  /** Date of the most recent logged entry. */
  journeyEnd: string;
  startWeight: number;
  currentWeight: number;
  /** Signed raw delta (currentWeight - startWeight) over the whole journey; sign is not goal-normalized. */
  totalChange: number;
  goalWeight: number;
  goalMode: GoalMode;
  remainingToGoal: number;
  goalAchieved: boolean;
  userName?: string;
  /** Full weigh-in history (oldest first) used to draw the journey chart. */
  chartPoints: JourneyChartPoint[];
}

export type CardFormat = 'portrait' | 'square';
