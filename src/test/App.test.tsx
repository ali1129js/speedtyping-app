import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { CUSTOM_PASSAGE_ID, CUSTOM_TEXT_MAX, CUSTOM_TEXT_MIN } from "../lib/customText";
import { KEYS } from "../lib/storage";
import { passageById, passageTitleForRun } from "../lib/texts";

afterEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders the idle test with the default passage and 30s selected", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Speed Typing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30s" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("0:30");
    expect(
      screen.getByText("Start typing. The timer begins on the first character."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Typing test")).toHaveValue("");
  });

  it("starts the timer on the first character and highlights correct and wrong keys", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText("Typing test");
    await user.type(input, "A xood");
    expect(input).toHaveValue("A xood");
    expect(screen.getByText("Escape restarts the test.")).toBeInTheDocument();
    const letters = [...document.querySelectorAll(".prompt-text .ch")];
    expect(letters[0]).toHaveClass("ch-correct");
    expect(letters[1]).toHaveClass("ch-correct");
    expect(letters[2]).toHaveClass("ch-incorrect");
    expect(letters[3]).toHaveClass("ch-correct");
    expect(letters[6]).toHaveClass("ch-current");
  });

  it("can switch to the pangram, finish the text early, and store a best score", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Text"), "pangram");
    const pangram = passageById("pangram").text;
    await user.type(screen.getByLabelText("Typing test"), pangram);
    const result = await screen.findByRole("region", { name: "Test result" });
    expect(within(result).getByText(/A new best for this length/)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(KEYS.best) ?? "{}") as {
      "30"?: { wpm: number };
    };
    expect(stored["30"]?.wpm).toBeGreaterThan(0);
  });

  it("restarts from the result and from Escape, and can change the duration while idle", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Text"), "pangram");
    await user.type(screen.getByLabelText("Typing test"), passageById("pangram").text);
    await screen.findByRole("region", { name: "Test result" });
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByRole("region", { name: "Test result" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Typing test")).toHaveValue("");

    await user.type(screen.getByLabelText("Typing test"), "The");
    expect(screen.getByLabelText("Typing test")).toHaveValue("The");
    await user.keyboard("{Escape}");
    expect(screen.getByLabelText("Typing test")).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "15s" }));
    expect(screen.getByRole("button", { name: "15s" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("0:15");
    await user.click(screen.getByRole("button", { name: "120s" }));
    expect(screen.getByRole("button", { name: "120s" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("2:00");
    await user.click(screen.getByRole("button", { name: "60s" }));
    expect(screen.getByRole("button", { name: "60s" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("1:00");
  });

  it("stores a separate best and a history row for 15s and 120s", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Text"), "pangram");
    await user.click(screen.getByRole("button", { name: "15s" }));
    await user.type(screen.getByLabelText("Typing test"), passageById("pangram").text);
    await screen.findByRole("region", { name: "Test result" });
    const firstHistory = await screen.findByRole("region", { name: "Recent test history" });
    expect(within(firstHistory).getByText(/15s/)).toBeInTheDocument();
    const after15 = JSON.parse(localStorage.getItem(KEYS.best) ?? "{}") as {
      "15"?: { wpm: number };
      "120"?: { wpm: number };
    };
    expect(after15["15"]?.wpm).toBeGreaterThan(0);
    expect(after15["120"]).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await user.click(screen.getByRole("button", { name: "120s" }));
    await user.type(screen.getByLabelText("Typing test"), passageById("pangram").text);
    await screen.findByRole("region", { name: "Test result" });
    const history = await screen.findByRole("region", { name: "Recent test history" });
    const items = within(history).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("120s");
    expect(items[1]).toHaveTextContent("15s");
    const stored = JSON.parse(localStorage.getItem(KEYS.best) ?? "{}") as {
      "15"?: { wpm: number };
      "120"?: { wpm: number };
    };
    expect(stored["15"]?.wpm).toBeGreaterThan(0);
    expect(stored["120"]?.wpm).toBeGreaterThan(0);
  });

  it("switches theme and stores the choice", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Graphite" }));
    expect(document.documentElement.dataset.theme).toBe("graphite");
    expect(localStorage.getItem(KEYS.theme)).toBe(JSON.stringify("graphite"));
  });

  it("keeps background motion static by default and persists a change", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole("button", { name: "Animated background" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.motion).toBe("static");
    expect(localStorage.getItem(KEYS.motion)).toBeNull();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.motion).toBe("animated");
    expect(localStorage.getItem(KEYS.motion)).toBe(JSON.stringify("animated"));
  });

  it("defaults to English and persists a switch to German", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.documentElement.lang).toBe("en");
    expect(
      screen.getByText("Start typing. The timer begins on the first character."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "DE" }));
    expect(document.documentElement.lang).toBe("de");
    expect(
      screen.getByText("Einfach losschreiben. Die Zeit startet mit dem ersten Zeichen."),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Sprache" })).toBeInTheDocument();
    expect(localStorage.getItem(KEYS.locale)).toBe(JSON.stringify("de"));
  });

  it("restores German from storage on a fresh render", () => {
    localStorage.setItem(KEYS.locale, JSON.stringify("de"));
    render(<App />);
    expect(document.documentElement.lang).toBe("de");
    expect(screen.getByText("Restzeit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "DE" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a recent-test history after a run, with the passage title in that run's locale", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Text"), "pangram");
    await user.type(screen.getByLabelText("Typing test"), passageById("pangram").text);
    const history = await screen.findByRole("region", { name: "Recent test history" });
    expect(within(history).getByText(/Pangram/)).toBeInTheDocument();
    expect(within(history).getByText(/30s/)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(KEYS.history) ?? "[]") as {
      passageId: string;
      locale: string;
      duration: number;
    }[];
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ passageId: "pangram", locale: "en", duration: 30 });

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByRole("region", { name: "Recent test history" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "DE" }));
    await user.selectOptions(screen.getByLabelText("Text"), "pangram");
    await user.type(screen.getByLabelText("Tippstest"), passageById("pangram", "de").text);
    const deHistory = await screen.findByRole("region", { name: "Verlauf der letzten Tests" });
    const items = within(deHistory).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Pangramm");
    expect(items[1]).toHaveTextContent("Pangram");
  });
});

