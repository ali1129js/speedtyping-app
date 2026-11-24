export const CUSTOM_PASSAGE_ID = "custom";

export const CUSTOM_TEXT_MIN = 40;
export const CUSTOM_TEXT_MAX = 2000;

export type CustomTextError = "too-short" | "too-long";

export type CustomTextResult = { ok: true; text: string } | { ok: false; error: CustomTextError };

/** Trim and check a pasted passage. The raw draft is left alone until this is applied. */
export function validateCustomText(value: string): CustomTextResult {
  const text = value.trim();
  if (text.length < CUSTOM_TEXT_MIN) return { ok: false, error: "too-short" };
  if (text.length > CUSTOM_TEXT_MAX) return { ok: false, error: "too-long" };
  return { ok: true, text };
}
