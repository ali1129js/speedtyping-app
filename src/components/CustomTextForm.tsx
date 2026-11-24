import { fill, type UIStrings } from "../lib/i18n";
import { CUSTOM_TEXT_MAX, CUSTOM_TEXT_MIN, type CustomTextError } from "../lib/customText";

interface Props {
  draft: string;
  error: CustomTextError | null;
  remember: boolean;
  disabled: boolean;
  strings: UIStrings;
  onDraftChange: (value: string) => void;
  onRememberChange: (value: boolean) => void;
  onApply: () => void;
}

export function CustomTextForm({
  draft,
  error,
  remember,
  disabled,
  strings,
  onDraftChange,
  onRememberChange,
  onApply,
}: Props) {
  const errorMessage =
    error === "too-short"
      ? fill(strings.customTooShort, { min: CUSTOM_TEXT_MIN })
      : error === "too-long"
        ? fill(strings.customTooLong, { max: CUSTOM_TEXT_MAX })
        : null;

  return (
    <div className="custom-text">
      <label className="custom-text-label" htmlFor="custom-passage">
        {strings.customText}
      </label>
      <textarea
        id="custom-passage"
        className="custom-text-input"
        value={draft}
        disabled={disabled}
        placeholder={strings.customPlaceholder}
        rows={5}
        onChange={(event) => onDraftChange(event.target.value)}
      />
      {errorMessage ? (
        <p className="field-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="custom-text-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={disabled}
          onClick={onApply}
        >
          {strings.customApply}
        </button>
        <label className="custom-text-remember">
          <input
            type="checkbox"
            checked={remember}
            disabled={disabled}
            onChange={(event) => onRememberChange(event.target.checked)}
          />
          {strings.customRemember}
        </label>
      </div>
    </div>
  );
}
