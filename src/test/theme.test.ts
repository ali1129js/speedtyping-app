import { describe, expect, it } from "vitest";
import { THEMES, contrastRatio } from "../theme/themes";
import type { ThemeTokens } from "../theme/themes";
import type { ThemeName } from "../lib/types";

const pairs: Array<[ThemeName, keyof ThemeTokens, keyof ThemeTokens, number]> = [
  ["light", "bg", "text", 4.5],
  ["light", "surface", "text", 4.5],
  ["light", "surface", "textMuted", 4.5],
  ["light", "accent", "onAccent", 4.5],
  ["light", "surface", "correct", 4.5],
  ["light", "surface", "incorrect", 4.5],
  ["light", "currentBg", "text", 4.5],
  ["light", "bg", "border", 3],
  ["light", "bg", "focus", 3],
  ["dark", "bg", "text", 4.5],
  ["dark", "surface", "text", 4.5],
  ["dark", "surface", "textMuted", 4.5],
  ["dark", "accent", "onAccent", 4.5],
  ["dark", "surface", "correct", 4.5],
  ["dark", "surface", "incorrect", 4.5],
  ["dark", "currentBg", "text", 4.5],
  ["dark", "bg", "border", 3],
  ["dark", "bg", "focus", 3],
];

describe("theme contrast", () => {
  it.each(pairs)("%s %s against %s is at least %s:1", (theme, a, b, min) => {
    expect(contrastRatio(THEMES[theme][a], THEMES[theme][b])).toBeGreaterThanOrEqual(min);
  });
});
