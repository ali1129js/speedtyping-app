import type { Passage } from "./types";

export const PASSAGES: readonly Passage[] = [
  {
    id: "workshop",
    title: "Workshop notes",
    source: "Original text",
    text: "A good workshop starts with a clear question and a short list of tools already on the table. People talk over each other at first, then someone writes a sentence on the board that everyone can live with. The useful part is not the neat plan at the end. It is the moment when a vague worry becomes a task with a name, a person, and a time to look again.",
  },
  {
    id: "harbour",
    title: "Harbour morning",
    source: "Original text",
    text: "The harbour was still when we arrived, the water the colour of tea in a thick mug. Gulls walked the wall as if they had paid rent for the stones. A fishing boat idled at the dock, ropes wet and dark, and the air smelled of salt and diesel. We bought bread from the first stall that opened, sat on the steps, and watched the light move up the far hill, house by house, until the whole town was awake.",
  },
  {
    id: "alice",
    title: "Alice on the bank",
    source: "Lewis Carroll, Alice's Adventures in Wonderland (public domain)",
    text: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice, 'without pictures or conversations?' So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies.",
  },
  {
    id: "pride",
    title: "A truth acknowledged",
    source: "Jane Austen, Pride and Prejudice (public domain)",
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
  },
  {
    id: "pangram",
    title: "Pangram",
    source: "Traditional English pangram",
    text: "The quick brown fox jumps over the lazy dog.",
  },
];

export const DEFAULT_PASSAGE_ID = "workshop";

function firstPassage(): Passage {
  const passage = PASSAGES[0];
  if (passage === undefined) {
    throw new Error("PASSAGES is empty");
  }
  return passage;
}

export function passageById(id: string): Passage {
  return PASSAGES.find((passage) => passage.id === id) ?? firstPassage();
}
