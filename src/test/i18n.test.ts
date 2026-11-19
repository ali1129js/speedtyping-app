import { describe, expect, it } from "vitest";
import { STRINGS, fill } from "../lib/i18n";
import { passagesFor } from "../lib/texts";
import { LOCALE_NAMES } from "../lib/types";

describe("i18n dictionary", () => {
  it("gives English and German the same keys", () => {
    expect(LOCALE_NAMES).toEqual(["en", "de"]);
    expect(Object.keys(STRINGS.en).sort()).toEqual(Object.keys(STRINGS.de).sort());
    expect(Object.keys(STRINGS.en).length).toBeGreaterThan(10);
  });

  it("fills placeholders in both languages", () => {
    expect(fill(STRINGS.en.best, { duration: 30 })).toBe("Best 30s");
    expect(fill(STRINGS.de.best, { duration: 30 })).toBe("Beste 30s");
  });
});

describe("German practice texts", () => {
  it("offers a set of similar size, including umlauts and ß", () => {
    const en = passagesFor("en");
    const de = passagesFor("de");
    expect(de).toHaveLength(en.length);
    const blob = de.map((p) => p.text).join(" ");
    for (const char of ["ä", "ö", "ü", "ß"]) {
      expect(blob).toContain(char);
    }
    const deChars = de.reduce((sum, p) => sum + p.text.length, 0);
    const enChars = en.reduce((sum, p) => sum + p.text.length, 0);
    expect(deChars).toBeGreaterThan(enChars * 0.8);
    expect(deChars).toBeLessThan(enChars * 1.25);
  });
});
