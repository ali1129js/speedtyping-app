import { LOCALE_NAMES } from "../lib/types";
import type { LocaleName } from "../lib/types";
import type { UIStrings } from "../lib/i18n";

interface Props {
  value: LocaleName;
  onChange: (locale: LocaleName) => void;
  strings: UIStrings;
}

export function LocaleToggle({ value, onChange, strings }: Props) {
  const labels: Record<LocaleName, string> = {
    en: strings.localeEn,
    de: strings.localeDe,
  };
  return (
    <div role="group" aria-label={strings.language} className="segmented">
      {LOCALE_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          className="segment"
          aria-pressed={value === name}
          onClick={() => onChange(name)}
        >
          {labels[name]}
        </button>
      ))}
    </div>
  );
}
