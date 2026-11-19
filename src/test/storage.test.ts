import { describe, expect, it } from "vitest";
import { KEYS, preferredTheme, readStored, recordBest, themeSchema } from "../lib/storage";
import { bestScoresSchema } from "../lib/storage";

describe("recordBest", () => {
  const first = { wpm: 40, accuracy: 96, at: "2026-01-01T00:00:00.000Z" };
  const better = { wpm: 45, accuracy: 90, at: "2026-01-02T00:00:00.000Z" };
  const worse = { wpm: 30, accuracy: 100, at: "2026-01-03T00:00:00.000Z" };
  const sameWpmBetterAcc = { wpm: 40, accuracy: 99, at: "2026-01-04T00:00:00.000Z" };

  it("stores the first score and replaces it only when WPM is higher", () => {
    const afterFirst = recordBest({}, 30, first);
    expect(afterFirst["30"]).toEqual(first);
    expect(recordBest(afterFirst, 30, better)["30"]).toEqual(better);
    expect(recordBest(afterFirst, 30, worse)["30"]).toEqual(first);
  });

  it("keeps a same-WPM score with the higher accuracy, and does not touch the other duration", () => {
    const current = recordBest({ "60": first }, 30, first);
    const next = recordBest(current, 30, sameWpmBetterAcc);
    expect(next["30"]).toEqual(sameWpmBetterAcc);
    expect(next["60"]).toEqual(first);
  });
});

describe("readStored", () => {
  it("returns the fallback for missing or invalid values", () => {
    expect(readStored(KEYS.theme, themeSchema, "light")).toBe("light");
    localStorage.setItem(KEYS.theme, "{nope");
    expect(readStored(KEYS.theme, themeSchema, "light")).toBe("light");
    localStorage.setItem(KEYS.best, JSON.stringify({ "30": { wpm: "fast" } }));
    expect(readStored(KEYS.best, bestScoresSchema, {})).toEqual({});
    localStorage.setItem(KEYS.best, JSON.stringify({ "30": { wpm: 42, accuracy: 98, at: "x" } }));
    expect(readStored(KEYS.best, bestScoresSchema, {})["30"]?.wpm).toBe(42);
  });
});

describe("preferredTheme", () => {
  it("follows the operating system", () => {
    expect(preferredTheme((query) => ({ matches: query.includes("dark") }))).toBe("dark");
    expect(preferredTheme(() => ({ matches: false }))).toBe("light");
  });
});
