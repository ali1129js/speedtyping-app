import { useEffect, useMemo, useRef, useState } from "react";
import { CustomTextForm } from "./components/CustomTextForm";
import { HistoryList } from "./components/HistoryList";
import { Prompt } from "./components/Prompt";
import { StatsBar } from "./components/StatsBar";
import { useStoredState } from "./hooks/useStoredState";
import { useTypingTest } from "./hooks/useTypingTest";
import { formatAccuracy, formatWpm } from "./lib/engine";
import { STRINGS, applyLocale, fill } from "./lib/i18n";
import {
  CUSTOM_PASSAGE_ID,
  CUSTOM_TEXT_MIN,
  type CustomTextError,
  validateCustomText,
} from "./lib/customText";
import {
  KEYS,
  bestScoresSchema,
  clearStored,
  customTextSchema,
  historySchema,
  localeSchema,
  motionSchema,
  preferredTheme,
  readOptionalStored,
  recordBest,
  recordHistory,
  themeSchema,
  writeStored,
} from "./lib/storage";
import { DEFAULT_PASSAGE_ID, passageById, passagesFor } from "./lib/texts";
import { DURATIONS } from "./lib/types";
import type {
  BestScores,
  Duration,
  HistoryRuns,
  LocaleName,
  MotionName,
  ThemeName,
} from "./lib/types";
import { LocaleToggle } from "./theme/LocaleToggle";
import { MotionToggle } from "./theme/MotionToggle";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { applyMotion, applyTheme, prefersReducedMotion } from "./theme/themes";

