// Shared "acoustic location" engine. The same graph builder runs on the live
// AudioContext bus and inside OfflineAudioContext renders, so playback and WAV
// export sound identical.

export type EnvKey =
  | "dry" | "church" | "stadium" | "bathroom" | "underwater" | "elevator" | "car"
  // legacy keys kept so older shared links stay valid
  | "store" | "airplane" | "staircase" | "library";

export type Location = {
  key: EnvKey;
  label: string;
  emoji: string;
  blurb: string;
  decay: number;      // reverb tail seconds
  predelay: number;
  damp: number;       // lowpass on reverb (Hz)
  wet: number;        // reverb mix
  tone?: { type: BiquadFilterType; freq: number; gain?: number; q?: number }[]; // colours the whole sound
  echo?: { time: number; feedback: number; mix: number }; // repeating slapback
  ding?: boolean;     // elevator chime after the fart
  hidden?: boolean;
};

export const ENVIRONMENTS: Location[] = [
  { key: "dry", label: "Nowhere", emoji: "🚪", blurb: "Just the raw evidence", decay: 0.01, predelay: 0, damp: 20000, wet: 0 },
  { key: "church", label: "Cathedral", emoji: "⛪", blurb: "Rings out for eternity", decay: 5.5, predelay: 0.05, damp: 4500, wet: 1.1 },
  { key: "stadium", label: "Stadium PA", emoji: "📢", blurb: "Bounces back across 60,000 fans", decay: 2.2, predelay: 0.03, damp: 3500, wet: 0.45,
    tone: [{ type: "highpass", freq: 180 }, { type: "peaking", freq: 2200, gain: 8, q: 1 }], echo: { time: 0.38, feedback: 0.5, mix: 0.8 } },
  { key: "bathroom", label: "Tiled Bathroom", emoji: "🚽", blurb: "Porcelain amplification", decay: 1.1, predelay: 0.004, damp: 9000, wet: 0.8,
    tone: [{ type: "peaking", freq: 3000, gain: 5, q: 1 }], echo: { time: 0.035, feedback: 0.6, mix: 0.45 } },
  { key: "underwater", label: "Hot Tub", emoji: "🛁", blurb: "Muffled, bubbling, unforgivable", decay: 0.6, predelay: 0.01, damp: 600, wet: 0.6,
    tone: [{ type: "lowpass", freq: 420, q: 6 }, { type: "lowshelf", freq: 150, gain: 8 }] },
  { key: "elevator", label: "Crowded Elevator", emoji: "🛗", blurb: "Nowhere to hide… ding", decay: 0.3, predelay: 0.002, damp: 3000, wet: 0.5,
    tone: [{ type: "lowpass", freq: 4000 }], ding: true },
  { key: "car", label: "Compact Car", emoji: "🚗", blurb: "Windows up. Cabin boom.", decay: 0.25, predelay: 0.002, damp: 1800, wet: 0.6,
    tone: [{ type: "lowshelf", freq: 140, gain: 14 }, { type: "lowpass", freq: 2600 }] },
  { key: "store", label: "Store", emoji: "🏬", blurb: "", decay: 1.8, predelay: 0.02, damp: 5000, wet: 0.35, hidden: true },
  { key: "airplane", label: "Airplane", emoji: "✈️", blurb: "", decay: 0.3, predelay: 0.002, damp: 1400, wet: 0.5, hidden: true },
  { key: "staircase", label: "Staircase", emoji: "🪜", blurb: "", decay: 2.5, predelay: 0.015, damp: 7000, wet: 0.6, hidden: true },
  { key: "library", label: "Library", emoji: "📚", blurb: "", decay: 0.8, predelay: 0.008, damp: 4500, wet: 0.2, hidden: true },
];
export const LOCATIONS = ENVIRONMENTS.filter(e => !e.hidden);
export function getLocation(key: string) { return ENVIRONMENTS.find(e => e.key === key) ?? ENVIRONMENTS[0]; }

/** Extra seconds of audio a location adds after the sound ends. */
export function locationTail(key: string, amount: number) {
  const l = getLocation(key);
  if (l.key === "dry" || amount === 0) return 0.05;
  const echoTail = l.echo ? l.echo.time * Math.ceil(Math.log(0.02) / Math.log(l.echo.feedback)) : 0;
  return Math.max(l.decay + l.predelay, echoTail) + (l.ding ? 1.6 : 0);
}

