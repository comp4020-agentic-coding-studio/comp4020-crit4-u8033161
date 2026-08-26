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

1. **Choosing "bare" over the templated stack.** Six buttons and one audio
   graph don't need a bundler, so I had the agent skip Vite and TypeScript
   and write two small scripts to build and serve the site instead
   ([`4d7dcd2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8033161/commit/4d7dcd2)).
   To check the server actually worked, I tried to make it serve files
   outside the site folder (using `../` and `%2e%2e` in the URL) — an early
   version had blocked every file except the homepage, so I wanted proof that
   was really fixed.

2. **Not trusting the test suite as proof it runs.** The automated tests only
   read the built HTML and JS as plain text; they never actually run the
   page, so they would still pass even if a click did nothing. I had the
   agent drive the real page with a browser and try every way of playing a
   string — dragging, pressing its key, and tabbing to it — before calling
   it done
   ([`a394fa5`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8033161/commit/a394fa5)).

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that a
reflection entry the marker reads is in `reflections/`, and that your
`CLAUDE.md` is there --- before a marker ever opens the file. It checks that
your map is traceable, not that it is good: the marker judges whether your
small, deliberately chosen set of moments shows real judgement and reflection. A
green check is not a substitute for that curation.

Images aren't checked: whether one renders is visible the moment you look. Open
this file on GitHub and look at it before you ship.
