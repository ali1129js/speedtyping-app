import { describe, expect, it } from "vitest";
import {
  KEYS,
  bestScoresSchema,
  historySchema,
  preferredTheme,
  readStored,
  recordBest,
  recordHistory,
  themeSchema,
} from "../lib/storage";
import { passageTitleForRun } from "../lib/texts";
import type { HistoryRun } from "../lib/types";

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
    expect(readStored(KEYS.theme, themeSchema, "khaki")).toBe("khaki");
    localStorage.setItem(KEYS.theme, "{nope");
    expect(readStored(KEYS.theme, themeSchema, "khaki")).toBe("khaki");
    localStorage.setItem(KEYS.best, JSON.stringify({ "30": { wpm: "fast" } }));
    expect(readStored(KEYS.best, bestScoresSchema, {})).toEqual({});
    localStorage.setItem(KEYS.best, JSON.stringify({ "30": { wpm: 42, accuracy: 98, at: "x" } }));
    expect(readStored(KEYS.best, bestScoresSchema, {})["30"]?.wpm).toBe(42);
  });
});

describe("preferredTheme", () => {
  it("follows the operating system", () => {
    expect(preferredTheme((query) => ({ matches: query.includes("dark") }))).toBe("graphite");
    expect(preferredTheme(() => ({ matches: false }))).toBe("khaki");
  });
});

function run(overrides: Partial<HistoryRun> = {}): HistoryRun {
  return {
    duration: 30,
    wpm: 40,
    accuracy: 96,
    passageId: "harbour",
    locale: "en",
    at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("recordHistory", () => {
  it("puts the newest run first and caps the list at 10", () => {
    let history: HistoryRun[] = [];
    for (let index = 1; index <= 11; index += 1) {
      history = recordHistory(
        history,
        run({
          wpm: index,
          at: `2026-01-${String(index).padStart(2, "0")}T00:00:00.000Z`,
        }),
      );
    }
    expect(history).toHaveLength(10);
    expect(history[0]?.wpm).toBe(11);
    expect(history[0]?.at).toBe("2026-01-11T00:00:00.000Z");
    expect(history[9]?.wpm).toBe(2);
    expect(history.map((item) => item.wpm)).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  });
});

describe("history storage", () => {
  it("ignores corrupt history and keeps a valid list", () => {
    expect(readStored(KEYS.history, historySchema, [])).toEqual([]);
    localStorage.setItem(KEYS.history, "{nope");
    expect(readStored(KEYS.history, historySchema, [])).toEqual([]);
    localStorage.setItem(KEYS.history, JSON.stringify([{ wpm: "fast" }]));
    expect(readStored(KEYS.history, historySchema, [])).toEqual([]);
    const saved = [run()];
    localStorage.setItem(KEYS.history, JSON.stringify(saved));
    expect(readStored(KEYS.history, historySchema, [])).toEqual(saved);
  });
});

describe("passageTitleForRun", () => {
  it("uses the locale stored with the run, not the current UI language", () => {
    expect(passageTitleForRun(run({ passageId: "harbour", locale: "en" }))).toBe("Harbour morning");
    expect(passageTitleForRun(run({ passageId: "harbour", locale: "de" }))).toBe("Morgen am Hafen");
    expect(passageTitleForRun(run({ passageId: "pangram", locale: "de" }))).toBe("Pangramm");
  });
});

describe("best-score migration", () => {
  it("keeps an old 30/60 store and can add 15 and 120 beside it", () => {
    const legacy = {
      "30": { wpm: 40, accuracy: 96, at: "2026-01-01T00:00:00.000Z" },
      "60": { wpm: 38, accuracy: 94, at: "2026-01-02T00:00:00.000Z" },
    };
    localStorage.setItem(KEYS.best, JSON.stringify(legacy));
    const loaded = readStored(KEYS.best, bestScoresSchema, {});
    expect(loaded).toEqual(legacy);
    expect(loaded["15"]).toBeUndefined();
    expect(loaded["120"]).toBeUndefined();

    const next = recordBest(
      recordBest(loaded, 15, { wpm: 50, accuracy: 99, at: "2026-01-03T00:00:00.000Z" }),
      120,
      { wpm: 20, accuracy: 90, at: "2026-01-04T00:00:00.000Z" },
    );
    expect(next["30"]).toEqual(legacy["30"]);
    expect(next["60"]).toEqual(legacy["60"]);
    expect(next["15"]?.wpm).toBe(50);
    expect(next["120"]?.wpm).toBe(20);
  });
});
