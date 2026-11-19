import type { CharMark, Duration } from "./types";

export interface CharView {
  char: string;
  mark: CharMark;
}

export interface TypingStats {
  correct: number;
  incorrect: number;
  wpm: number;
  accuracy: number;
}

/** One mark per character in the target, plus any extra typed characters past the end. */
export function marksFor(target: string, typed: string): CharView[] {
  const views: CharView[] = [];
  const length = Math.max(target.length, typed.length);
  for (let index = 0; index < length; index += 1) {
    const char = target[index] ?? typed[index] ?? "";
    const typedChar = typed[index];
    let mark: CharMark;
    if (index === typed.length && index < target.length) mark = "current";
    else if (typedChar === undefined) mark = "pending";
    else if (index < target.length && typedChar === target[index]) mark = "correct";
    else mark = "incorrect";
    views.push({ char, mark });
  }
  return views;
}

export function countTyped(target: string, typed: string): { correct: number; incorrect: number } {
  let correct = 0;
  let incorrect = 0;
  for (let index = 0; index < typed.length; index += 1) {
    if (index < target.length && typed[index] === target[index]) correct += 1;
    else incorrect += 1;
  }
  return { correct, incorrect };
}

/** Standard net WPM: correct characters, divided by five, divided by minutes elapsed. */
export function wordsPerMinute(correct: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || correct <= 0) return 0;
  return correct / 5 / (elapsedMs / 60_000);
}

/** Correct keystrokes as a percentage of every character typed. Nothing typed yet is 100%. */
export function accuracyPercent(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total === 0) return 100;
  return (correct / total) * 100;
}

export function statsFor(target: string, typed: string, elapsedMs: number): TypingStats {
  const { correct, incorrect } = countTyped(target, typed);
  return {
    correct,
    incorrect,
    wpm: wordsPerMinute(correct, elapsedMs),
    accuracy: accuracyPercent(correct, incorrect),
  };
}

export function remainingMs(durationSec: Duration, elapsedMs: number): number {
  return Math.max(0, durationSec * 1000 - elapsedMs);
}

export function hasFinished(
  target: string,
  typed: string,
  elapsedMs: number,
  durationSec: Duration,
): boolean {
  if (elapsedMs >= durationSec * 1000) return true;
  return typed.length >= target.length;
}

export function formatWpm(wpm: number): string {
  return String(Math.round(wpm));
}

export function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy)}%`;
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
