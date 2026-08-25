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

## This file is yours

A starting point, not a rulebook. As you learn what your prototype needs --- a
convention the work has to hold to, a sensor that keeps catching you out (a
linter, say), a fact about the stack that is easy to get wrong --- write it down
here and wire it into `check`. Growing this file is the work.

## This prototype

TBD --- design still being locked in with the student before any prototype
code lands. Fill this in (one paragraph: what it is, the core interaction)
once agreed, in the same commit that starts the prototype.
