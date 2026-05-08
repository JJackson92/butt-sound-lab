// Loads the manifest mapping presetId -> Freesound preview URL, plays on demand.
import { getReverbInput } from "./fart-reverb";

export type FartAudioEntry = {
  sid: number;
  name: string;
  user: string;
  url: string;
  license: string;
  preview: string;
};

let manifestCache: Record<string, FartAudioEntry> | null = null;
let loading: Promise<Record<string, FartAudioEntry>> | null = null;

export async function loadManifest() {
  if (manifestCache) return manifestCache;
  if (!loading) {
    loading = fetch("/fart-audio-manifest.json")
      .then((r) => r.json())
      .then((j) => (manifestCache = j));
  }
  return loading;
}

let currentAudio: HTMLAudioElement | null = null;
const sourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

export async function playPresetAudio(presetId: string, volume = 1): Promise<FartAudioEntry | null> {
  const m = await loadManifest();
  const entry = m[presetId];
  if (!entry) return null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
  }
  const a = new Audio(entry.preview);
  a.crossOrigin = "anonymous";
  a.volume = Math.max(0, Math.min(1, volume));
  currentAudio = a;

  // Try to route through reverb bus. If CORS denies the MediaElementSource,
  // fall back to plain HTMLAudio playback (no reverb but still audible).
  try {
    const { ac, input } = getReverbInput();
    let src = sourceMap.get(a);
    if (!src) {
      src = ac.createMediaElementSource(a);
      sourceMap.set(a, src);
    }
    src.connect(input);
  } catch {
    // ignore — element will play directly
  }

  a.play().catch(() => {});
  return entry;
}
