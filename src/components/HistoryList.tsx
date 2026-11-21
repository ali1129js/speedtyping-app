import { formatAccuracy, formatWpm } from "../lib/engine";
import { fill, type UIStrings } from "../lib/i18n";
import { passageTitleForRun } from "../lib/texts";
import type { HistoryRuns, LocaleName } from "../lib/types";

function formatRunTime(at: string, locale: LocaleName): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return at;
  return date.toLocaleString(locale === "de" ? "de-DE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface HistoryListProps {
  runs: HistoryRuns;
  uiLocale: LocaleName;
  strings: UIStrings;
}

export function HistoryList({ runs, uiLocale, strings }: HistoryListProps) {
  if (runs.length === 0) return null;

  return (
    <section className="card history" aria-label={strings.historyAria}>
      <h2>{strings.history}</h2>
      <ol className="history-list">
        {runs.map((run) => (
          <li key={`${run.at}-${run.passageId}-${run.duration}`}>
            <span className="history-score">
              {fill(strings.resultLine, {
                wpm: formatWpm(run.wpm),
                accuracy: formatAccuracy(run.accuracy),
              })}
            </span>
            <span className="history-meta">
              {run.duration}s · {passageTitleForRun(run)} · {formatRunTime(run.at, uiLocale)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
