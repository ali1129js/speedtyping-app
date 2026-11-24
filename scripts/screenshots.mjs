// Usage: APP_URL=http://127.0.0.1:4177/ node scripts/screenshots.mjs <outDir>
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const outDir = process.argv[2] ?? "shots";
const url = process.env.APP_URL ?? "http://127.0.0.1:4177/";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const typedByLocale = {
  en: "A good workxhop",
  de: "Ein guter Workxhop",
};

async function shot(name, { theme, locale, motion = "static", width, height, colorScheme }) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme,
    reducedMotion: motion === "animated" ? "no-preference" : "reduce",
    locale: locale === "de" ? "de-DE" : "en-GB",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.error("PAGE ERROR", e.message));
  await page.addInitScript(
    ([t, m, l]) => {
      localStorage.setItem("speedtyping.v1.theme", JSON.stringify(t));
      localStorage.setItem("speedtyping.v1.motion", JSON.stringify(m));
      localStorage.setItem("speedtyping.v1.locale", JSON.stringify(l));
    },
    [theme, motion, locale],
  );
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".prompt-text");
  const label = locale === "de" ? "Tippstest" : "Typing test";
  const input = page.getByLabel(label);
  await input.focus();
  await input.type(typedByLocale[locale], { delay: 40 });
  await page.waitForTimeout(400);
  const path = `${outDir}/${name}`;
  await page.screenshot({ path, fullPage: true });
  const overflowX = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  console.log(`wrote ${path}${overflowX ? " (WARN horizontal overflow)" : ""}`);
  await context.close();
  return overflowX;
}

const overflows = [];
for (const [name, opts] of [
  [
    "en-khaki-1280.png",
    { theme: "khaki", locale: "en", width: 1280, height: 900, colorScheme: "light" },
  ],
  [
    "en-graphite-1280.png",
    { theme: "graphite", locale: "en", width: 1280, height: 900, colorScheme: "dark" },
  ],
  [
    "de-khaki-1280.png",
    { theme: "khaki", locale: "de", width: 1280, height: 900, colorScheme: "light" },
  ],
  [
    "de-graphite-1280.png",
    { theme: "graphite", locale: "de", width: 1280, height: 900, colorScheme: "dark" },
  ],
]) {
  if (await shot(name, opts)) overflows.push(name);
}

await browser.close();
if (overflows.length) {
  console.error("horizontal overflow in:", overflows.join(", "));
  process.exit(1);
}
