/**
 * The words the site says in character, in one place.
 *
 * Almost every line here is a REMIX: a well-known line from the films with the
 * back half swapped for something a developer would recognise. Each one says
 * so in its `note`, so nobody mistakes a joke for a misquote — and the joke
 * only lands if the original is still audible underneath. The one line quoted
 * straight lives in MarqueeBand, attributed as such.
 *
 * `mark` is the phrase that takes the colour: amber for Gotham's side, green
 * for the Joker's. Keep it to a few words, or it stops being an accent.
 */

export type Side = 'bat' | 'joker'

export interface Quote {
  /** The line, with the accented phrase wrapped in *asterisks*. */
  text: string
  who: string
  note: string
  side: Side
}

export const QUOTES = {
  madness: {
    text: 'Madness, as you know, is like gravity. All it takes is a little *push — to main.*',
    who: 'The Joker',
    note: 'Remixed · The Dark Knight',
    side: 'joker',
  },
  fall: {
    text: 'Why do we fall? So we can learn to write *better error handling.*',
    who: 'Thomas Wayne',
    note: 'Remixed · Batman Begins',
    side: 'bat',
  },
  hotfix: {
    text: 'You either die a hotfix, or you live long enough to *become legacy code.*',
    who: 'Harvey Dent',
    note: 'Remixed · The Dark Knight',
    side: 'bat',
  },
} satisfies Record<string, Quote>

/** The footer's line of the night, picked at random on each visit. */
export const NIGHT_QUOTES: Quote[] = [
  {
    text: "Why so serious? *It's only production.*",
    who: 'The Joker',
    note: 'Remixed · on a Friday deploy',
    side: 'joker',
  },
  {
    text: "I'm whatever *this sprint* needs me to be.",
    who: 'Batman',
    note: 'Remixed · The Dark Knight',
    side: 'bat',
  },
  {
    text: 'The night is darkest just before *the build turns green.*',
    who: 'Harvey Dent',
    note: 'Remixed · The Dark Knight',
    side: 'bat',
  },
  {
    text: 'Some men just want to watch the world burn. I just want to watch *the pipeline pass.*',
    who: 'Alfred Pennyworth',
    note: 'Remixed · The Dark Knight',
    side: 'bat',
  },
  {
    text: 'Introduce a little anarchy into the grid. *Then document it.*',
    who: 'The Joker',
    note: 'Remixed · as a design lead',
    side: 'joker',
  },
  {
    text: 'A hero can be anyone. Even someone doing something as simple as *writing a clear commit message.*',
    who: 'Batman',
    note: 'Remixed · The Dark Knight Rises',
    side: 'bat',
  },
]

/** Splits a quote into plain and accented runs for rendering word by word. */
export function quoteWords(text: string) {
  const words: { text: string; mark: boolean }[] = []
  text.split('*').forEach((run, i) => {
    for (const w of run.split(/\s+/)) if (w) words.push({ text: w, mark: i % 2 === 1 })
  })
  return words
}
