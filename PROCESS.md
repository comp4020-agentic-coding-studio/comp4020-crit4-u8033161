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

1. **Fixing the harsh sound at its root, not with a quick tweak.** The first
   version's sound was harsh and unpleasant — it sounded like noise, not a
   plucked string. I told the agent to actually fix the root cause instead
   of just adjusting settings. It found a real bug in the sound engine that
   was causing the distortion, fixed it properly, and I confirmed by
   listening that it now sounds clean
   ([`e049dc3`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8033161/commit/e049dc3)).

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