/** Wire input -> location -> output. Returns nodes so a live bus can tear them down. */
export function buildLocation(ac: BaseAudioContext, input: AudioNode, output: AudioNode, key: string, amount: number, random: () => number = Math.random) {
  const l = getLocation(key);
  const scale = Math.max(0, Math.min(1.5, amount));
  const nodes: AudioNode[] = [];
  const add = <T extends AudioNode>(n: T) => { nodes.push(n); return n; };
  // Tone colouring scales with amount: at 0 it is neutral.
  let head: AudioNode = input;
  for (const t of l.tone ?? []) {
    const f = add(ac.createBiquadFilter()); f.type = t.type;
    const neutral = t.type === "lowpass" ? 20000 : t.type === "highpass" ? 10 : t.freq;
    const k = Math.min(1, scale);
    f.frequency.value = t.type === "lowpass" || t.type === "highpass" ? neutral * Math.pow(t.freq / neutral, k) : t.freq;
    if (t.gain !== undefined) f.gain.value = t.gain * k;
    if (t.q !== undefined) f.Q.value = 0.7 + (t.q - 0.7) * k;
    head.connect(f); head = f;
  }
  const dry = add(ac.createGain()); dry.gain.value = l.key === "dry" ? 1 : Math.max(0.5, 1 - l.wet * scale * 0.4);
  head.connect(dry).connect(output);
  if (l.key === "dry" || scale === 0) return nodes;
  const len = Math.max(1, Math.floor(ac.sampleRate * Math.max(0.02, l.decay)));
  const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (random() * 2 - 1) * Math.pow(1 - i / len, 2.2 + l.decay * 0.3); }
  const pre = add(ac.createDelay(0.5)); pre.delayTime.value = l.predelay;
  const conv = add(ac.createConvolver()); conv.buffer = ir;
  const damp = add(ac.createBiquadFilter()); damp.type = "lowpass"; damp.frequency.value = l.damp;
  const wet = add(ac.createGain()); wet.gain.value = l.wet * scale;
  head.connect(pre).connect(conv).connect(damp).connect(wet).connect(output);
  if (l.echo) {
    const d = add(ac.createDelay(2)); d.delayTime.value = l.echo.time;
    const fb = add(ac.createGain()); fb.gain.value = l.echo.feedback;
    const mix = add(ac.createGain()); mix.gain.value = l.echo.mix * Math.min(1, scale);
    head.connect(d); d.connect(fb).connect(d); d.connect(mix).connect(output);
  }
  return nodes;
}

/** Elevator-style chime played after the sound finishes. */
export function scheduleDing(ac: BaseAudioContext, output: AudioNode, at: number, amount = 1) {
  [[1318.5, 0], [1046.5, 0.45]].forEach(([freq, offset]) => {
    const o = ac.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    const g = ac.createGain(); const t = at + offset;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25 * Math.min(1, amount), t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    o.connect(g).connect(output); o.start(t); o.stop(t + 1.2);
  });
}

let ctx: AudioContext | null = null;
let inputNode: GainNode | null = null;
let liveNodes: AudioNode[] = [];
let currentEnv: EnvKey = "dry";
let currentWetScale = 1;

export function getAudioContext() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function ensureBus() {
  const ac = getAudioContext();
  if (!inputNode) { inputNode = ac.createGain(); applyEnvironment(currentEnv, currentWetScale); }
  return { ac, input: inputNode as AudioNode };
}

export function getReverbInput(): { ac: AudioContext; input: AudioNode } { return ensureBus(); }

export function applyEnvironment(env: EnvKey, wetScale = 1) {
  currentEnv = env;
  currentWetScale = Math.max(0, Math.min(1.5, wetScale));
  if (!inputNode) return;
  const ac = getAudioContext();
  inputNode.disconnect();
  liveNodes.forEach(n => n.disconnect());
  liveNodes = buildLocation(ac, inputNode, ac.destination, env, currentWetScale);
}

/** Play the current location's after-effect (e.g. elevator ding) on the live bus. */
export function playLocationOutro() {
  if (!ctx || !getLocation(currentEnv).ding || currentWetScale === 0) return;
  scheduleDing(ctx, ctx.destination, ctx.currentTime + 0.3, currentWetScale);
}
