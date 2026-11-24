export const DURATIONS = [15, 30, 60, 120] as const;
export type Duration = (typeof DURATIONS)[number];
export type DurationKey = `${Duration}`;

export const THEME_NAMES = ["khaki", "graphite", "midnight"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export const LEGACY_THEMES: Readonly<Record<string, ThemeName>> = {
  light: "khaki",
  dark: "graphite",
  darkgrey: "graphite",
};

export const MOTION_NAMES = ["static", "animated"] as const;
export type MotionName = (typeof MOTION_NAMES)[number];

export const LOCALE_NAMES = ["en", "de"] as const;
export type LocaleName = (typeof LOCALE_NAMES)[number];

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
  [K in DurationKey]?: BestScore | undefined;
};

export const HISTORY_LIMIT = 10;

export interface HistoryRun {
  duration: Duration;
  wpm: number;
  accuracy: number;
  passageId: string;
  locale: LocaleName;
  at: string;
}

export type HistoryRuns = HistoryRun[];
