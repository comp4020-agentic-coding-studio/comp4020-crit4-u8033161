// Six strings: fixed-pitch pentatonic pluck instrument. No frets — a string
// always sounds its one note; what varies is how hard and when you pluck it.
// Synthesis is Karplus-Strong: a short noise burst recirculates through a
// delay/lowpass/feedback loop tuned to the string's period, which is what
// makes it ring like a plucked string instead of a flat oscillator tone.

const NOTE_FREQS = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
};

const MAX_BEND_PX = 40;
const TAP_VISUAL_BEND_PX = 10;
const KEYBOARD_VISUAL_BEND_PX = 12;
const KEYBOARD_VELOCITY = 0.75;
const CLICK_VELOCITY = 0.75;
const DECAY_SECONDS = 1.6;

const strings = [...document.querySelectorAll(".string")];

let audioCtx;
let masterGain;
let noiseBuffer;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.knee.value = 8;
    limiter.ratio.value = 6;
    masterGain.connect(limiter);
    limiter.connect(audioCtx.destination);

    // A few seconds of white noise, reused for every pluck: each pluck plays
    // a short random slice of it, so repeated plucks of the same string
    // don't sound perfectly identical.
    const length = audioCtx.sampleRate * 3;
    noiseBuffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function pluck(button, velocity) {
  const ctx = getAudioContext();
  const freq = NOTE_FREQS[button.dataset.note];
  const delayTime = 1 / freq;
  const feedbackGain = Math.exp((Math.log(0.001) * delayTime) / DECAY_SECONDS);
  const now = ctx.currentTime;

  const delay = ctx.createDelay(1);
  delay.delayTime.value = delayTime;

  // In-loop damping: a gentle lowpass so the recirculating signal itself
  // stays warm rather than buzzy — this is what gives Karplus-Strong its
  // plucked-string timbre, not a bright/harsh one.
  const damping = ctx.createBiquadFilter();
  damping.type = "lowpass";
  damping.frequency.value = freq * (2 + velocity * 3);
  damping.Q.value = 0.6;

  // A biquad lowpass isn't unity-gain everywhere — it has a small overshoot
  // near its own cutoff, even at low Q. Left uncorrected, that overshoot
  // multiplied by the near-1 feedback gain pushes the loop's round-trip
  // gain just over 1 at that frequency; compounded over a few hundred loop
  // iterations per second, "just over 1" becomes a runaway scream within
  // half a second instead of a decaying pluck. Measure the filter's actual
  // peak gain and fold it into the feedback gain so the loop is provably
  // stable (and still decays at roughly the intended rate) regardless of
  // note or velocity.
  const probeFreqs = new Float32Array(64);
  for (let i = 0; i < probeFreqs.length; i++) {
    probeFreqs[i] = 1 + (i / (probeFreqs.length - 1)) * (ctx.sampleRate / 2 - 1);
  }
  const probeMag = new Float32Array(probeFreqs.length);
  damping.getFrequencyResponse(probeFreqs, probeMag, new Float32Array(probeFreqs.length));
  const filterPeakGain = Math.max(...probeMag);

  const feedback = ctx.createGain();
  feedback.gain.value = feedbackGain / (filterPeakGain * 1.05);

  // Tone envelope: starts bright and decays toward the fundamental over the
  // pluck's lifetime, mirroring how a real string's upper harmonics die out
  // faster than the note itself. Separate from the in-loop filter above,
  // which only shapes the recirculating timbre, not the audible decay.
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.Q.value = 0.5;
  const brightHz = Math.min(ctx.sampleRate / 2 - 100, freq * (6 + velocity * 8));
  const darkHz = freq * 1.5;
  tone.frequency.setValueAtTime(brightHz, now);
  tone.frequency.exponentialRampToValueAtTime(darkHz, now + DECAY_SECONDS);

  const outputGain = ctx.createGain();
  outputGain.gain.value = 0.35 + velocity * 0.35;

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  // Fade the noise burst in and out instead of gating it on/off, so the
  // pick attack is a soft transient rather than a hard click.
  const burstDuration = delayTime * 2;
  const burstGain = ctx.createGain();
  const fade = Math.min(burstDuration / 3, 0.004);
  burstGain.gain.setValueAtTime(0, now);
  burstGain.gain.linearRampToValueAtTime(velocity, now + fade);
  burstGain.gain.linearRampToValueAtTime(0, now + burstDuration);

  // Feedback loop: delay -> damping filter -> feedback gain -> back into the
  // delay. The noise burst seeds it once, then it rings on its own, decaying
  // as the feedback gain and lowpass roll energy off each lap. The tone
  // filter taps the loop on the way out, so it shapes what's heard without
  // affecting what recirculates.
  noise.connect(burstGain);
  burstGain.connect(delay);
  delay.connect(damping);
  damping.connect(feedback);
  feedback.connect(delay);
  damping.connect(tone);
  tone.connect(outputGain);
  outputGain.connect(masterGain);

  const offset = Math.random() * (noiseBuffer.duration - burstDuration);
  noise.start(now, offset, burstDuration);

  const cleanupAfter = (DECAY_SECONDS + 0.5) * 1000;
  setTimeout(() => {
    noise.disconnect();
    burstGain.disconnect();
    delay.disconnect();
    damping.disconnect();
    feedback.disconnect();
    tone.disconnect();
    outputGain.disconnect();
  }, cleanupAfter);

  button.style.setProperty("--glow", String(velocity));
  setTimeout(() => button.style.setProperty("--glow", "0"), 180);
}

