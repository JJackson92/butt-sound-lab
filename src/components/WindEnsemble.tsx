import { useEffect, useRef, useState } from "react";
import { Play, Square, Trash2, Share2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Buttocks } from "@/components/Buttocks";
import { readSounds } from "@/lib/guest-sounds";
import { mealPreset, type Creation } from "@/lib/creations";
import { matchRecording } from "@/lib/fart-matching";
import { loadManifest } from "@/lib/fart-audio";
import { renderCreation } from "@/lib/audio-render";
import { getAudioContext } from "@/lib/fart-reverb";
import { LANES, STEPS, emptyGrid, stepSeconds, encodeSong, decodeSong, clampBpm, type Song } from "@/lib/ensemble";
import type { FoodKey } from "@/lib/fart-synth";

function starterTokens(): Creation[] {
  const seen = new Set<string>();
  const out: Creation[] = [];
  (["soda", "eggs", "beans", "broccoli", "burrito", "cheese", "salad"] as FoodKey[]).forEach((f, i) => {
    const p = matchRecording({ ...mealPreset(f), food: f });
    if (seen.has(p.id)) return; seen.add(p.id);
    out.push({ v: 1, name: p.name, seed: 1000 + i, source: "recording", presetId: p.id, env: "dry", echo: 1, params: { ...p.params, food: f } });
  });
  return out;
}

const buffers = new Map<string, Promise<AudioBuffer>>();
function keyOf(c: Creation) { return JSON.stringify([c.source, c.presetId, c.seed, c.params, c.env, c.echo]); }
async function loadBuffer(c: Creation): Promise<AudioBuffer> {
  const k = keyOf(c);
  if (!buffers.has(k)) buffers.set(k, (async () => {
    if (c.source !== "synth") {
      try {
        const id = c.presetId ?? matchRecording(c.params).id;
        const entry = (await loadManifest())[id];
        const res = await fetch(entry.preview);
        if (!res.ok) throw new Error("blocked");
        return await getAudioContext().decodeAudioData(await res.arrayBuffer());
      } catch { /* fall back to the seeded render */ }
    }
    return renderCreation({ ...c, source: "synth" });
  })());
  return buffers.get(k)!;
}

