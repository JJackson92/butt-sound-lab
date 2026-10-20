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
let operation = 0;
let meterFrame = 0;
export function stopPresetAudio() { operation++; cancelAnimationFrame(meterFrame); if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; } }
const sourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

export async function playPresetAudio(presetId: string, volume = 1, onLevel?: (level: number) => void): Promise<FartAudioEntry | null> {
  stopPresetAudio();
  const id = operation;
  let m: Record<string, FartAudioEntry>;
  try {
    m = await loadManifest();
  } catch {
    loading = null;
    return null;
  }
  const entry = m[presetId];
  if (!entry || id !== operation) return null;
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
    if (onLevel) {
      const analyser = ac.createAnalyser(); analyser.fftSize = 512;
      src.connect(analyser);
      const values = new Float32Array(512);
      const tick = () => {
        if (currentAudio !== a) return;
        analyser.getFloatTimeDomainData(values);
        onLevel(Math.min(1, Math.sqrt(values.reduce((sum, v) => sum + v * v, 0) / values.length) * 4));
        meterFrame = requestAnimationFrame(tick);
      };
      a.onplaying = tick;
      a.onended = () => { cancelAnimationFrame(meterFrame); onLevel(0); };
    }
  } catch {
    // ignore — element will play directly
  }

  try {
    await a.play();
    return currentAudio === a ? entry : null;
  } catch {
    return null;
  }
}
