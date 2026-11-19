import { formatAccuracy, formatClock, formatWpm } from "../lib/engine";
import type { TypingStats } from "../lib/engine";
import type { BestScore, Duration, Phase } from "../lib/types";

interface Props {
  duration: Duration;
  remaining: number;
  phase: Phase;
  stats: TypingStats;
  best: BestScore | undefined;
}

export function StatsBar({ duration, remaining, phase, stats, best }: Props) {
  const timeLabel = phase === "finished" ? "0:00" : formatClock(remaining);
  return (
    <dl className="stats">
      <div>
        <dt>Time left</dt>
        <dd>
          <span aria-live="polite" role="timer">
            {timeLabel}
          </span>
          <span className="stat-sub"> / {duration}s</span>
        </dd>
      </div>
      <div>
        <dt>WPM</dt>
        <dd aria-live="polite">{formatWpm(stats.wpm)}</dd>
      </div>
      <div>
        <dt>Accuracy</dt>
        <dd aria-live="polite">{formatAccuracy(stats.accuracy)}</dd>
      </div>
      <div>
        <dt>Best {duration}s</dt>
        <dd>{best ? `${formatWpm(best.wpm)} WPM` : "—"}</dd>
      </div>
    </dl>
  );
}
