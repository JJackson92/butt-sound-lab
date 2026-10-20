import { scheduleFart, soundDuration } from "./fart-synth";
import { getAudioContext, ENVIRONMENTS } from "./fart-reverb";
import { seededRandom, type Creation } from "./creations";

export async function renderCreation(c: Creation): Promise<AudioBuffer> {
  const config = ENVIRONMENTS.find(e => e.key === c.env) ?? ENVIRONMENTS[0];
  const duration = soundDuration(c.params);
  const tail = config.key === "dry" || c.echo === 0 ? 0.05 : config.decay + config.predelay;
  const ac = new OfflineAudioContext(2, Math.ceil((duration + tail + 0.1) * 44100), 44100);
  const input = ac.createGain();
  const wet = config.wet * Math.min(1.5, c.echo);
  const dry = ac.createGain(); dry.gain.value = Math.max(0.55, 1 - wet * 0.5);
  input.connect(dry).connect(ac.destination);
  if (wet > 0) {
    const rng = seededRandom(c.seed ^ 0x12345678);
    const ir = ac.createBuffer(2, Math.max(1, Math.floor(44100 * config.decay)), 44100);
    for (let ch = 0; ch < 2; ch++) { const data = ir.getChannelData(ch); for (let i = 0; i < data.length; i++) data[i] = (rng() * 2 - 1) * (1 - i / data.length) ** (2.2 + config.decay * 0.3); }
    const convolver = ac.createConvolver(); convolver.buffer = ir;
    const delay = ac.createDelay(0.5); delay.delayTime.value = config.predelay;
    const filter = ac.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = config.damp;
    const gain = ac.createGain(); gain.gain.value = wet;
    input.connect(delay).connect(convolver).connect(filter).connect(gain).connect(ac.destination);
  }
  scheduleFart(ac, input, c.params, seededRandom(c.seed));
  const buffer = await ac.startRendering();
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) for (const v of buffer.getChannelData(ch)) peak = Math.max(peak, Math.abs(v));
  if (peak > 0.98) for (let ch = 0; ch < buffer.numberOfChannels; ch++) { const data = buffer.getChannelData(ch); for (let i = 0; i < data.length; i++) data[i] *= 0.98 / peak; }
  return buffer;
}
let playing: AudioBufferSourceNode | null = null;
export function stopRendered() { playing?.stop(); playing = null; }
export function playRendered(buffer: AudioBuffer, onLevel: (level: number) => void, onEnd: () => void) {
  stopRendered(); const ac = getAudioContext();
  const source = ac.createBufferSource(); source.buffer = buffer; source.connect(ac.destination); playing = source;
  const start = ac.currentTime;
  let frame = 0;
  const data = buffer.getChannelData(0);
  const tick = () => {
    const offset = Math.floor((ac.currentTime - start) * buffer.sampleRate);
    let sum = 0; let n = 0;
    for (let i = offset; i < Math.min(offset + 512, data.length); i++) { sum += data[i] ** 2; n++; }
    onLevel(Math.min(1, Math.sqrt(sum / Math.max(1, n)) * 4));
    frame = requestAnimationFrame(tick);
  };
  source.onended = () => { cancelAnimationFrame(frame); onLevel(0); if (playing === source) playing = null; onEnd(); };
  source.start(); tick();
}
export function wavBytes(channels: Float32Array[], rate: number) {
  const count = channels.length; const length = channels[0]?.length ?? 0;
  const bytes = new ArrayBuffer(44 + length * count * 2); const v = new DataView(bytes);
  const text = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i)); };
  text(0, "RIFF"); v.setUint32(4, bytes.byteLength - 8, true); text(8, "WAVE"); text(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, count, true); v.setUint32(24, rate, true); v.setUint32(28, rate * count * 2, true); v.setUint16(32, count * 2, true); v.setUint16(34, 16, true); text(36, "data"); v.setUint32(40, bytes.byteLength - 44, true);
  for (let i = 0; i < length; i++) for (let ch = 0; ch < count; ch++) { const s = Math.max(-1, Math.min(1, channels[ch][i])); v.setInt16(44 + (i * count + ch) * 2, Math.round(s * (s < 0 ? 32768 : 32767)), true); }
  return bytes;
}
export function wavBlob(buffer: AudioBuffer) { return new Blob([wavBytes(Array.from({ length: buffer.numberOfChannels }, (_, ch) => buffer.getChannelData(ch)), buffer.sampleRate)], { type: "audio/wav" }); }
export async function deliverAudio(blob: Blob, name: string) {
  const extension = blob.type.includes("json") ? "json" : blob.type.includes("wav") ? "wav" : "mp3";
  const filename = `${name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 70) || "butt-sound"}.${extension}`;
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: name }); return; } catch (e) { if ((e as DOMException).name === "AbortError") return; } }
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}