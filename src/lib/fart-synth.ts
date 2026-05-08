// Web Audio fart synthesis. Parameters control timbre.
export type FartParams = {
  cheekSize: number;      // 0.5 - 2 (volume/body)
  cheekShape: number;     // 0 - 1 (round vs flat -> filter Q)
  holeSize: number;       // 0.2 - 1.5 (smaller = higher pitch, tighter)
  pressure: number;       // 0.3 - 1.5 (loudness/attack)
  food: FoodKey;
};

export type FoodKey = "beans" | "broccoli" | "cheese" | "eggs" | "soda" | "spicy" | "salad";

export const FOODS: { key: FoodKey; label: string; emoji: string }[] = [
  { key: "beans", label: "Beans", emoji: "🫘" },
  { key: "broccoli", label: "Broccoli", emoji: "🥦" },
  { key: "cheese", label: "Cheese", emoji: "🧀" },
  { key: "eggs", label: "Eggs", emoji: "🥚" },
  { key: "soda", label: "Soda", emoji: "🥤" },
  { key: "spicy", label: "Spicy", emoji: "🌶️" },
  { key: "salad", label: "Salad", emoji: "🥗" },
];

const FOOD_PROFILES: Record<FoodKey, { dur: number; wob: number; rumble: number; sputter: number; pitch: number }> = {
  beans:    { dur: 1.4, wob: 14, rumble: 1.0, sputter: 0.7, pitch: 0.85 },
  broccoli: { dur: 1.0, wob: 9,  rumble: 0.8, sputter: 0.5, pitch: 1.0 },
  cheese:   { dur: 1.8, wob: 6,  rumble: 1.3, sputter: 0.3, pitch: 0.7 },
  eggs:     { dur: 1.2, wob: 11, rumble: 0.9, sputter: 0.8, pitch: 0.95 },
  soda:     { dur: 0.6, wob: 22, rumble: 0.4, sputter: 0.2, pitch: 1.4 },
  spicy:    { dur: 0.8, wob: 28, rumble: 0.6, sputter: 0.9, pitch: 1.25 },
  salad:    { dur: 0.4, wob: 18, rumble: 0.3, sputter: 0.4, pitch: 1.5 },
};

let ctx: AudioContext | null = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function playFart(params: FartParams) {
  const ac = getCtx();
  const now = ac.currentTime;
  const food = FOOD_PROFILES[params.food];

  const dur = food.dur * (0.6 + params.cheekSize * 0.5);
  const basePitch = 80 * food.pitch / params.holeSize;
  const volume = Math.min(1, params.pressure * params.cheekSize * 0.7);

  // Master gain with envelope
  const master = ac.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(volume, now + 0.02 * params.pressure);
  master.gain.exponentialRampToValueAtTime(0.001, now + dur);
  master.connect(ac.destination);

  // Lowpass shaped by cheek shape (rounder = more resonance)
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600 + params.cheekShape * 1400;
  filter.Q.value = 4 + (1 - params.cheekShape) * 12;
  filter.connect(master);

  // Sawtooth core with pitch wobble (sputter)
  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  const pitchEnv = ac.createConstantSource();
  pitchEnv.offset.setValueAtTime(basePitch * 1.4, now);
  pitchEnv.offset.exponentialRampToValueAtTime(basePitch * 0.5, now + dur);
  pitchEnv.connect(osc.frequency);
  osc.frequency.setValueAtTime(basePitch, now);

  // LFO wobble
  const lfo = ac.createOscillator();
  lfo.frequency.value = food.wob * (1 / params.holeSize);
  const lfoGain = ac.createGain();
  lfoGain.gain.value = basePitch * 0.4 * food.sputter;
  lfo.connect(lfoGain).connect(osc.frequency);

  osc.connect(filter);

  // Noise rumble layer
  const bufSize = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  }
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = basePitch * 2;
  noiseFilter.Q.value = 0.8;
  const noiseGain = ac.createGain();
  noiseGain.gain.value = food.rumble * 0.4;
  noise.connect(noiseFilter).connect(noiseGain).connect(filter);

  osc.start(now);
  pitchEnv.start(now);
  lfo.start(now);
  noise.start(now);
  osc.stop(now + dur);
  pitchEnv.stop(now + dur);
  lfo.stop(now + dur);
  noise.stop(now + dur);

  return dur * 1000;
}
