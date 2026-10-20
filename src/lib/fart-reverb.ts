// Shared WebAudio "echo environment" bus. Anything that wants reverb routes
// through getReverbInput() instead of connecting straight to destination.

export type EnvKey =
  | "dry"
  | "bathroom"
  | "church"
  | "elevator"
  | "store"
  | "airplane"
  | "staircase"
  | "library";

export const ENVIRONMENTS: {
  key: EnvKey;
  label: string;
  emoji: string;
  // Impulse-response synthesis params
  decay: number;     // seconds of tail
  predelay: number;  // seconds before reflections
  damp: number;      // lowpass on the wet bus (Hz)
  wet: number;       // default wet mix 0-1
}[] = [
  { key: "dry",       label: "Dry (no echo)", emoji: "🚪", decay: 0.01, predelay: 0,     damp: 20000, wet: 0.0 },
  { key: "bathroom",  label: "Bathroom",      emoji: "🛁", decay: 1.2,  predelay: 0.005, damp: 6000,  wet: 0.55 },
  { key: "church",    label: "Church",        emoji: "⛪", decay: 4.5,  predelay: 0.04,  damp: 4000,  wet: 0.75 },
  { key: "elevator",  label: "Elevator",      emoji: "🛗", decay: 0.5,  predelay: 0.003, damp: 2800,  wet: 0.4 },
  { key: "store",     label: "Store",         emoji: "🏬", decay: 1.8,  predelay: 0.02,  damp: 5000,  wet: 0.35 },
  { key: "airplane",  label: "Airplane",      emoji: "✈️", decay: 0.3,  predelay: 0.002, damp: 1400,  wet: 0.5 },
  { key: "staircase", label: "Staircase",     emoji: "🪜", decay: 2.5,  predelay: 0.015, damp: 7000,  wet: 0.6 },
  { key: "library",   label: "Library",       emoji: "📚", decay: 0.8,  predelay: 0.008, damp: 4500,  wet: 0.2 },
];

let ctx: AudioContext | null = null;
let inputNode: GainNode | null = null;
let dryGain: GainNode | null = null;
let wetGain: GainNode | null = null;
let preDelay: DelayNode | null = null;
let convolver: ConvolverNode | null = null;
let dampFilter: BiquadFilterNode | null = null;

let currentEnv: EnvKey = "dry";
let currentWetScale = 1; // user 0-1 multiplier on env's default wet

export function getAudioContext() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function buildIR(ac: AudioContext, decay: number) {
  const sr = ac.sampleRate;
  const len = Math.max(1, Math.floor(sr * Math.max(0.02, decay)));
  const buf = ac.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      // Exponential decay * white noise; tiny early-reflection cluster up front.
      const env = Math.pow(1 - t, 2.2 + decay * 0.3);
      d[i] = (Math.random() * 2 - 1) * env;
    }
  }
  return buf;
}

function ensureBus() {
  const ac = getAudioContext();
  if (inputNode) return { ac, input: inputNode };
  inputNode = ac.createGain();
  dryGain = ac.createGain();
  wetGain = ac.createGain();
  preDelay = ac.createDelay(0.5);
  convolver = ac.createConvolver();
  dampFilter = ac.createBiquadFilter();
  dampFilter.type = "lowpass";

  inputNode.connect(dryGain).connect(ac.destination);
  inputNode.connect(preDelay);
  preDelay.connect(convolver);
  convolver.connect(dampFilter);
  dampFilter.connect(wetGain);
  wetGain.connect(ac.destination);

  applyEnvironment(currentEnv, currentWetScale);
  return { ac, input: inputNode };
}

export function getReverbInput(): { ac: AudioContext; input: AudioNode } {
  return ensureBus();
}

export function applyEnvironment(env: EnvKey, wetScale = 1) {
  currentEnv = env;
  currentWetScale = Math.max(0, Math.min(1.5, wetScale));
  if (!inputNode) return;
  const cfg = ENVIRONMENTS.find((e) => e.key === env);
  if (!cfg || !convolver || !preDelay || !dampFilter || !wetGain || !dryGain) return;
  const ac = getAudioContext();
  convolver.buffer = buildIR(ac, cfg.decay);
  preDelay.delayTime.value = cfg.predelay;
  dampFilter.frequency.value = cfg.damp;
  const wet = cfg.wet * currentWetScale;
  wetGain.gain.value = wet;
  // Keep some dry signal so source stays audible even at full wet.
  dryGain.gain.value = env === "dry" ? 1 : Math.max(0.55, 1 - wet * 0.5);
}
