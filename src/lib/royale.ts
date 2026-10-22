// Fart Royale: anonymous head-to-head fart battles stored in Lovable Cloud.
// Contestants are identified by a random device id kept in localStorage; votes go through
// the royale_vote database function so Elo can't be edited directly.
import { supabase } from "@/integrations/supabase/client";

export type RoyaleFart = {
  id: string; name: string; audio: string; device_id: string; butt_style: string;
  elo: number; wins: number; losses: number; created_at: string;
};

export const MAX_SECONDS = 8;
const DEVICE_KEY = "fart-royale-device";

export function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
  return id;
}

export async function fetchRoster(): Promise<RoyaleFart[]> {
  const { data, error } = await supabase.from("royale_farts").select("*")
    .order("elo", { ascending: false }).order("wins", { ascending: false }).order("created_at").limit(500);
  if (error) throw error;
  return data ?? [];
}

// Seeds point at full URLs; uploads are stored privately and need a signed link.
export async function audioUrl(audio: string): Promise<string> {
  if (/^https?:/.test(audio)) return audio;
  const { data, error } = await supabase.storage.from("royale-audio").createSignedUrl(audio, 3600);
  if (error || !data) throw error ?? new Error("No audio");
  return data.signedUrl;
}

export function pairKey(a: string, b: string) { return a < b ? `${a}:${b}` : `${b}:${a}`; }

// Picks two different farts whose pair this voter hasn't judged yet.
export function pickPair<T extends { id: string }>(roster: T[], seen: Set<string>, rand = Math.random): [T, T] | null {
  const open: [T, T][] = [];
  for (let i = 0; i < roster.length; i++)
    for (let j = i + 1; j < roster.length; j++)
      if (!seen.has(pairKey(roster[i].id, roster[j].id))) open.push([roster[i], roster[j]]);
  if (!open.length) return null;
  const p = open[Math.floor(rand() * open.length)];
  return rand() < 0.5 ? p : [p[1], p[0]];
}

export async function castVote(winner: string, loser: string) {
  const { data, error } = await supabase.rpc("royale_vote", { _winner: winner, _loser: loser, _voter: deviceId() });
  if (error) throw error;
  return data?.[0] as { winner_elo: number; loser_elo: number; delta: number } | undefined;
}

export async function audioDuration(blob: Blob): Promise<number> {
  const ctx = new AudioContext();
  try { return (await ctx.decodeAudioData(await blob.arrayBuffer())).duration; }
  finally { void ctx.close(); }
}

export async function enterRoyale(blob: Blob, name: string, style: string) {
  const clean = name.trim().slice(0, 30);
  if (!clean) throw new Error("Give your fart a name");
  if (blob.size > 2 * 1024 * 1024) throw new Error("File is too big (2 MB max)");
  const ext = (blob.type.split("/")[1] || "webm").split(";")[0].replace("mpeg", "mp3").replace("x-m4a", "m4a");
  const path = `uploads/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("royale-audio").upload(path, blob, { contentType: blob.type || "audio/webm" });
  if (up.error) throw up.error;
  const { error } = await supabase.from("royale_farts").insert({ name: clean, audio: path, butt_style: style, device_id: deviceId() });
  if (error) throw error;
}
