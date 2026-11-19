import { useEffect, useMemo, useRef, useState } from "react";
import { Prompt } from "./components/Prompt";
import { StatsBar } from "./components/StatsBar";
import { useStoredState } from "./hooks/useStoredState";
import { useTypingTest } from "./hooks/useTypingTest";
import { formatAccuracy, formatWpm } from "./lib/engine";
import {
  KEYS,
  bestScoresSchema,
  motionSchema,
  preferredTheme,
  recordBest,
  themeSchema,
} from "./lib/storage";
import { DEFAULT_PASSAGE_ID, PASSAGES, passageById } from "./lib/texts";
import { DURATIONS } from "./lib/types";
import type { BestScores, Duration, MotionName, ThemeName } from "./lib/types";
import { MotionToggle } from "./theme/MotionToggle";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { applyMotion, applyTheme, prefersReducedMotion } from "./theme/themes";

export function App() {
  const [theme, setTheme] = useStoredState<ThemeName>(KEYS.theme, themeSchema, preferredTheme());
  const [motion, setMotion] = useStoredState<MotionName>(KEYS.motion, motionSchema, "static");
  const reducedMotion = prefersReducedMotion();
  const [best, setBest] = useStoredState<BestScores>(KEYS.best, bestScoresSchema, {});
  const [duration, setDuration] = useState<Duration>(30);
  const [passageId, setPassageId] = useState(DEFAULT_PASSAGE_ID);
  const passage = passageById(passageId);
  const test = useTypingTest(passage.text, duration);
  const recorded = useRef(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(
    () => applyMotion(motion, document.documentElement, reducedMotion),
    [motion, reducedMotion],
  );

  useEffect(() => {
    if (test.phase === "idle") {
      recorded.current = false;
      setIsNewBest(false);
    }
  }, [test.phase]);

  useEffect(() => {
    if (test.phase !== "finished" || recorded.current) return;
    recorded.current = true;
    const candidate = {
      wpm: test.stats.wpm,
      accuracy: test.stats.accuracy,
      at: new Date().toISOString(),
    };
    const previous = best[String(duration) as "30" | "60"];
    const improved =
      previous === undefined ||
      candidate.wpm > previous.wpm ||
      (candidate.wpm === previous.wpm && candidate.accuracy > previous.accuracy);
    setIsNewBest(improved);
    setBest((current) => recordBest(current, duration, candidate));
  }, [test.phase, test.stats.wpm, test.stats.accuracy, duration, best, setBest]);

  const restart = test.restart;
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        restart();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restart]);

  const bestForDuration = best[String(duration) as "30" | "60"];
  const canChangeSetup = test.phase !== "running";

  const status = useMemo(() => {
    if (test.phase === "idle") return "Start typing. The timer begins on the first character.";
    if (test.phase === "running") return "Escape restarts the test.";
    return "The test has finished. Escape or Try again starts a new one.";
  }, [test.phase]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <div>
          <h1 className="app-title">Speed Typing</h1>
          <p className="app-sub">A timed test with live WPM and accuracy. Formerly WordBeater.</p>
        </div>
        <div className="theme-tools">
          <ThemeSwitcher value={theme} onChange={setTheme} />
          <MotionToggle value={motion} onChange={setMotion} reducedMotion={reducedMotion} />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="app-main">
        <div className="setup">
          <div role="group" aria-label="Test length" className="segmented">
            {DURATIONS.map((value) => (
              <button
                key={value}
                type="button"
                className="segment"
                aria-pressed={duration === value}
                disabled={!canChangeSetup && duration !== value}
                onClick={() => setDuration(value)}
              >
                {value}s
              </button>
            ))}
          </div>
          <label className="select-field">
            <span>Text</span>
            <select
              name="passage"
              value={passageId}
              disabled={!canChangeSetup}
              onChange={(event) => setPassageId(event.target.value)}
            >
              {PASSAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="button" onClick={restart}>
            Restart
          </button>
        </div>

        <p className="passage-source">{passage.source}</p>

        <StatsBar
          duration={duration}
          remaining={test.remaining}
          phase={test.phase}
          stats={test.stats}
          best={bestForDuration}
        />

        <Prompt
          target={passage.text}
          typed={test.typed}
          phase={test.phase}
          onTyped={test.onTyped}
        />

        <p className="hint" aria-live="polite">
          {status}
        </p>

        {test.phase === "finished" ? (
          <section className="card results" aria-label="Test result">
            <h2>Result</h2>
            <p>
              <strong>{formatWpm(test.stats.wpm)} WPM</strong> at{" "}
              {formatAccuracy(test.stats.accuracy)} accuracy.
              {isNewBest
                ? " A new best for this length."
                : bestForDuration
                  ? ` Your best ${duration}s is ${formatWpm(bestForDuration.wpm)} WPM.`
                  : ""}
            </p>
            <button type="button" className="button button-primary" onClick={restart}>
              Try again
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
