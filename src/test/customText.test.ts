import { describe, expect, it } from "vitest";
import { CUSTOM_TEXT_MAX, CUSTOM_TEXT_MIN, validateCustomText } from "../lib/customText";

describe("validateCustomText", () => {
  it("rejects a passage that is too short, even with surrounding space", () => {
    expect(validateCustomText("   kurz   ")).toEqual({ ok: false, error: "too-short" });
    expect(validateCustomText("x".repeat(CUSTOM_TEXT_MIN - 1))).toEqual({
      ok: false,
      error: "too-short",
    });
  });

  it("rejects a passage that is too long", () => {
    expect(validateCustomText("x".repeat(CUSTOM_TEXT_MAX + 1))).toEqual({
      ok: false,
      error: "too-long",
    });
  });

  it("accepts a normal paste, trims it, and keeps German characters", () => {
    const pasted =
      "  Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich, dann ruht er sich aus.  ";
    const result = validateCustomText(pasted);
    expect(result).toEqual({ ok: true, text: pasted.trim() });
    if (result.ok) {
      expect(result.text).toContain("ö");
      expect(result.text).toContain("ß");
      expect(result.text.length).toBeGreaterThanOrEqual(CUSTOM_TEXT_MIN);
      expect(result.text.length).toBeLessThanOrEqual(CUSTOM_TEXT_MAX);
    }
  });
});
