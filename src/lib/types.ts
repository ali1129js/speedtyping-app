export const DURATIONS = [30, 60] as const;
export type Duration = (typeof DURATIONS)[number];

export const THEME_NAMES = ["light", "dark"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export type Phase = "idle" | "running" | "finished";

export type CharMark = "pending" | "correct" | "incorrect" | "current";

export interface Passage {
  id: string;
  title: string;
  source: string;
  text: string;
}

export interface BestScore {
  wpm: number;
  accuracy: number;
  at: string;
}

export type BestScores = {
  "30"?: BestScore | undefined;
  "60"?: BestScore | undefined;
};