function bendAndRelease(button, bendPx) {
  button.classList.remove("plucked");
  void button.offsetWidth; // restart the spring animation even mid-flight
  button.style.setProperty("--bend", `${bendPx}px`);
  button.classList.add("plucked");
}

for (const button of strings) {
  button.addEventListener("animationend", () => {
    button.classList.remove("plucked");
    button.style.setProperty("--bend", "0px");
  });
}

// Pointer/touch: drag a string sideways and release to pluck it. How far you
// pulled it drives both loudness and brightness; a plain tap still plucks.
const drags = new Map();
const recentPointerPluck = new WeakMap();

for (const button of strings) {
  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId);
    drags.set(button, event.clientX);
  });

  button.addEventListener("pointermove", (event) => {
    const startX = drags.get(button);
    if (startX === undefined) return;
    const delta = Math.max(-MAX_BEND_PX, Math.min(MAX_BEND_PX, event.clientX - startX));
    button.style.setProperty("--bend", `${delta}px`);
  });

  const release = (event) => {
    const startX = drags.get(button);
    if (startX === undefined) return;
    drags.delete(button);
    const delta = event.clientX - startX;
    const magnitude = Math.min(MAX_BEND_PX, Math.abs(delta));
    const velocity = Math.max(0.45, magnitude / MAX_BEND_PX);
    const visualBend = magnitude < 6 ? Math.sign(delta || 1) * TAP_VISUAL_BEND_PX : delta;

    recentPointerPluck.set(button, performance.now());
    pluck(button, velocity);
    bendAndRelease(button, visualBend);
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
}

// Keyboard: one key per string (home row), for players who never touch a
// pointer. Tab + Enter/Space also works via the native <button> click below.
const KEY_TO_BUTTON = new Map(strings.map((button) => [button.dataset.key, button]));

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const button = KEY_TO_BUTTON.get(event.key.toLowerCase());
  if (!button) return;
  recentPointerPluck.set(button, performance.now());
  pluck(button, KEYBOARD_VELOCITY);
  bendAndRelease(button, KEYBOARD_VISUAL_BEND_PX);
});

// Native button activation (Tab + Enter/Space) fires "click" without any
// pointer events, so it needs its own trigger — guarded so a mouse click or
// touch tap, which also fires "click" after pointerup, doesn't pluck twice.
for (const button of strings) {
  button.addEventListener("click", () => {
    const last = recentPointerPluck.get(button) ?? -Infinity;
    if (performance.now() - last < 500) return;
    pluck(button, CLICK_VELOCITY);
    bendAndRelease(button, TAP_VISUAL_BEND_PX);
  });
}
