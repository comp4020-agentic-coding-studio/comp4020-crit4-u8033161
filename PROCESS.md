# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and its
[word counts](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#word-counts)
cover every deliverable.

## What I built

**Six strings**: a six-string pluck instrument with no frets. Each string is
fixed to one note in C major pentatonic (C3 D3 E3 G3 A3 C4, left to right), so
any combination played together stays consonant — there's no wrong chord.
Drag a string sideways and release to pluck it (how far you pull it drives
loudness and brightness), press its home-row key (A S D F J K), or Tab to it
and hit Enter/Space. Synthesis is Karplus-Strong — a noise burst recirculating
through a delay/lowpass/feedback loop tuned to the string's period — rather
than a flat oscillator tone, so it actually rings.

## The moments that mattered

1. **Choosing "bare" over the templated stack.** The crit rewards a
   deliberately chosen stack, not the default one. An instrument this small —
   six buttons and one audio graph — doesn't need a bundler, so I dropped Vite
   and TypeScript entirely and hand-wrote two small Node scripts
   (`scripts/build.mjs`, `scripts/serve.mjs`) to replace what Vite was doing
   for free
   ([`4d7dcd2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8033161/commit/4d7dcd2)).
   The check that told me it actually worked was the same one the deployed
   site depends on: `pnpm build` producing a `dist/` that `pnpm check`'s tests
   read from directly, and a hand-written static server that I verified wasn't
   just serving `/` — I hit the path-traversal case (`%2e%2e` and `..`)
   deliberately with `curl` before trusting it, after an early version 403'd
   on every file except the index page.

2. **Not trusting the test suite as proof it runs.** `spec/crit-4.test.ts`
   only reads the built `index.html` and `main.js` as static files — jsdom
   doesn't execute `<script>` tags, so a suite full of green checks would
   still pass if `main.js` threw on the first click. I drove the actual page
   in a headless browser (Playwright, since `chromium-cli` wasn't available in
   this environment) through all three input paths — drag, keyboard, and
   Tab+Enter — before calling it done
   ([`a394fa5`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8033161/commit/a394fa5)).

3. **What that driving run actually caught.** The Tab+Enter path silently
   failed to make sound the first time any given string was activated within
   500ms of page load. The click handler guards against double-firing when a
   pointer pluck and its resulting synthetic `click` both land
   (`recentPointerPluck.get(button) ?? 0`), but `0` collides with
   `performance.now()`'s own small value right after navigation — so a string
   that had *never* been touched read as "just plucked a moment ago" and the
   guard swallowed the real first Enter press. A static test can't see this;
   it has no page-load clock to race against. I fixed the sentinel
   (`?? -Infinity`, which can never be "recent") and re-ran the same
   browser-driven check to confirm all five paths (drag-bend, drag-glow, tap,
   keyboard, Tab+Enter) now actually trigger `AudioBufferSourceNode.start`,
   then wrote the failure mode into `CLAUDE.md` as a generalizable lesson
   rather than just a fixed line
   ([`0e2324b`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8033161/commit/0e2324b)).

   > Full design was locked in a few messages back — build against that.

   (This prompt referred to a design I didn't actually have in context; I said
   so rather than inventing one, and the student re-supplied the real
   spec — 6 fixed-pitch pentatonic strings, one home-row key each — before any
   code was written.)

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that a
reflection entry the marker reads is in `reflections/`, and that your
`CLAUDE.md` is there --- before a marker ever opens the file. It checks that
your map is traceable, not that it is good: the marker judges whether your
small, deliberately chosen set of moments shows real judgement and reflection. A
green check is not a substitute for that curation.

Images aren't checked: whether one renders is visible the moment you look. Open
this file on GitHub and look at it before you ship.
