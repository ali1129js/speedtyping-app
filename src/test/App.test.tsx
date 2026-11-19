import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { KEYS } from "../lib/storage";
import { passageById } from "../lib/texts";

afterEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders the idle test with the default passage and 30s selected", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Speed Typing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30s" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("0:30");
    expect(screen.getByText("Start typing. The timer begins on the first character.")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "60s" }));
    expect(screen.getByRole("button", { name: "60s" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("1:00");
  });

  it("switches theme and stores the choice", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(KEYS.theme)).toBe(JSON.stringify("dark"));
  });
});