export function WindEnsemble({ initial }: { initial?: string }) {
  const [tokens, setTokens] = useState<Creation[]>([]);
  const [grid, setGrid] = useState(emptyGrid);
  const [bpm, setBpm] = useState(120);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [hits, setHits] = useState<Record<number, number>>({});
  const [status, setStatus] = useState("");
  const timer = useRef<number | null>(null);
  const state = useRef({ grid, bpm, tokens });
  state.current = { grid, bpm, tokens };

  useEffect(() => {
    const shared = initial ? decodeSong(initial) : null;
    if (shared && shared.tokens.length) { setTokens(shared.tokens); setGrid(shared.grid); setBpm(shared.bpm); return; }
    const saved = readSounds();
    const list = [...saved, ...starterTokens()].slice(0, 24);
    setTokens(list);
    // demo groove so play works right away
    const g = emptyGrid();
    const n = Math.min(list.length, 4);
    [0, 4, 8, 12].forEach((s, i) => { g[2][s] = (saved.length + 3) % list.length; if (i % 2) g[0][s + 2] = saved.length % list.length; });
    if (n > 2) g[1][14] = (saved.length + 2) % list.length;
    setGrid(g);
  }, [initial]);

  useEffect(() => () => stop(), []);

  function preview(i: number) {
    setSelected(i);
    void loadBuffer(tokens[i]).then((b) => fire(b, getAudioContext().currentTime));
    setHits((h) => ({ ...h, [i]: (h[i] ?? 0) + 1 }));
  }
  function fire(b: AudioBuffer, when: number) {
    const ac = getAudioContext(); void ac.resume();
    const src = ac.createBufferSource(); src.buffer = b;
    const g = ac.createGain(); g.gain.value = 0.85;
    src.connect(g).connect(ac.destination); src.start(when);
  }
  function place(lane: number, s: number, token = selected) {
    setGrid((g) => g.map((row, l) => row.map((v, i) => (l === lane && i === s ? (v === token ? null : token) : v))));
  }
  async function play() {
    stop();
    setStatus("Warming up the orchestra…");
    await Promise.all(state.current.tokens.map(loadBuffer));
    setStatus("");
    const ac = getAudioContext(); await ac.resume();
    let next = ac.currentTime + 0.1; let s = 0;
    setPlaying(true);
    const tick = async () => {
      while (next < ac.currentTime + 0.12) {
        const cur = s; const at = next;
        for (const row of state.current.grid) {
          const t = row[cur];
          if (t !== null && state.current.tokens[t]) {
            fire(await loadBuffer(state.current.tokens[t]), at);
            window.setTimeout(() => setHits((h) => ({ ...h, [t]: (h[t] ?? 0) + 1 })), Math.max(0, (at - ac.currentTime) * 1000));
          }
        }
        window.setTimeout(() => setStep(cur), Math.max(0, (at - ac.currentTime) * 1000));
        next += stepSeconds(state.current.bpm); s = (s + 1) % STEPS;
      }
    };
    timer.current = window.setInterval(() => void tick(), 25);
    void tick();
  }
  function stop() { if (timer.current) clearInterval(timer.current); timer.current = null; setPlaying(false); setStep(-1); }
  async function share() {
    const song: Song = { v: 1, bpm, tokens, grid };
    const url = `${location.origin}/ensemble?s=${encodeSong(song)}`;
    try { await navigator.clipboard.writeText(url); setStatus("Link copied. Send your symphony!"); } catch { setStatus(url); }
  }

  return (
    <div className="ensemble">
      <section className="ensemble-roll" aria-label="Piano roll">
        <div className="ensemble-controls">
          <Button onClick={() => (playing ? stop() : void play())} size="lg">{playing ? <><Square size={16} /> Stop</> : <><Play size={16} /> Play</>}</Button>
          <label className="bpm">Tempo <b>{bpm} BPM</b>
            <Slider min={60} max={180} step={1} value={[bpm]} onValueChange={([v]) => setBpm(clampBpm(v))} />
          </label>
          <Button variant="outline" onClick={() => setGrid(emptyGrid())}><Trash2 size={16} /> Clear</Button>
          <Button variant="outline" onClick={() => void share()}><Share2 size={16} /> Share</Button>
        </div>
        {status && <p className="ensemble-status" role="status">{status}</p>}
        <div className="roll-scroll">
          <div className="roll">
            {LANES.map((lane, l) => (
              <div className="roll-row" key={lane}>
                <span className="roll-lane">{lane}</span>
                {grid[l].map((v, s) => (
                  <button key={s} aria-label={`${lane} step ${s + 1}${v !== null ? `: ${tokens[v]?.name}` : ""}`}
                    className={`roll-cell${s % 4 === 0 ? " beat" : ""}${s === step ? " now" : ""}${v !== null ? " filled" : ""}`}
                    onClick={() => place(l, s)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const t = Number(e.dataTransfer.getData("text/plain")); if (Number.isInteger(t)) place(l, s, t); }}>
                    {v !== null && tokens[v] && <span className="cell-butt"><Buttocks params={tokens[v].params} jiggle={s === step ? hits[v] ?? 0 : 0} stink={0} style={tokens[v].style ?? "peach"} /></span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ensemble-tray" aria-label="Butt orchestra">
        <h2><Music size={18} /> The Butt Orchestra</h2>
        <p className="ensemble-hint">Drag a butt onto the grid, or tap a butt then tap a square. Your saved sounds from My Sounds appear first.</p>
        <div className="token-list">
          {tokens.map((t, i) => (
            <button key={i} draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(i)); setSelected(i); }}
              onClick={() => preview(i)} className={i === selected ? "token selected" : "token"} title={t.name}>
              <span className="token-butt"><Buttocks params={t.params} jiggle={hits[i] ?? 0} stink={hits[i] ?? 0} style={t.style ?? "peach"} /></span>
              <span className="token-name">{t.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