export function App() {
  const [theme, setTheme] = useStoredState<ThemeName>(KEYS.theme, themeSchema, preferredTheme());
  const [motion, setMotion] = useStoredState<MotionName>(KEYS.motion, motionSchema, "static");
  const [locale, setLocale] = useStoredState<LocaleName>(KEYS.locale, localeSchema, "en");
  const reducedMotion = prefersReducedMotion();
  const [best, setBest] = useStoredState<BestScores>(KEYS.best, bestScoresSchema, {});
  const [history, setHistory] = useStoredState<HistoryRuns>(KEYS.history, historySchema, []);
  const [duration, setDuration] = useState<Duration>(30);
  const [passageId, setPassageId] = useState(DEFAULT_PASSAGE_ID);
  const [customDraft, setCustomDraft] = useState("");
  const [customApplied, setCustomApplied] = useState("");
  const [rememberCustom, setRememberCustom] = useState(false);
  const [customError, setCustomError] = useState<CustomTextError | null>(null);
  const strings = STRINGS[locale];
  const passages = passagesFor(locale);
  const customReady = customApplied.trim().length >= CUSTOM_TEXT_MIN;
  const passage =
    passageId === CUSTOM_PASSAGE_ID
      ? {
          id: CUSTOM_PASSAGE_ID,
          title: strings.customText,
          source: strings.customSource,
          text: customApplied,
        }
      : passageById(passageId, locale);
  const testReady = passageId !== CUSTOM_PASSAGE_ID || customReady;
  const test = useTypingTest(testReady ? passage.text : "", duration);
  const recorded = useRef(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    const stored = readOptionalStored(KEYS.custom, customTextSchema);
    if (stored === undefined) return;
    setCustomDraft(stored.text);
    setCustomApplied(stored.text);
    setRememberCustom(true);
  }, []);

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(
    () => applyMotion(motion, document.documentElement, reducedMotion),
    [motion, reducedMotion],
  );
  useEffect(() => applyLocale(locale), [locale]);

  useEffect(() => {
    if (passageId === CUSTOM_PASSAGE_ID) return;
    if (!passages.some((item) => item.id === passageId)) {
      setPassageId(DEFAULT_PASSAGE_ID);
    }
  }, [passages, passageId]);

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
    setHistory((current) =>
      recordHistory(current, {
        duration,
        wpm: candidate.wpm,
        accuracy: candidate.accuracy,
        passageId,
        locale,
        at: candidate.at,
      }),
    );
  }, [
    test.phase,
    test.stats.wpm,
    test.stats.accuracy,
    duration,
    best,
    setBest,
    setHistory,
    passageId,
    locale,
  ]);

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
    if (passageId === CUSTOM_PASSAGE_ID && !customReady) return strings.customNeeded;
    if (test.phase === "idle") return strings.startHint;
    if (test.phase === "running") return strings.runningHint;
    return strings.finishedHint;
  }, [test.phase, strings, passageId, customReady]);

  function applyCustomText() {
    const result = validateCustomText(customDraft);
    if (!result.ok) {
      setCustomError(result.error);
      return;
    }
    setCustomError(null);
    setCustomDraft(result.text);
    setCustomApplied(result.text);
    if (rememberCustom) writeStored(KEYS.custom, { text: result.text });
  }

  function changeRemember(next: boolean) {
    setRememberCustom(next);
    if (!next) {
      clearStored(KEYS.custom);
      return;
    }
    const result = validateCustomText(customApplied || customDraft);
    if (result.ok) writeStored(KEYS.custom, { text: result.text });
  }

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        {strings.skipToContent}
      </a>
      <header className="app-header">
        <div>
          <h1 className="app-title">{strings.title}</h1>
          <p className="app-sub">{strings.subtitle}</p>
        </div>
        <div className="theme-tools">
          <LocaleToggle value={locale} onChange={setLocale} strings={strings} />
          <ThemeSwitcher value={theme} onChange={setTheme} label={strings.theme} />
          <MotionToggle
            value={motion}
            onChange={setMotion}
            reducedMotion={reducedMotion}
            label={strings.animatedBackground}
            reducedLabel={strings.animatedBackgroundReduced}
          />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="app-main">
        <div className="setup">
          <div role="group" aria-label={strings.testLength} className="segmented">
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
            <span>{strings.text}</span>
            <select
              name="passage"
              value={passage.id}
              disabled={!canChangeSetup}
              onChange={(event) => setPassageId(event.target.value)}
            >
              {passages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
              <option value={CUSTOM_PASSAGE_ID}>{strings.customText}</option>
            </select>
          </label>
          <button type="button" className="button" onClick={restart}>
            {strings.restart}
          </button>
        </div>

        {passageId === CUSTOM_PASSAGE_ID ? (
          <CustomTextForm
            draft={customDraft}
            error={customError}
            remember={rememberCustom}
            disabled={!canChangeSetup}
            strings={strings}
            onDraftChange={(value) => {
              setCustomDraft(value);
              setCustomError(null);
            }}
            onRememberChange={changeRemember}
            onApply={applyCustomText}
          />
        ) : null}

        <p className="passage-source">{passage.source}</p>

        <StatsBar
          duration={duration}
          remaining={test.remaining}
          phase={test.phase}
          stats={test.stats}
          best={bestForDuration}
          strings={strings}
        />

        <Prompt
          target={testReady ? passage.text : ""}
          typed={test.typed}
          phase={test.phase}
          onTyped={testReady ? test.onTyped : () => undefined}
          label={strings.typingTest}
          disabled={!testReady}
        />

        <p className="hint" aria-live="polite">
          {status}
        </p>

        {test.phase === "finished" ? (
          <section className="card results" aria-label={strings.resultAria}>
            <h2>{strings.result}</h2>
            <p>
              <strong>
                {fill(strings.resultLine, {
                  wpm: formatWpm(test.stats.wpm),
                  accuracy: formatAccuracy(test.stats.accuracy),
                })}
              </strong>
              {isNewBest
                ? ` ${strings.newBest}`
                : bestForDuration
                  ? ` ${fill(strings.yourBest, {
                      duration,
                      wpm: formatWpm(bestForDuration.wpm),
                    })}`
                  : ""}
            </p>
            <button type="button" className="button button-primary" onClick={restart}>
              {strings.tryAgain}
            </button>
          </section>
        ) : null}

        {test.phase === "finished" ? (
          <HistoryList runs={history} uiLocale={locale} strings={strings} />
        ) : null}
      </main>
    </div>
  );
}
