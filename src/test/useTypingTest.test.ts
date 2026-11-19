import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTypingTest } from "../hooks/useTypingTest";

afterEach(() => {
  vi.useRealTimers();
});

describe("useTypingTest", () => {
  it("stays idle until the first character, then finishes when the duration runs out", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
    const { result } = renderHook(() => useTypingTest("hello world", 30));
    expect(result.current.phase).toBe("idle");

    act(() => {
      result.current.onTyped("h");
    });
    expect(result.current.phase).toBe("running");
    expect(result.current.typed).toBe("h");

    act(() => {
      vi.advanceTimersByTime(29_000);
    });
    expect(result.current.phase).toBe("running");
    expect(result.current.remaining).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current.phase).toBe("finished");
    expect(result.current.remaining).toBe(0);
  });

  it("finishes early when the whole text is typed, and restart returns to idle", () => {
    const { result } = renderHook(() => useTypingTest("hi", 60));
    act(() => {
      result.current.onTyped("hi");
    });
    expect(result.current.phase).toBe("finished");
    act(() => {
      result.current.restart();
    });
    expect(result.current.phase).toBe("idle");
    expect(result.current.typed).toBe("");
  });
});
