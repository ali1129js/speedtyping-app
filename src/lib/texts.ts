import type { LocaleName, Passage } from "./types";

const ENGLISH_PASSAGES: readonly Passage[] = [
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

const GERMAN_PASSAGES: readonly Passage[] = [
  {
    id: "workshop",
    title: "Workshop-Notizen",
    source: "Eigener Text",
    text: "Ein guter Workshop beginnt mit einer klaren Frage und einer kurzen Liste von Werkzeugen, die schon auf dem Tisch liegen. Zuerst reden die Leute durcheinander, dann schreibt jemand einen Satz an die Tafel, mit dem alle leben können. Der nützliche Teil ist nicht der saubere Plan am Ende. Es ist der Moment, in dem aus einer vagen Sorge eine Aufgabe mit einem Namen, einer Person und einem Termin wird.",
  },
  {
    id: "harbour",
    title: "Morgen am Hafen",
    source: "Eigener Text",
    text: "Der Hafen lag still, als wir ankamen, das Wasser wie Tee in einem dicken Becher. Möwen liefen auf der Mauer, als hätten sie die Steine gemietet. Ein Fischerboot dümpelte am Steg, die Taue nass und dunkel, und die Luft roch nach Salz und Diesel. Wir kauften Brot am ersten Stand, der öffnete, saßen auf den Stufen und sahen, wie das Licht den fernen Hang hinaufwanderte, Haus für Haus, bis die ganze Stadt wach war.",
  },
  {
    id: "grimm",
    title: "Rotkäppchen",
    source: "Gebrüder Grimm, Kinder- und Hausmärchen (gemeinfrei)",
    text: "Es war einmal eine kleine süße Dirne, die hatte jedermann lieb, der sie nur ansah, am allerliebsten aber ihre Großmutter, die wusste gar nicht, was sie alles dem Kinde geben sollte. Einmal schenkte sie ihm ein Käppchen von rotem Sammet, und weil ihm das so wohl stand und es nichts anderes mehr tragen wollte, hieß es nur das Rotkäppchen. Eines Tages sprach die Mutter: Komm, Rotkäppchen, da hast du ein Stück Kuchen und eine Flasche Wein, bring das der Großmutter hinaus.",
  },
  {
    id: "goethe",
    title: "Ein alter Satz",
    source: "Eigener Text, im Ton eines gemeinfreien Lesetextes",
    text: "Es ist ein altes Buch, und doch wirkt alles neu. Wer sich die Mühe macht, genau zu lesen, findet mehr als schöne Sätze: er findet einen Weg, der durch Zweifel und Hoffnung führt. Die großen Fragen bleiben dieselben, nur die Kleider wechseln. Deshalb lohnt es sich, den Text nicht nur zu bewundern, sondern ihn langsam, Satz für Satz, mit der eigenen Stimme zu prüfen.",
  },
  {
    id: "pangram",
    title: "Pangramm",
    source: "Traditionelles deutsches Pangramm",
    text: "Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich.",
  },
];

export const PASSAGES_BY_LOCALE: Readonly<Record<LocaleName, readonly Passage[]>> = {
  en: ENGLISH_PASSAGES,
  de: GERMAN_PASSAGES,
};

/** @deprecated Prefer passagesFor(locale). Kept so existing tests can import PASSAGES as English. */
export const PASSAGES = ENGLISH_PASSAGES;

export const DEFAULT_PASSAGE_ID = "workshop";

export function passagesFor(locale: LocaleName): readonly Passage[] {
  return PASSAGES_BY_LOCALE[locale];
}

function firstPassage(list: readonly Passage[]): Passage {
  const passage = list[0];
  if (passage === undefined) {
    throw new Error("PASSAGES is empty");
  }
  return passage;
}

export function passageById(id: string, locale: LocaleName = "en"): Passage {
  const list = passagesFor(locale);
  return list.find((passage) => passage.id === id) ?? firstPassage(list);
}
