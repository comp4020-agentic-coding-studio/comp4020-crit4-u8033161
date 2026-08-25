# COMP4020 prototype

Your starter repo for a COMP4020 prototype: a static site in HTML/CSS/TypeScript
that builds to plain HTML/CSS/JS and deploys to GitHub Pages. The deployed site
is what gets marked, not this repo.

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build.

**Stack for this deliverable: bare.** No Vite, no TypeScript build step —
hand-written HTML/CSS/JS, served and shipped as-is. `pnpm build` still emits a
complete site into `dist/` and `pnpm dev` still serves it locally; see
`scripts/` for how, since there's no bundler doing it for you.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Run `pnpm check` before you push.
- Open the page in a browser and look at it. The rendered page is the truth;
  your mental model of it isn't.
- When a check fails, read its output before you change anything.
- Never commit a red state.
- State the core interaction in one sentence before building it, so it's
  testable.
- Prefer small, verifiable commits over one giant commit.
- When something breaks, fix the root cause or add a check for it — don't just
  retry until it looks right. If the fix generalizes, add it to this file.
- Don't add scope beyond the core mechanic without asking first.

## The link-preview card

`public/card.png` (1200x630) is the image a shared link shows; `index.html`'s
head points at it. Replace it and the `description` meta, and copy the head
block into any new page. The card URL resolves against the page that names it,
like any link --- `./card.png` is wrong one directory down, and nothing in CI
checks it, so look at the deployed head when you add pages.

## The checks

`pnpm check` runs them (`pnpm check:evidence` is the extra gate before you
ship); CI runs the same plus links, secrets and the deploy. Read the failure.

`spec/README.md`, `PROCESS.md` and `reflections/README.md` are in this repo and
say what they are for.

## Notes from fixes

- A class selector styling an element (e.g. `.actions { display: flex }`)
  silently overrides the browser's built-in `[hidden] { display: none }` rule,
  because author-stylesheet rules beat user-agent rules regardless of
  specificity. Any element toggled via the `hidden` attribute needs an
  explicit `.your-class[hidden] { display: none; }` rule alongside it. Caught
  by screenshotting the rendered page, not by reading the code.
- A `someMap.get(key) ?? 0` fallback compared against `performance.now()` is a
  trap: right after page load, `performance.now()` is itself small, so an
  element that was never in the map reads as "just happened" and a guard
  meant to suppress a double-fire instead suppresses the real first event.
  Use `?? -Infinity` for a "never happened" sentinel, not `0`. Caught by
  actually driving the page (Tab to a fresh control, press Enter, check
  whether anything fired) — the static test suite has no page-load clock and
  can't see this.
- A Karplus-Strong (or any) feedback loop with a filter inside it isn't safe
  just because the feedback gain alone is below 1. A biquad lowpass has a
  small resonant overshoot (gain > 1) near its own cutoff even at very low Q
  — it is not a Butterworth-flat unity-gain filter in practice. If
  `feedbackGain * filterPeakGain` exceeds 1 at any frequency, the loop grows
  exponentially over the hundreds of iterations per second these delay times
  imply, turning a decaying pluck into a clipped, piercing scream within a
  fraction of a second. This was present in the very first version of this
  instrument and is why it sounded harsh — no oscillator was involved, the
  loop itself was unstable. Fixed by measuring the in-loop filter's real peak
  gain with `BiquadFilterNode.getFrequencyResponse()` at pluck-time and
  dividing the feedback gain by it (plus a small safety margin), which
  guarantees round-trip gain stays below 1 regardless of note or velocity.
  Caught only by rendering the actual signal offline (`OfflineAudioContext`)
  and inspecting peak amplitude over time — nothing in the test suite plays
  or measures audio, and it's inaudible-until-it-isn't on headphones at low
  volume.
- Reading `getComputedStyle(el).boxShadow` (or any transitioned property)
  immediately after a JS-driven custom-property change can show the *old*
  value for the first frame or two, even though the custom property itself
  has already updated — the transition needs a tick to actually start
  interpolating. A verification script that samples at t=0 will wrongly
  conclude the style never changed. Wait past the transition's duration
  before asserting on the settled value.

## This file is yours

A starting point, not a rulebook. As you learn what your prototype needs --- a
convention the work has to hold to, a sensor that keeps catching you out (a
linter, say), a fact about the stack that is easy to get wrong --- write it down
here and wire it into `check`. Growing this file is the work.

## This prototype: Six strings

A twelve-string pluck instrument with no frets, in two rows of six: each
string is fixed to one note in C major pentatonic, spanning two octaves
(C3 D3 E3 G3 A3 C4, then C4 D4 E4 G4 A4 C5, left to right in each row), so any
combination played together — within a row or across both — stays consonant.
Core interaction: drag a string sideways and release to pluck it — how far
you pull it drives loudness and brightness — or press its home-row key (row
one only: A S D F J K). Dragging or swiping continuously across strings
strums them in sequence, in whichever order the gesture actually crosses
them — left-to-right ascending, right-to-left descending — by treating
"leaving a string" (via a crossing or via release) as the trigger, uniformly,
rather than a separate strum-specific code path. Synthesis is Karplus-Strong
(a noise burst recirculating through a delay/lowpass/feedback loop tuned to
the string's period) rather than a flat oscillator, so it actually rings like
a plucked string.

Rules on top of the template's:

- No frets, no along-string pitch variation — a string always sounds its one
  note. Pull distance affects only volume/brightness, never pitch.
- Row one (the original six) must be reachable by pointer/touch drag, by its
  home-row key, and by Tab + Enter/Space — three input paths, one trigger
  function. Row two (the octave-up six) is reachable by drag/touch and
  Tab + Enter/Space only, deliberately — it has no key of its own, by design,
  not by oversight; it exists for strumming and reachability, not for typing.
- Pointer handling must never call `setPointerCapture` — capturing to the
  button a drag started on makes it impossible to detect the drag crossing
  into a different string, which breaks strumming outright.
- A plain tap/click must still produce an audible pluck at a sensible volume;
  don't let the "drag" mechanic gate the very first sound a stranger makes.
- AudioContext is created lazily, on the first gesture — never at page load.
