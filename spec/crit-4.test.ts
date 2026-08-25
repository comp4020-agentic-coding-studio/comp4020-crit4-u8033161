import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// C4's spec asks for a lot that only a person can judge at the crit —
// expressiveness, discoverability, feel, latency. What's left below is what's
// actually mechanically checkable from the shipped markup/source: the fixed
// pentatonic tuning is right, every string reachable by both a pointer and a
// keyboard, live synthesis rather than pre-recorded audio, and no scoring or
// fail-state markup snuck in.

const DIST = resolve("dist");
const doc = new JSDOM(readFileSync(resolve(DIST, "index.html"), "utf8")).window.document;
const mainSource = readFileSync(resolve(DIST, "main.js"), "utf8");

// Two octaves of the same C major pentatonic run, back to back: row one is
// the original six strings on the home row, row two repeats the pattern an
// octave up on the row above (Q W E R U I), column-aligned with row one.
const EXPECTED_NOTES = ["C3", "D3", "E3", "G3", "A3", "C4", "C4", "D4", "E4", "G4", "A4", "C5"];
const EXPECTED_KEYS_ROW1 = ["a", "s", "d", "f", "j", "k"];
const EXPECTED_KEYS_ROW2 = ["q", "w", "e", "r", "u", "i"];

describe("crit 4: an instrument", () => {
  const strings = [...doc.querySelectorAll(".string")];

  it("has one string per note in the locked pentatonic tuning, left to right", () => {
    expect(strings.map((el) => el.getAttribute("data-note"))).toEqual(EXPECTED_NOTES);
  });

  it("is a real <button> per string, so it's reachable without a mouse", () => {
    for (const el of strings) {
      expect(el.tagName, `${el.outerHTML} should be a <button>`).toBe("BUTTON");
    }
  });

  it("maps every string across both rows to a distinct key", () => {
    const keys = strings.map((el) => el.getAttribute("data-key"));
    expect(keys).toEqual([...EXPECTED_KEYS_ROW1, ...EXPECTED_KEYS_ROW2]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("generates sound live via the Web Audio API rather than playing a file", () => {
    expect(mainSource).toMatch(/AudioContext/);
    expect(doc.querySelector("audio"), "no <audio> element — playback isn't pre-recorded").toBeNull();
    expect(mainSource).not.toMatch(/\.(mp3|wav|ogg)\b/);
  });

  it("carries no scoring or fail-state markup", () => {
    for (const term of ["score", "lives", "game-over", "gameover", "fail"]) {
      expect(
        doc.querySelector(`[data-testid*="${term}" i], [class*="${term}" i]`),
        `found something that looks like "${term}" — this instrument has no way to fail`,
      ).toBeNull();
    }
  });
});
