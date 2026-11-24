import { z } from "zod";
import { CUSTOM_TEXT_MAX, CUSTOM_TEXT_MIN } from "./customText";
import type { BestScore, BestScores, Duration, HistoryRun, HistoryRuns, ThemeName } from "./types";
import { HISTORY_LIMIT, LEGACY_THEMES, LOCALE_NAMES, MOTION_NAMES, THEME_NAMES } from "./types";

export const KEYS = {
  theme: "speedtyping.v1.theme",
  motion: "speedtyping.v1.motion",
  best: "speedtyping.v1.best",
  locale: "speedtyping.v1.locale",
  history: "speedtyping.v1.history",
  custom: "speedtyping.v1.custom",
} as const;

export const motionSchema = z.enum(MOTION_NAMES);

export const localeSchema = z.enum(LOCALE_NAMES);

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

export function clearStored(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readOptionalStored<T>(key: string, schema: z.ZodType<T>): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export const customTextSchema = z.object({
  text: z.string().min(CUSTOM_TEXT_MIN).max(CUSTOM_TEXT_MAX),
});

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

const historyRunSchema = z.object({
  duration: z.union([z.literal(30), z.literal(60)]),
  wpm: z.number().nonnegative(),
  accuracy: z.number().min(0).max(100),
  passageId: z.string().min(1),
  locale: localeSchema,
  at: z.string().min(1),
});

export const historySchema = z
  .array(historyRunSchema)
  .transform((runs) => runs.slice(0, HISTORY_LIMIT));

export function recordHistory(current: HistoryRuns, run: HistoryRun): HistoryRuns {
  return [run, ...current].slice(0, HISTORY_LIMIT);
}
