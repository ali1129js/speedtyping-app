import { z } from "zod";
import type { BestScore, BestScores, Duration, ThemeName } from "./types";
import { LEGACY_THEMES, MOTION_NAMES, THEME_NAMES } from "./types";

export const KEYS = {
  theme: "speedtyping.v1.theme",
  motion: "speedtyping.v1.motion",
  best: "speedtyping.v1.best",
} as const;

export const motionSchema = z.enum(MOTION_NAMES);

export const themeSchema = z.preprocess(
  (value) => (typeof value === "string" && value in LEGACY_THEMES ? LEGACY_THEMES[value] : value),
  z.enum(THEME_NAMES),
);

const bestScoreSchema = z.object({
  wpm: z.number().nonnegative(),
  accuracy: z.number().min(0).max(100),
  at: z.string().min(1),
});

export const bestScoresSchema = z.object({
  "30": bestScoreSchema.optional(),
  "60": bestScoreSchema.optional(),
});

export function readStored<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function preferredTheme(
  match: (query: string) => { matches: boolean } = (query) => window.matchMedia(query),
): ThemeName {
  return match("(prefers-color-scheme: dark)").matches ? "graphite" : "khaki";
}

export function recordBest(
  current: BestScores,
  duration: Duration,
  candidate: BestScore,
): BestScores {
  const key = String(duration) as "30" | "60";
  const existing = current[key];
  if (
    existing &&
    (existing.wpm > candidate.wpm ||
      (existing.wpm === candidate.wpm && existing.accuracy >= candidate.accuracy))
  ) {
    return current;
  }
  return { ...current, [key]: candidate };
}
