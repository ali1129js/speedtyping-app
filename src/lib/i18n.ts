import type { LocaleName } from "./types";

export interface UIStrings {
  skipToContent: string;
  title: string;
  subtitle: string;
  documentTitle: string;
  metaDescription: string;
  theme: string;
  animatedBackground: string;
  animatedBackgroundReduced: string;
  language: string;
  localeEn: string;
  localeDe: string;
  testLength: string;
  text: string;
  restart: string;
  timeLeft: string;
  wpm: string;
  accuracy: string;
  best: string;
  startHint: string;
  runningHint: string;
  finishedHint: string;
  result: string;
  resultAria: string;
  resultLine: string;
  newBest: string;
  yourBest: string;
  tryAgain: string;
  typingTest: string;
  history: string;
  historyAria: string;
  customText: string;
  customSource: string;
  customPlaceholder: string;
  customApply: string;
  customRemember: string;
  customTooShort: string;
  customTooLong: string;
  customNeeded: string;
}

export const STRINGS: Record<LocaleName, UIStrings> = {
  en: {
    skipToContent: "Skip to content",
    title: "Speed Typing",
    subtitle: "A timed test with live WPM and accuracy. Formerly WordBeater.",
    documentTitle: "Speed Typing",
    metaDescription:
      "Timed typing test with live WPM, accuracy, and character highlighting. English and German, in three themes.",
    theme: "Theme",
    animatedBackground: "Animated background",
    animatedBackgroundReduced: "Animated background (reduced motion is on)",
    language: "Language",
    localeEn: "EN",
    localeDe: "DE",
    testLength: "Test length",
    text: "Text",
    restart: "Restart",
    timeLeft: "Time left",
    wpm: "WPM",
    accuracy: "Accuracy",
    best: "Best {duration}s",
    startHint: "Start typing. The timer begins on the first character.",
    runningHint: "Escape restarts the test.",
    finishedHint: "The test has finished. Escape or Try again starts a new one.",
    result: "Result",
    resultAria: "Test result",
    resultLine: "{wpm} WPM at {accuracy} accuracy.",
    newBest: "A new best for this length.",
    yourBest: "Your best {duration}s is {wpm} WPM.",
    tryAgain: "Try again",
    typingTest: "Typing test",
    history: "Recent tests",
    historyAria: "Recent test history",
    customText: "Custom text",
    customSource: "Your own text",
    customPlaceholder: "Paste a passage to practise.",
    customApply: "Use this text",
    customRemember: "Remember this text on this device",
    customTooShort: "Enter at least {min} characters.",
    customTooLong: "Keep the passage to {max} characters or fewer.",
    customNeeded: "Paste a passage and choose Use this text before starting.",
  },
  de: {
    skipToContent: "Zum Inhalt springen",
    title: "Speed Typing",
    subtitle: "Ein zeitgesteuerter Test mit live WPM und Genauigkeit. Früher WordBeater.",
    documentTitle: "Speed Typing",
    metaDescription:
      "Zeitgesteuerter Tippstest mit live WPM, Genauigkeit und Zeichenhervorhebung. Deutsch und Englisch, in drei Themes.",
    theme: "Thema",
    animatedBackground: "Animierter Hintergrund",
    animatedBackgroundReduced: "Animierter Hintergrund (reduzierte Bewegung ist aktiv)",
    language: "Sprache",
    localeEn: "EN",
    localeDe: "DE",
    testLength: "Testdauer",
    text: "Text",
    restart: "Neu starten",
    timeLeft: "Restzeit",
    wpm: "WPM",
    accuracy: "Genauigkeit",
    best: "Beste {duration}s",
    startHint: "Einfach losschreiben. Die Zeit startet mit dem ersten Zeichen.",
    runningHint: "Escape startet den Test neu.",
    finishedHint: "Der Test ist zu Ende. Escape oder Nochmal führt zu einem neuen Durchgang.",
    result: "Ergebnis",
    resultAria: "Testergebnis",
    resultLine: "{wpm} WPM bei {accuracy} Genauigkeit.",
    newBest: "Eine neue Bestleistung für diese Dauer.",
    yourBest: "Deine beste {duration}s-Leistung ist {wpm} WPM.",
    tryAgain: "Nochmal",
    typingTest: "Tippstest",
    history: "Letzte Tests",
    historyAria: "Verlauf der letzten Tests",
    customText: "Eigener Text",
    customSource: "Eigener Text",
    customPlaceholder: "Einen eigenen Text zum Üben einfügen.",
    customApply: "Diesen Text verwenden",
    customRemember: "Diesen Text auf diesem Gerät merken",
    customTooShort: "Gib mindestens {min} Zeichen ein.",
    customTooLong: "Der Text darf höchstens {max} Zeichen lang sein.",
    customNeeded: "Füge einen Text ein und wähle Diesen Text verwenden, bevor du startest.",
  },
};

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : match,
  );
}

export function applyLocale(
  locale: LocaleName,
  root: HTMLElement = document.documentElement,
): void {
  root.lang = locale;
  const strings = STRINGS[locale];
  document.title = strings.documentTitle;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", strings.metaDescription);
}
