import { FART_PRESETS as ORIGINAL_PRESETS, type FartPreset } from "./fart-presets";
import type { FartParams } from "./fart-synth";
import measurements from "./fart-acoustics.json";
import manifest from "../../public/fart-audio-manifest.json";

export type AcousticProfile = {
  pitchHz: number | null;
  tonality: number;
  flatness: number;
  lowEnergy: number;
  rms: number;
  variation: number;
  activeDuration: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function classifyRecording(profile: AcousticProfile) {
  if (profile.tonality >= 0.4 && profile.pitchHz !== null && profile.pitchHz >= 250) return "squeaky";
  if (profile.tonality < 0.4) return "airy";
  return "rumbly";
}

export function measuredParams(profile: AcousticProfile, original: FartParams): FartParams {
  const kind = classifyRecording(profile);
  const pitch = profile.pitchHz ?? 120;
  const holeSize = kind === "airy"
    ? 1.1 + clamp(profile.flatness / 0.2, 0, 1) * 0.4
    : kind === "squeaky"
      ? clamp(140 / pitch, 0.2, 0.55)
      : clamp(100 / pitch, 0.56, 1.09);
  return {
    ...original,
    holeSize,
    cheekSize: clamp(0.5 + profile.activeDuration * 0.65, 0.5, 2),
    cheekShape: clamp(1 - profile.flatness * 3, 0, 1),
    pressure: clamp(0.3 + Math.sqrt(profile.rms / 0.4) * 1.2, 0.3, 1.5),
    resonance: clamp(profile.tonality, 0, 1),

    turbulence: clamp((profile.variation - 0.15) / 0.7, 0, 1),
  };
}

const profiles: Record<string, AcousticProfile> = measurements;
const recordings: Record<string, { name: string }> = manifest;

// Source titles replace invented labels that described a different recording.
export const FART_PRESETS: FartPreset[] = ORIGINAL_PRESETS.map((preset) => {
  const profile = profiles[preset.id];
  if (!profile) return preset;
  const kind = classifyRecording(profile);
  const pitch = kind !== "airy" && profile.pitchHz !== null ? ` · ~${Math.round(profile.pitchHz)} Hz` : "";
  return {
    ...preset,
    name: recordings[preset.id]?.name ?? preset.name,
    description: `${kind === "squeaky" ? "Pitched squeak" : kind === "airy" ? "Airy / noise-led" : "Low / mid pitched rumble"}${pitch} · ${profile.activeDuration.toFixed(2)}s active · estimated from audio`,
    params: measuredParams(profile, preset.params),
  };
});

export function scorePreset(p: FartParams, q: FartParams) {
  return (
    ((p.holeSize - q.holeSize) / 1.3) ** 2 * 8 +
    ((p.pressure - q.pressure) / 1.2) ** 2 * 3 +
    ((p.turbulence ?? 0.5) - (q.turbulence ?? 0.5)) ** 2 * 2 +
    ((p.cheekSize - q.cheekSize) / 1.5) ** 2 * 0.8 +

    ((p.resonance ?? 0.5) - (q.resonance ?? 0.5)) ** 2 * 0.8 +
    (p.cheekShape - q.cheekShape) ** 2 * 0.3 +
    (p.food === q.food ? 0 : 0.04)
  );
}

export function findNearestPreset(params: FartParams, presets = FART_PRESETS): FartPreset | null {
  const band = (hole: number) => hole <= 0.55 ? "tight" : hole >= 1.1 ? "loose" : "middle";
  const candidates = presets.filter((preset) =>
    Math.abs(preset.params.pressure - params.pressure) < 0.45 &&
    Math.abs(preset.params.holeSize - params.holeSize) <= 0.22 &&
    band(preset.params.holeSize) === band(params.holeSize),
  );
  candidates.sort((a, b) => scorePreset(params, a.params) - scorePreset(params, b.params) || a.id.localeCompare(b.id));
  const best = candidates[0];
  return best && scorePreset(params, best.params) <= 0.45 ? best : null;
}