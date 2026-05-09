// Web Audio fart synthesis. Parameters control timbre.
export type FartParams = {
  cheekSize: number;        // 0.5 - 2 (volume/body)
  cheekShape: number;       // 0 - 1 (round vs flat -> filter Q)
  holeSize: number;         // 0.2 - 1.5 (smaller = higher pitch, tighter)
  pressure: number;         // 0.3 - 1.5 (loudness/attack) — drives PSI gauge
  gasDensity: number;       // 0.3 - 2 (denser = lower pitch, darker)
  resonance: number;        // 0 - 1 (formant Q on top of cheek shape)
  turbulence: number;       // 0 - 1 (chaotic sputter + noise)
  food: FoodKey;
};

// Map pressure (0.3-1.5) to a friendly PSI value (0-100).
export function pressureToPsi(pressure: number) {
  return Math.round(((pressure - 0.3) / 1.2) * 100);
}

export type FoodKey = "beans" | "broccoli" | "cheese" | "eggs" | "soda" | "spicy" | "salad" | "burrito";

export const FOODS: { key: FoodKey; label: string; emoji: string }[] = [
  { key: "beans", label: "Beans", emoji: "🫘" },
  { key: "broccoli", label: "Broccoli", emoji: "🥦" },
  { key: "cheese", label: "Cheese", emoji: "🧀" },
  { key: "eggs", label: "Eggs", emoji: "🥚" },
  { key: "soda", label: "Soda", emoji: "🥤" },
  { key: "spicy", label: "Spicy", emoji: "🌶️" },
  { key: "salad", label: "Salad", emoji: "🥗" },
  { key: "burrito", label: "Burrito", emoji: "🌯" },
];

const FOOD_PROFILES: Record<FoodKey, { dur: number; wob: number; rumble: number; sputter: number; pitch: number }> = {
  beans:    { dur: 1.4, wob: 14, rumble: 1.0, sputter: 0.7, pitch: 0.85 },
  broccoli: { dur: 1.0, wob: 9,  rumble: 0.8, sputter: 0.5, pitch: 1.0 },
  cheese:   { dur: 1.8, wob: 6,  rumble: 1.3, sputter: 0.3, pitch: 0.7 },
  eggs:     { dur: 1.2, wob: 11, rumble: 0.9, sputter: 0.8, pitch: 0.95 },
  soda:     { dur: 0.6, wob: 22, rumble: 0.4, sputter: 0.2, pitch: 1.4 },
  spicy:    { dur: 0.8, wob: 28, rumble: 0.6, sputter: 0.9, pitch: 1.25 },
  salad:    { dur: 0.4, wob: 18, rumble: 0.3, sputter: 0.4, pitch: 1.5 },
  burrito:  { dur: 2.0, wob: 12, rumble: 1.4, sputter: 0.85, pitch: 0.8 },
};

import { getReverbInput } from "./fart-reverb";
function getCtx() {
  return getReverbInput().ac;
}

export function playFart(params: FartParams) {
  const ac = getCtx();
  const now = ac.currentTime;
  const food = FOOD_PROFILES[params.food];

  const density = params.gasDensity ?? 1;
  const turb = params.turbulence ?? 0.5;
  const reso = params.resonance ?? 0.5;

  const dur = food.dur * (0.6 + params.cheekSize * 0.5) * (0.85 + density * 0.25);
  const basePitch = (80 * food.pitch / params.holeSize) / Math.sqrt(density);
  const volume = Math.min(1, params.pressure * params.cheekSize * 0.7);

  // Master gain with envelope
  const master = ac.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(volume, now + 0.02 * params.pressure);
  master.gain.exponentialRampToValueAtTime(0.001, now + dur);
  master.connect(getReverbInput().input);

  // Lowpass shaped by cheek shape + density
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = (600 + params.cheekShape * 1400) / (0.7 + density * 0.6);
  filter.Q.value = 4 + (1 - params.cheekShape) * 12 + reso * 18;
  filter.connect(master);

  // Resonant bandpass "formant" stage driven by resonance knob
  const formant = ac.createBiquadFilter();
  formant.type = "bandpass";
  formant.frequency.value = basePitch * (3 + reso * 5);
  formant.Q.value = 1 + reso * 14;
  formant.connect(filter);

  // Sawtooth core with pitch wobble (sputter)
  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  const pitchEnv = ac.createConstantSource();
  pitchEnv.offset.setValueAtTime(basePitch * 1.4, now);
  pitchEnv.offset.exponentialRampToValueAtTime(basePitch * 0.5, now + dur);
  pitchEnv.connect(osc.frequency);
  osc.frequency.setValueAtTime(basePitch, now);

  // LFO wobble — turbulence raises rate and depth
  const lfo = ac.createOscillator();
  lfo.frequency.value = food.wob * (1 / params.holeSize) * (0.6 + turb * 1.8);
  const lfoGain = ac.createGain();
  lfoGain.gain.value = basePitch * 0.4 * food.sputter * (0.5 + turb * 1.5);
  lfo.connect(lfoGain).connect(osc.frequency);

  osc.connect(formant);

  // Noise rumble layer — turbulence boosts it
  const bufSize = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    // Turbulence injects bursty amplitude modulation on top of noise
    const burst = 1 + turb * (Math.random() < 0.05 ? 3 : 0);
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize) * burst;
  }
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = basePitch * 2;
  noiseFilter.Q.value = 0.8;
  const noiseGain = ac.createGain();
  noiseGain.gain.value = food.rumble * 0.4 * (0.6 + turb * 1.2);
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
