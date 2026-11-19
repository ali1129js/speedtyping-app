import type { ThemeName } from "../lib/types";

export interface ThemeTokens {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  onAccent: string;
  focus: string;
  correct: string;
  incorrect: string;
  currentBg: string;
  currentFg: string;
  danger: string;
  onDanger: string;
}

export const THEME_LABELS: Readonly<Record<ThemeName, string>> = {
  khaki: "Khaki",
  darkgrey: "Dark grey",
  midnight: "Midnight",
};

export const COLOR_SCHEME: Readonly<Record<ThemeName, "light" | "dark">> = {
  khaki: "light",
  darkgrey: "dark",
  midnight: "dark",
};

export const GLOSS = {
  cobalt: "#2F6BFF",
  onCobalt: "#FFFFFF",
  pewter: "#7A8394",
  onPewter: "#111111",
  jade: "#00B386",
  onJade: "#111111",
  garnet: "#D42D47",
  onGarnet: "#FFFFFF",
  saffron: "#FFB000",
  onSaffron: "#111111",
  lagoon: "#00C2D1",
  onLagoon: "#111111",
} as const;

export const THEMES: Readonly<Record<ThemeName, ThemeTokens>> = {
  khaki: {
    bg: "#D8CDAE",
    surface: "#EBE4D0",
    text: "#2A2418",
    textMuted: "#554C3E",
    border: "#6F6550",
    accent: GLOSS.cobalt,
    onAccent: GLOSS.onCobalt,
    focus: "#214BB3",
    correct: "#00624A",
    incorrect: "#9F2235",
    currentBg: GLOSS.saffron,
    currentFg: "#111111",
    danger: GLOSS.garnet,
    onDanger: GLOSS.onGarnet,
  },
  darkgrey: {
    bg: "#2A2C30",
    surface: "#3A3D43",
    text: "#E6E6E6",
    textMuted: "#C5C8CE",
    border: "#8A8E96",
    accent: GLOSS.cobalt,
    onAccent: GLOSS.onCobalt,
    focus: "#8DAEFF",
    correct: "#26BE98",
    incorrect: "#E9929F",
    currentBg: GLOSS.saffron,
    currentFg: "#111111",
    danger: GLOSS.garnet,
    onDanger: GLOSS.onGarnet,
  },
  midnight: {
    bg: "#1B1428",
    surface: "#2A2238",
    text: "#EDE7F6",
    textMuted: "#C9C2D6",
    border: "#7A7288",
    accent: GLOSS.cobalt,
    onAccent: GLOSS.onCobalt,
    focus: "#789FFF",
    correct: "#26BE98",
    incorrect: "#E78C9A",
    currentBg: GLOSS.saffron,
    currentFg: "#111111",
    danger: GLOSS.garnet,
    onDanger: GLOSS.onGarnet,
  },
};

export function applyTheme(name: ThemeName, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = name;
  root.style.colorScheme = COLOR_SCHEME[name];
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastMeets(a: string, b: string, min: number): boolean {
  return Number(contrastRatio(a, b).toFixed(2)) >= min;
}

export type { MotionName } from "../lib/types";

export function prefersReducedMotion(
  match: (query: string) => { matches: boolean } = (query) => window.matchMedia(query),
): boolean {
  return match("(prefers-reduced-motion: reduce)").matches;
}

export function effectiveMotion(
  stored: import("../lib/types").MotionName,
  reduced: boolean,
): import("../lib/types").MotionName {
  return reduced ? "static" : stored;
}

export function applyMotion(
  name: import("../lib/types").MotionName,
  root: HTMLElement = document.documentElement,
  reduced: boolean = prefersReducedMotion(),
): void {
  root.dataset.motion = effectiveMotion(name, reduced);
}
