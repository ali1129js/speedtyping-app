import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyLocale } from "./lib/i18n";
import {
  KEYS,
  localeSchema,
  motionSchema,
  preferredTheme,
  readStored,
  themeSchema,
} from "./lib/storage";
import { applyMotion, applyTheme } from "./theme/themes";
import "./index.css";

applyTheme(readStored(KEYS.theme, themeSchema, preferredTheme()));
applyMotion(readStored(KEYS.motion, motionSchema, "static"));
applyLocale(readStored(KEYS.locale, localeSchema, "en"));

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
