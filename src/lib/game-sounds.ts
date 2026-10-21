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

// Player-chosen sounds: "random" rotates library clips, "synth" uses the synth, anything else is a preset id.
export type GameSoundChoice = "random" | "synth" | string;
export type GameSoundConfig = { toot: GameSoundChoice; splat: GameSoundChoice };

// v2 key: earlier builds defaulted the tap toot to "random"; the new default is
// a specific clip, so old stored configs are dropped instead of masking it.
const CONFIG_KEY = "flappy-cheeks-sounds-v2";
// The tap toot defaults to "Crisp Toot" (p111) — a short, clean pop.
const DEFAULT_CONFIG: GameSoundConfig = { toot: "p111", splat: "random" };

export function getGameSoundConfig(): GameSoundConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<GameSoundConfig>;
    return {
      toot: typeof parsed.toot === "string" ? parsed.toot : DEFAULT_CONFIG.toot,
      splat: typeof parsed.splat === "string" ? parsed.splat : DEFAULT_CONFIG.splat,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setGameSoundConfig(config: GameSoundConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* storage unavailable */
  }
}

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

function playChoice(choice: GameSoundChoice, fallbackIds: string[], volume: number): boolean {
  // "synth" returns false so the caller falls back to the synthesized sound.
  if (choice === "synth") return false;
  if (!manifest) return false;
  if (choice !== "random") {
    const url = manifest[choice]?.preview;
    if (!url) return playFrom(fallbackIds, volume);
    const a = new Audio(url);
    a.volume = volume;
    a.play().catch(() => {});
    return true;
  }
  return playFrom(fallbackIds, volume);
}

export function playGameToot(): boolean {
  if (TOOT_IDS.length === 0) return false;
  return playChoice(getGameSoundConfig().toot, TOOT_IDS, 0.9);
}

export function playGameSplat(): boolean {
  if (SPLAT_IDS.length === 0) return false;
  return playChoice(getGameSoundConfig().splat, SPLAT_IDS, 1);
}

// Preview helper for the sound picker: plays any library clip by preset id.
export function previewGameSound(id: string): boolean {
  const url = manifest?.[id]?.preview;
  if (!url) return false;
  const a = new Audio(url);
  a.volume = 0.9;
  a.play().catch(() => {});
  return true;
}
