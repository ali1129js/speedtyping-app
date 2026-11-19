import { useEffect, useRef } from "react";
import { marksFor } from "../lib/engine";
import type { Phase } from "../lib/types";

interface Props {
  target: string;
  typed: string;
  phase: Phase;
  onTyped: (value: string) => void;
}

export function Prompt({ target, typed, phase, onTyped }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const marks = marksFor(target, typed);
  const disabled = phase === "finished";

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled, target]);

  return (
    <div className="prompt card" onClick={() => inputRef.current?.focus()}>
      <label htmlFor="typing-input" className="sr-only">
        Typing test
      </label>
      <p className="prompt-text" aria-hidden="true">
        {marks.map((item, index) => (
          <span key={index} className={`ch ch-${item.mark}`}>
            {item.char}
          </span>
        ))}
      </p>
      <textarea
        ref={inputRef}
        id="typing-input"
        className="prompt-input"
        value={typed}
        disabled={disabled}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onTyped(event.target.value)}
        aria-label="Typing test"
      />
    </div>
  );
}
