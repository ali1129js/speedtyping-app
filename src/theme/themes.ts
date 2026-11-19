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
  danger: string;
  onDanger: string;
}

export const THEME_LABELS: Readonly<Record<ThemeName, string>> = {
  light: "Light",
  dark: "Dark",
};

export const THEMES: Readonly<Record<ThemeName, ThemeTokens>> = {
  light: {
    bg: "#f3efe6",
    surface: "#fffcf7",
    text: "#1c1917",
    textMuted: "#57534e",
    border: "#78716c",
    accent: "#0f766e",
    onAccent: "#ffffff",
    focus: "#1d4ed8",
    correct: "#047857",
    incorrect: "#b42318",
    currentBg: "#fde68a",
    danger: "#b42318",
    onDanger: "#ffffff",
  },
  dark: {
    bg: "#12100e",
    surface: "#1c1917",
    text: "#f5f0e8",
    textMuted: "#d6d3d1",
    border: "#a8a29e",
    accent: "#2dd4bf",
    onAccent: "#0b1412",
    focus: "#fbbf24",
    correct: "#6ee7b7",
    incorrect: "#fca5a5",
    currentBg: "#78350f",
    danger: "#fca5a5",
    onDanger: "#1f1212",
  },
};

export function applyTheme(name: ThemeName, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = name;
  const tokens = THEMES[name];
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value);
  }
  root.style.colorScheme = name;
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
