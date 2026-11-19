import { useCallback, useEffect, useMemo, useState } from "react";
import { hasFinished, normalizeTyping, remainingMs, statsFor } from "../lib/engine";
import type { Duration, Phase } from "../lib/types";

export interface TypingTestState {
  phase: Phase;
  typed: string;
  elapsedMs: number;
  remaining: number;
  stats: ReturnType<typeof statsFor>;
  onTyped: (value: string) => void;
  restart: () => void;
}

export function useTypingTest(target: string, duration: Duration): TypingTestState {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const restart = useCallback(() => {
    setPhase("idle");
    setTyped("");
    setStartedAt(null);
    setElapsedMs(0);
  }, []);

  useEffect(() => {
    restart();
  }, [target, duration, restart]);

  useEffect(() => {
    if (phase !== "running" || startedAt === null) return undefined;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);
      if (hasFinished(target, typed, elapsed, duration)) {
        setPhase("finished");
        setElapsedMs(Math.min(elapsed, duration * 1000));
      }
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [phase, startedAt, target, typed, duration]);

  const onTyped = useCallback(
    (value: string) => {
      if (phase === "finished") return;
      if (phase === "idle") {
        if (value.length === 0) return;
        setPhase("running");
        setStartedAt(Date.now());
        setElapsedMs(0);
      }
      setTyped(normalizeTyping(value));
    },
    [phase],
  );

  const capElapsed = phase === "finished" ? Math.min(elapsedMs, duration * 1000) : elapsedMs;
  const stats = useMemo(() => statsFor(target, typed, capElapsed), [target, typed, capElapsed]);
  const remaining = remainingMs(duration, capElapsed);

  return { phase, typed, elapsedMs: capElapsed, remaining, stats, onTyped, restart };
}