const GERMAN_CUSTOM =
  "Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich, dann ruht er sich aus.";

describe("custom text", () => {
  it("rejects a paste that is too short or too long, in both locales", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Text"), CUSTOM_PASSAGE_ID);
    expect(screen.getByLabelText("Typing test")).toBeDisabled();
    expect(
      screen.getByText("Paste a passage and choose Use this text before starting."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Custom text"), "too short");
    await user.click(screen.getByRole("button", { name: "Use this text" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Enter at least ${CUSTOM_TEXT_MIN} characters.`,
    );
    expect(screen.getByLabelText("Typing test")).toBeDisabled();

    await user.clear(screen.getByLabelText("Custom text"));
    await user.click(screen.getByLabelText("Custom text"));
    await user.paste("x".repeat(CUSTOM_TEXT_MAX + 1));
    await user.click(screen.getByRole("button", { name: "Use this text" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Keep the passage to ${CUSTOM_TEXT_MAX} characters or fewer.`,
    );

    await user.click(screen.getByRole("button", { name: "DE" }));
    await user.selectOptions(screen.getByLabelText("Text"), CUSTOM_PASSAGE_ID);
    await user.clear(screen.getByLabelText("Eigener Text"));
    await user.type(screen.getByLabelText("Eigener Text"), "zu kurz");
    await user.click(screen.getByRole("button", { name: "Diesen Text verwenden" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Gib mindestens ${CUSTOM_TEXT_MIN} Zeichen ein.`,
    );
  });

  it("uses a normal German paste for WPM, can restart, and only stores the text when opted in", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "DE" }));
    await user.selectOptions(screen.getByLabelText("Text"), CUSTOM_PASSAGE_ID);
    await user.type(screen.getByLabelText("Eigener Text"), GERMAN_CUSTOM);
    await user.click(screen.getByRole("button", { name: "Diesen Text verwenden" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(localStorage.getItem(KEYS.custom)).toBeNull();

    const input = screen.getByLabelText("Tippstest");
    expect(input).toBeEnabled();
    await user.type(input, GERMAN_CUSTOM);
    const result = await screen.findByRole("region", { name: "Testergebnis" });
    expect(within(result).getByText(/WPM/)).toBeInTheDocument();
    const history = await screen.findByRole("region", { name: "Verlauf der letzten Tests" });
    expect(within(history).getByText(/Eigener Text/)).toBeInTheDocument();
    expect(
      passageTitleForRun({
        duration: 30,
        wpm: 40,
        accuracy: 96,
        passageId: CUSTOM_PASSAGE_ID,
        locale: "de",
        at: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe("Eigener Text");

    await user.click(screen.getByRole("button", { name: "Nochmal" }));
    expect(screen.queryByRole("region", { name: "Testergebnis" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tippstest")).toHaveValue("");
    expect(screen.getByLabelText("Tippstest")).toBeEnabled();

    await user.click(screen.getByLabelText("Diesen Text auf diesem Gerät merken"));
    expect(JSON.parse(localStorage.getItem(KEYS.custom) ?? "null")).toEqual({
      text: GERMAN_CUSTOM,
    });

    await user.click(screen.getByLabelText("Diesen Text auf diesem Gerät merken"));
    expect(localStorage.getItem(KEYS.custom)).toBeNull();
  });
});
