// Flappy Cheeks game audio: short real recordings from the preset library.
// Falls back to the synth when the manifest or network is unavailable.
import { loadManifest, type FartAudioEntry } from "./fart-audio";
import measurements from "./fart-acoustics.json";

const profiles = measurements as Record<string, { activeDuration: number; variation: number; flatness: number }>;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wetness = (p: { variation: number; flatness: number }) =>
  clamp(clamp((p.variation - 0.25) / 0.5, 0, 1) * 0.7 + clamp(p.flatness / 0.15, 0, 1) * 0.3, 0, 1);

// Quick toots for taps: any recording under ~0.6s of active sound.
const TOOT_IDS = Object.keys(profiles).filter((id) => profiles[id].activeDuration <= 0.55);
// Wet, longer recordings for the crash splat.
const SPLAT_IDS = Object.keys(profiles)
  .filter((id) => profiles[id].activeDuration >= 0.8)
  .sort((a, b) => wetness(profiles[b]) - wetness(profiles[a]))
  .slice(0, 25);

let manifest: Record<string, FartAudioEntry> | null = null;
const warmed: HTMLAudioElement[] = [];

export async function preloadGameSounds(): Promise<void> {
  const m = await loadManifest();
  manifest = m;
  // Warm a few clips so the first tap has low latency.
  for (const id of TOOT_IDS.slice(0, 8)) {
    const url = m[id]?.preview;
    if (!url) continue;
    const a = new Audio(url);
    a.preload = "auto";
    a.volume = 0.9;
    warmed.push(a);
  }
}

function playFrom(ids: string[], volume: number): boolean {
  const id = ids[Math.floor(Math.random() * ids.length)];
  const url = manifest?.[id]?.preview;
  if (!url) return false;
  const a = new Audio(url);
  a.volume = volume;
  a.play().catch(() => {});
  return true;
}

export function playGameToot(): boolean {
  if (!manifest || TOOT_IDS.length === 0) return false;
  return playFrom(TOOT_IDS, 0.9);
}

export function playGameSplat(): boolean {
  if (!manifest || SPLAT_IDS.length === 0) return false;
  return playFrom(SPLAT_IDS, 1);
}
