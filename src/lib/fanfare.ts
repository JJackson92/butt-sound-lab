// Victory fanfare for Fart Royale: a short brass flourish that fires with the fireworks.
// Scheduling is a pure function over a BaseAudioContext so the note table can be checked
// offline; playFanfare() wires it to the shared live AudioContext.
import { getAudioContext } from "./fart-reverb";

export type FanfareNote = { at: number; freq: number; dur: number; gain: number };

// "ta-da-da-DAAAH": three rising calls, then a held major chord with a sparkle on top.
const CALLS: FanfareNote[] = [
  { at: 0.0, freq: 392.0, dur: 0.13, gain: 0.28 },
  { at: 0.14, freq: 523.25, dur: 0.13, gain: 0.3 },
  { at: 0.28, freq: 659.25, dur: 0.16, gain: 0.32 },
];
const CHORD: FanfareNote[] = [
  { at: 0.46, freq: 523.25, dur: 0.85, gain: 0.22 },
  { at: 0.46, freq: 659.25, dur: 0.85, gain: 0.2 },
  { at: 0.46, freq: 783.99, dur: 0.85, gain: 0.18 },
  { at: 0.46, freq: 1046.5, dur: 0.8, gain: 0.12 },
];
const SPARKLE: FanfareNote[] = [
  { at: 0.52, freq: 1568.0, dur: 0.18, gain: 0.06 },
  { at: 0.64, freq: 2093.0, dur: 0.18, gain: 0.05 },
  { at: 0.76, freq: 2637.0, dur: 0.22, gain: 0.04 },
];

export function fanfareNotes(): FanfareNote[] {
  return [...CALLS, ...CHORD, ...SPARKLE];
}

// Longest note end, so callers can time the fanfare against the fireworks and auto-advance.
export function fanfareLength(): number {
  return fanfareNotes().reduce((end, n) => Math.max(end, n.at + n.dur), 0);
}

function voice(ac: BaseAudioContext, out: AudioNode, n: FanfareNote, at: number, type: OscillatorType, brighten: number) {
  const t = at + n.at;
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(n.freq, t);
  const bright = ac.createBiquadFilter();
  bright.type = "lowpass";
  bright.Q.value = 6;
  bright.frequency.setValueAtTime(900, t);
  bright.frequency.linearRampToValueAtTime(brighten, t + 0.06);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(n.gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);
  osc.connect(bright).connect(g).connect(out);
  osc.start(t);
  osc.stop(t + n.dur + 0.05);
}

export function scheduleFanfare(ac: BaseAudioContext, destination: AudioNode, at = ac.currentTime) {
  const master = ac.createGain();
  master.gain.value = 0.9;
  master.connect(destination);

  CALLS.forEach((n) => voice(ac, master, n, at, "sawtooth", 2600));
  CHORD.forEach((n) => voice(ac, master, n, at, "sawtooth", 3400));
  SPARKLE.forEach((n) => voice(ac, master, n, at, "sine", 6000));

  // Cymbal-ish shimmer under the final chord: filtered white noise with a fast decay.
  const len = Math.ceil(0.5 * ac.sampleRate);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const hiss = ac.createBiquadFilter();
  hiss.type = "highpass";
  hiss.frequency.value = 4200;
  const hg = ac.createGain();
  const t = at + CHORD[0].at;
  hg.gain.setValueAtTime(0.09, t);
  hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  src.connect(hiss).connect(hg).connect(master);
  src.start(t);
  src.stop(t + 0.55);
}

export function playFanfare(): boolean {
  try {
    const ac = getAudioContext();
    scheduleFanfare(ac, ac.destination);
    return true;
  } catch {
    return false;
  }
}
