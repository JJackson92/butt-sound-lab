// Loads the manifest mapping presetId -> Freesound preview URL, plays on demand.
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

export async function playPresetAudio(presetId: string, volume = 1): Promise<FartAudioEntry | null> {
  const m = await loadManifest();
  const entry = m[presetId];
  if (!entry) return null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
  }
  const a = new Audio(entry.preview);
  a.volume = Math.max(0, Math.min(1, volume));
  a.crossOrigin = "anonymous";
  currentAudio = a;
  a.play().catch(() => {});
  return entry;
}
