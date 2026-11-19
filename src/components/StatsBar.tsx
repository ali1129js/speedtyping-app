import { fill, type UIStrings } from "../lib/i18n";
import { formatAccuracy, formatClock, formatWpm } from "../lib/engine";
import type { TypingStats } from "../lib/engine";
import type { BestScore, Duration, Phase } from "../lib/types";

interface Props {
  duration: Duration;
  remaining: number;
  phase: Phase;
  stats: TypingStats;
  best: BestScore | undefined;
  strings: UIStrings;
}

export function StatsBar({ duration, remaining, phase, stats, best, strings }: Props) {
  const timeLabel = phase === "finished" ? "0:00" : formatClock(remaining);
  return (
    <dl className="stats">
      <div>
        <dt>{strings.timeLeft}</dt>
        <dd>
          <span aria-live="polite" role="timer">
            {timeLabel}
          </span>
          <span className="stat-sub"> / {duration}s</span>
        </dd>
      </div>
      <div>
        <dt>{strings.wpm}</dt>
        <dd aria-live="polite">{formatWpm(stats.wpm)}</dd>
      </div>
      <div>
        <dt>{strings.accuracy}</dt>
        <dd aria-live="polite">{formatAccuracy(stats.accuracy)}</dd>
      </div>
      <div>
        <dt>{fill(strings.best, { duration })}</dt>
        <dd>{best ? `${formatWpm(best.wpm)} ${strings.wpm}` : "—"}</dd>
      </div>
    </dl>
  );
}
