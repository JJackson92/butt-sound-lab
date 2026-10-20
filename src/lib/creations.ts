import { z } from "zod";
import { FOODS, type FartParams, type FoodKey } from "./fart-synth";
import { ENVIRONMENTS } from "./fart-reverb";

export const creationSchema = z.object({
  v: z.literal(1),
  name: z.string().trim().min(1).max(60).regex(/^[^<>\u0000-\u001f]*$/),
  seed: z.number().int().min(0).max(4294967295),
  source: z.enum(["synth", "recording", "match"]),
  presetId: z.string().regex(/^p\d{3}$/).optional(),
  env: z.string().refine(v => ENVIRONMENTS.some(e => e.key === v)),
  echo: z.number().min(0).max(1.5),
  params: z.object({
    cheekSize: z.number().min(0.5).max(2), cheekShape: z.number().min(0).max(1),
    holeSize: z.number().min(0.2).max(1.5), pressure: z.number().min(0.3).max(1.5),
    resonance: z.number().min(0).max(1).optional(), turbulence: z.number().min(0).max(1).optional(),
    duration: z.number().min(0.2).max(8).optional(), wetness: z.number().min(0).max(1).optional(),
    food: z.string().refine(v => FOODS.some(f => f.key === v)),
  }),
});
export type Creation = Omit<z.infer<typeof creationSchema>, "params"> & { params: FartParams };
export const DEFAULT_CREATION: Creation = { v: 1, name: "The Classic Brap", seed: 12345, source: "match", env: "dry", echo: 1,
  params: { cheekSize: 1, cheekShape: 0.5, holeSize: 0.7, pressure: 1, resonance: 0.5, turbulence: 0.5, duration: 1.5, wetness: 0.2, food: "beans" } };
export function validateCreation(input: unknown): Creation | null {
  const result = creationSchema.safeParse(input);
  if (!result.success || (result.data.source === "recording" && !result.data.presetId)) return null;
  return result.data as Creation;
}
export function encodeCreation(c: Creation) {
  const valid = validateCreation(c);
  if (!valid) throw new Error("Give your creation a name of 1–60 characters, without angle brackets.");
  const bytes = new TextEncoder().encode(JSON.stringify(valid));
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeCreation(encoded: string): Creation | null {
  if (encoded.length > 2400) return null;
  try {
    const raw = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    return validateCreation(JSON.parse(new TextDecoder().decode(Uint8Array.from(raw, c => c.charCodeAt(0)))));
  } catch { return null; }
}
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const adjectives = ["Nuclear", "Galactic", "Forbidden", "Suspicious", "Turbo", "Subsonic", "Disco", "Interstellar", "Catastrophic", "Invisible", "Royal", "Unlicensed", "Cosmic", "Tactical", "Haunted", "Volcanic"];
const subjects = ["Burrito", "Grandma", "Pigeon", "Breakfast", "Taco", "Subwoofer", "Cabbage", "Astronaut", "Elevator", "Bean", "Cheese", "Dragon", "Squirrel", "Scientist", "Broccoli", "Moon"];
const endings = ["Revenge", "Incident", "Tornado", "Protocol", "Regret", "Meltdown", "Symphony", "Destroyer", "Leak", "Surprise", "Experiment", "Emergency", "Rumble", "Assassin", "Blast", "Aftermath"];
export function mysteryCreation(seed: number): Creation {
  const r = seededRandom(seed); const pick = (a: string[]) => a[Math.floor(r() * a.length)];
  return { ...DEFAULT_CREATION, seed, name: `${pick(adjectives)} ${pick(subjects)} ${pick(endings)}`, params: {
    cheekSize: 0.5 + r() * 1.5, cheekShape: r(), holeSize: 0.2 + r() * 1.3, pressure: 0.3 + r() * 1.2,
    resonance: r(), turbulence: r(), wetness: r(), duration: 0.2 + r() * 5.8,
    food: FOODS[Math.floor(r() * FOODS.length)].key,
  } };
}
export function setSimpleSize(params: FartParams, size: number): FartParams {
  const t = Math.max(0, Math.min(1, size));
  return { ...params, cheekSize: 0.5 + t * 1.5, holeSize: 0.2 + t * 1.3 };
}
export const DAMAGE_LABELS = ["Barely Noticeable", "Suspicious", "Room Clearer", "Environmental Hazard", "Weapon of Mass Digestion", "Planetary Emergency"];
export function damageRating(p: FartParams) {
  const score = Math.max(0, Math.min(100, ((p.pressure - 0.3) / 1.2 * 0.5 + (p.cheekSize - 0.5) / 1.5 * 0.2 + (p.duration ?? 1.5) / 8 * 0.15 + (p.wetness ?? 0) * 0.15) * 100));
  return { score: Math.round(score), label: DAMAGE_LABELS[Math.min(5, Math.floor(score / 20))] };
}
export function creationUrl(c: Creation) { return `https://buttsounds.com/fart/${encodeCreation(c)}`; }
/** Each last meal is a macro preset: picking it moves the sliders to its signature sound. */
export const MEAL_PRESETS: Record<FoodKey, Omit<FartParams, "food">> = {
  burrito:  { cheekSize: 2.0, cheekShape: 0.7, holeSize: 1.15, pressure: 1.26, resonance: 0.45, turbulence: 0.7,  duration: 2.2, wetness: 0.75 },
  beans:    { cheekSize: 1.5, cheekShape: 0.6, holeSize: 0.85, pressure: 1.02, resonance: 0.7,  turbulence: 0.45, duration: 1.5, wetness: 0.35 },
  soda:     { cheekSize: 0.8, cheekShape: 0.3, holeSize: 0.35, pressure: 1.38, resonance: 0.6,  turbulence: 0.3,  duration: 0.5, wetness: 0.15 },
  spicy:    { cheekSize: 1.1, cheekShape: 0.5, holeSize: 0.65, pressure: 1.44, resonance: 0.35, turbulence: 0.95, duration: 0.9, wetness: 0.65 },
  cheese:   { cheekSize: 1.7, cheekShape: 0.8, holeSize: 1.30, pressure: 0.72, resonance: 0.5,  turbulence: 0.2,  duration: 2.0, wetness: 0.1 },
  eggs:     { cheekSize: 1.0, cheekShape: 0.4, holeSize: 0.45, pressure: 0.90, resonance: 0.85, turbulence: 0.4,  duration: 1.1, wetness: 0.4 },
  broccoli: { cheekSize: 1.2, cheekShape: 0.5, holeSize: 0.80, pressure: 0.96, resonance: 0.5,  turbulence: 0.55, duration: 0.9, wetness: 0.25 },
  salad:    { cheekSize: 0.6, cheekShape: 0.2, holeSize: 1.25, pressure: 0.42, resonance: 0.2,  turbulence: 0.3,  duration: 0.4, wetness: 0.05 },
};
export function mealPreset(food: FoodKey): FartParams { return { ...MEAL_PRESETS[food], food }; }
