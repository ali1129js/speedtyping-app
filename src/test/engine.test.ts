import { describe, expect, it } from "vitest";
import {
  accuracyPercent,
  countTyped,
  formatAccuracy,
  formatClock,
  formatWpm,
  hasFinished,
  marksFor,
  normalizeTyping,
  remainingMs,
  statsFor,
  wordsPerMinute,
} from "../lib/engine";

describe("countTyped and marksFor", () => {
  it("marks correct, incorrect, current and pending characters", () => {
    const marks = marksFor("cat", "ca");
    expect(marks.map((item) => item.mark)).toEqual(["correct", "correct", "current"]);
  });

  it("marks a wrong character and keeps the rest pending", () => {
    const marks = marksFor("cat", "cx");
    expect(marks.map((item) => `${item.char}:${item.mark}`)).toEqual([
      "c:correct",
      "a:incorrect",
      "t:current",
    ]);
    expect(countTyped("cat", "cx")).toEqual({ correct: 1, incorrect: 1 });
  });

  it("treats extra characters past the end as incorrect", () => {
    const marks = marksFor("hi", "hit");
    expect(marks.map((item) => `${item.char}:${item.mark}`)).toEqual([
      "h:correct",
      "i:correct",
      "t:incorrect",
    ]);
    expect(countTyped("hi", "hit")).toEqual({ correct: 2, incorrect: 1 });
  });
});

describe("wordsPerMinute", () => {
  it("is zero when no time has passed or nothing is correct", () => {
    expect(wordsPerMinute(10, 0)).toBe(0);
    expect(wordsPerMinute(0, 30_000)).toBe(0);
  });

  it("uses correct characters over five, over minutes elapsed", () => {
    // 100 correct characters in 30 seconds = 40 WPM
    expect(wordsPerMinute(100, 30_000)).toBe(40);
    // 60 correct characters in 60 seconds = 12 WPM
    expect(wordsPerMinute(60, 60_000)).toBe(12);
  });
});

describe("accuracyPercent", () => {
  it("is 100% before anything is typed", () => {
    expect(accuracyPercent(0, 0)).toBe(100);
  });

  it("is correct over all typed characters", () => {
    expect(accuracyPercent(8, 2)).toBe(80);
  });
});

describe("statsFor", () => {
  it("combines counts, WPM and accuracy", () => {
    const stats = statsFor("hello world", "hello worxx", 30_000);
    expect(stats.correct).toBe(9);
    expect(stats.incorrect).toBe(2);
    expect(stats.wpm).toBeCloseTo(3.6);
    expect(stats.accuracy).toBeCloseTo(81.818, 2);
  });
});

describe("hasFinished and remainingMs", () => {
  it("ends when the clock runs out", () => {
    expect(hasFinished("abc", "a", 30_000, 30)).toBe(true);
    expect(hasFinished("abc", "a", 29_999, 30)).toBe(false);
    expect(remainingMs(30, 29_000)).toBe(1000);
    expect(remainingMs(30, 40_000)).toBe(0);
    expect(remainingMs(15, 0)).toBe(15_000);
    expect(remainingMs(120, 60_000)).toBe(60_000);
  });

  it("ends when the typist reaches the end of the text, even early", () => {
    expect(hasFinished("abc", "abc", 5_000, 30)).toBe(true);
    expect(hasFinished("abc", "abx", 5_000, 30)).toBe(true);
    expect(hasFinished("abc", "ab", 5_000, 30)).toBe(false);
  });
});

describe("formatters", () => {
  it("rounds WPM and accuracy, and formats the clock", () => {
    expect(formatWpm(41.4)).toBe("41");
    expect(formatAccuracy(81.6)).toBe("82%");
    expect(formatClock(30_000)).toBe("0:30");
    expect(formatClock(1000)).toBe("0:01");
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(90_000)).toBe("1:30");
  });
});

describe("NFC normalisation", () => {
  it("treats precomposed and combining umlauts as the same typable character", () => {
    const nfc = "Käse".normalize("NFC");
    const nfd = "Käse".normalize("NFD");
    expect(nfd).not.toBe(nfc);
    expect(nfd.length).toBeGreaterThan(nfc.length);
    expect(normalizeTyping(nfd)).toBe(nfc);
    expect(countTyped(nfc, nfd)).toEqual({ correct: nfc.length, incorrect: 0 });
    expect(marksFor(nfc, nfd).every((item) => item.mark === "correct")).toBe(true);
    expect(hasFinished(nfc, nfd, 1_000, 30)).toBe(true);
  });

  it("counts ß as a single typable character", () => {
    expect(countTyped("groß", "groß")).toEqual({ correct: 4, incorrect: 0 });
    expect(marksFor("groß", "gross")[3]?.mark).toBe("incorrect");
  });
});
