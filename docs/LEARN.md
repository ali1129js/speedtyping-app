# Learning notes

Short explanations of the ideas this project actually uses, and why they matter. Each one points at a file.

## WPM is a formula, not a guess

Words per minute is counted as correct characters, divided by five (the usual "word" length), divided by the minutes that have actually elapsed. Accuracy is correct keystrokes over every character you typed, including mistakes and extras past the end of the text. Both are pure functions: give them the same numbers and you always get the same result, which is why they are easy to test.

See `wordsPerMinute` and `accuracyPercent` in `src/lib/engine.ts`, and the worked examples in `src/test/engine.test.ts`.

## Derived highlighting, not a second copy of the text

The prompt on screen is the target passage plus what you have typed so far. `marksFor` walks those two strings and returns a mark for each character: correct, incorrect, current, or still pending. The React component only renders those marks. There is no parallel array to keep in sync, so a backspace cannot leave a stale colour behind.

See `src/lib/engine.ts` and `src/components/Prompt.tsx`.

## Don't compute the next state while rendering

The 2019 WordBeater component called `startMatch` inside `render`. That compared the input to the current word and, on a match, called `setState` during render. React can run render more than once, so that kind of side effect is a source of bugs (double scoring, updates in the wrong phase). In this rewrite, typing goes through `onTyped`, the timer runs in an effect, and finish is decided by `hasFinished`. Render only reads state and returns JSX.

See `src/hooks/useTypingTest.ts`. The old call lived in `src/Components/WordInput.js` in commit `7e4e1ed`.

## Effects need a cleanup

The ticking clock is a `setInterval`. If you forget to clear it when the test ends, or when the component unmounts, the interval keeps running and can try to update state on a component that is gone. The effect returns a function that clears the interval, and it also re-runs when the typed text changes so a finished passage is detected immediately, not up to 100 ms later.

See the interval effect in `src/hooks/useTypingTest.ts`.

## Keyboard use without a mouse

The hidden textarea in the prompt is a real form control with a label, so a screen reader can find it and a phone can still open the keyboard. Tab moves through the length buttons, the text list, Restart, and the prompt. Escape always restarts. Duration and text can be changed with the keyboard while the test is idle, and are locked while it is running so a stray Tab-and-key cannot reset mid-test.

See `src/components/Prompt.tsx` and `src/App.tsx`.

## Validated best scores

The best WPM for 30s and 60s is written to `localStorage` as JSON, then checked with a Zod schema on the way back in. Corrupt data is ignored, so a broken value cannot crash the page. A new result replaces the stored one only when the WPM is higher, or when the WPM is the same and the accuracy is better.

See `src/lib/storage.ts` and `src/test/storage.test.ts`.
