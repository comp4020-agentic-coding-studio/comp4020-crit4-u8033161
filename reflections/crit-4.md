# Crit 4: An instrument

**What was the breakthrough that moved the work forward?**

The breakthrough this week was learning not to trust "it built successfully"
as proof the instrument actually worked.

My first prompt just asked for a six-string playable instrument with
different pitches. What came back passed its tests, but the interface was
just six plain lines, and when I actually played it, the sound was harsh
and screechy — notes rang out far too long, with a thin, piercing tone,
like a beginner scraping a violin. Nothing in the automated checks flagged
this, because nothing about "sounds unpleasant" is something a test suite
can catch — that judgment call was mine to make.

So my second prompt was specific: fix the tone, and make the interface
more visually engaging. What the agent found wasn't a tuning tweak — it was
a real bug. The Karplus-Strong feedback loop's round-trip gain was slightly
above 1, so every pluck was exploding exponentially into clipped distortion
within a fraction of a second. It was fixed properly: measuring the
filter's actual peak gain and normalizing the feedback against it, verified
by offline rendering showing the signal was stable rather than exploding.
I also asked for a second string row for more range and added visual
feedback (glow, motion) so the instrument felt alive instead of static.

**What did this work change about who I want to be as a software developer?**

What this changed for me: green checks tell you the code runs, not that
the result is good. My ear was the only harness that could catch this bug,
and directing the agent meant pushing back on "it works" until it actually
sounded right.
