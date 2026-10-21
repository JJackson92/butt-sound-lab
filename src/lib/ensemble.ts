// Browser-safe song model for The Wind Ensemble sequencer.
import { validateCreation, type Creation } from "./creations";

export const STEPS = 20;
export const LANES = ["High Squeaks", "Mid Braps", "Bass Rumbles", "Wet FX", "Trumpet Toots", "Silent Stinkers"] as const;

export type Song = { v: 1; bpm: number; tokens: Creation[]; grid: (number | null)[][] };

export function emptyGrid(): (number | null)[][] {
  return LANES.map(() => Array.from({ length: STEPS }, () => null));
}

export function clampBpm(bpm: number) { return Math.max(60, Math.min(180, Math.round(bpm))); }
export function stepSeconds(bpm: number) { return 60 / clampBpm(bpm) / 4; }

export function validateSong(input: unknown): Song | null {
  if (!input || typeof input !== "object") return null;
  const s = input as Record<string, unknown>;
  if (!Array.isArray(s.tokens) || !Array.isArray(s.grid)) return null;
  const tokens = s.tokens.slice(0, 24).map(validateCreation).filter((c): c is Creation => c !== null);
  const grid = emptyGrid();
  s.grid.slice(0, LANES.length).forEach((row, l) => {
    if (Array.isArray(row)) row.slice(0, STEPS).forEach((v, i) => { grid[l][i] = Number.isInteger(v) && v >= 0 && v < tokens.length ? v : null; });
  });
  return { v: 1, bpm: clampBpm(Number(s.bpm) || 120), tokens, grid };
}

export function encodeSong(s: Song) {
  const bytes = new TextEncoder().encode(JSON.stringify(s));
  let bin = ""; bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeSong(text: string): Song | null {
  try {
    const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    return validateSong(JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))));
  } catch { return null; }
}
