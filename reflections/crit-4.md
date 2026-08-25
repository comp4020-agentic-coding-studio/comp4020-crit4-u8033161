# Crit 4: An instrument

**What was the breakthrough that moved the work forward?**

The instrument's test suite went green early, and it was tempting to stop
there — jsdom reads the built HTML and JS as static text, it never actually
executes `main.js`. The real breakthrough was refusing to trust that as proof
the thing worked, and instead driving it with a headless browser through all
three input paths (drag, keyboard, Tab+Enter). That's what surfaced a genuine
bug: the very first Tab+Enter press on any freshly-loaded string was silently
swallowed, because a double-fire guard fell back to comparing against
`performance.now() ?? 0`, and `performance.now()` is itself small right after
page load. No amount of reading the code or staring at green tests would have
caught it — it only showed up by actually pressing Enter on a fresh page.

**What did this work change about who I want to be as a software developer?**

It sharpened a rule I already half-believed: a passing test suite tells you
the code does what the tests describe, not that the app works. For a
synthesis-and-interaction project like this one, "works" partly means
"sounds and feels right when a stranger touches it," and that's exactly the
part no static check can see. I want to keep building the habit of treating
"drive the actual app" as a real step in the process — not a nice-to-have
after the tests pass, but the thing that catches the bugs the tests structurally
can't.
