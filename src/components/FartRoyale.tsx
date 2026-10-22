import { useEffect, useRef, useState } from "react";
import { Crown, Mic, Play, Square, Upload, SkipForward, Trophy, Swords, User } from "lucide-react";
import { Buttocks } from "@/components/Buttocks";
import { BUTT_STYLES, DEFAULT_CREATION, type ButtStyle } from "@/lib/creations";
import { MAX_SECONDS, audioDuration, audioUrl, castVote, deviceId, enterRoyale, fetchRoster, pairKey, pickPair, type RoyaleFart } from "@/lib/royale";

type Tab = "battle" | "enter" | "mine" | "fame";
const SEEN_KEY = "fart-royale-seen";
let player: HTMLAudioElement | null = null;

async function play(f: RoyaleFart) {
  player?.pause();
  player = new Audio(await audioUrl(f.audio));
  await player.play();
}
const rate = (f: RoyaleFart) => (f.wins + f.losses ? Math.round((100 * f.wins) / (f.wins + f.losses)) : 0);

function Avatar({ f, bounce }: { f: RoyaleFart; bounce: number }) {
  return <div className="royale-avatar"><Buttocks params={DEFAULT_CREATION.params} jiggle={bounce} stink={bounce} style={f.butt_style as ButtStyle} /></div>;
}

export function FartRoyale() {
  const [tab, setTab] = useState<Tab>("battle");
  const [roster, setRoster] = useState<RoyaleFart[]>([]);
  const [me, setMe] = useState("");
  const [error, setError] = useState("");
  const reload = () => fetchRoster().then(setRoster).catch(() => setError("Couldn't load the arena."));
  useEffect(() => { setMe(deviceId()); void reload(); }, []);
  const champ = roster[0];

  return (
    <div className="royale">
      {champ && (
        <button type="button" className="royale-champ" onClick={() => play(champ)}>
          <Crown className="royale-crown" size={28} />
          <span><small>REIGNING CHAMPION · Golden Royale Crown</small><strong>{champ.name}</strong><em>{champ.elo} pts · {champ.wins}W–{champ.losses}L</em></span>
          <Play size={18} />
        </button>
      )}
      <div className="royale-tabs" role="tablist">
        {([["battle", Swords, "Battle"], ["enter", Mic, "Enter"], ["mine", User, "My Farts"], ["fame", Trophy, "Hall of Fame"]] as const).map(([k, Icon, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><Icon size={15} /> {label}</button>
        ))}
      </div>
      {error && <p className="royale-error">{error}</p>}
      {tab === "battle" && <Battle roster={roster} onVoted={reload} />}
      {tab === "enter" && <Enter onEntered={() => { void reload(); setTab("mine"); }} />}
      {tab === "mine" && <Mine roster={roster} me={me} onEnter={() => setTab("enter")} />}
      {tab === "fame" && <Fame roster={roster} />}
    </div>
  );
}

function Battle({ roster, onVoted }: { roster: RoyaleFart[]; onVoted: () => void }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [pair, setPair] = useState<[RoyaleFart, RoyaleFart] | null>(null);
  const [result, setResult] = useState<{ winner: string; delta: number } | null>(null);
  const [bounce, setBounce] = useState([0, 0]);
  const [msg, setMsg] = useState("");
  useEffect(() => { try { setSeen(new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"))); } catch { /* fresh */ } }, []);
  useEffect(() => { if (!pair && roster.length > 1) setPair(pickPair(roster, seen)); }, [roster, seen, pair]);

  const remember = (a: string, b: string) => {
    const next = new Set(seen); next.add(pairKey(a, b)); setSeen(next);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...next]));
    return next;
  };
  const next = (s: Set<string>) => { setResult(null); setPair(pickPair(roster, s)); };
  const listen = (i: number) => { if (!pair) return; setBounce((b) => b.map((v, j) => (j === i ? v + 1 : v))); play(pair[i]).catch(() => setMsg("That one won't play.")); };
  const vote = async (i: number) => {
    if (!pair || result) return;
    const w = pair[i], l = pair[1 - i];
    const s = remember(w.id, l.id);
    try { const r = await castVote(w.id, l.id); setResult({ winner: w.id, delta: r?.delta ?? 0 }); onVoted(); }
    catch { setResult({ winner: w.id, delta: 0 }); }
    setTimeout(() => next(s), 1600);
  };

  if (roster.length < 2) return <p className="royale-empty">Waiting for challengers…</p>;
  if (!pair) return <p className="royale-empty">You've judged every matchup! Check back when new farts enter.</p>;
  return (
    <section className="royale-duel">
      {pair.map((f, i) => (
        <article key={f.id} className={`royale-fighter ${i ? "blue" : "red"} ${result ? (result.winner === f.id ? "won" : "lost") : ""}`}>
          <span className="royale-corner">{i ? "BLUE CORNER" : "RED CORNER"}</span>
          <Avatar f={f} bounce={bounce[i]} />
          <h3>{f.name}</h3>
          {result && <p className="royale-reveal">{rate(f)}% win rate · {result.winner === f.id ? `+${result.delta}` : `−${result.delta}`} pts</p>}
          <button className="royale-listen" onClick={() => listen(i)}><Play size={16} /> Listen</button>
          <button className="royale-vote" disabled={!!result} onClick={() => vote(i)}><Crown size={16} /> Crown {i ? "B" : "A"}</button>
        </article>
      ))}
      <span className="royale-vs">VS</span>
      <button className="royale-skip" disabled={!!result} onClick={() => next(remember(pair[0].id, pair[1].id))}><SkipForward size={15} /> Skip matchup</button>
      {msg && <p className="royale-error">{msg}</p>}
    </section>
  );
}

function Enter({ onEntered }: { onEntered: () => void }) {
  const [mode, setMode] = useState<"upload" | "mic">("mic");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [style, setStyle] = useState<ButtStyle>("peach");
  const [recording, setRecording] = useState(false);
  const [left, setLeft] = useState(MAX_SECONDS);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<number>(0);

  useEffect(() => () => { clearInterval(timer.current); rec.current?.stop(); }, []);
  const take = (b: Blob) => { setBlob(b); setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(b); }); };

  const startRec = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream); const chunks: Blob[] = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => { stream.getTracks().forEach((t) => t.stop()); clearInterval(timer.current); setRecording(false); take(new Blob(chunks, { type: r.mimeType || "audio/webm" })); };
      rec.current = r; r.start(); setRecording(true); setLeft(MAX_SECONDS);
      const t0 = Date.now();
      timer.current = window.setInterval(() => {
        const s = MAX_SECONDS - Math.floor((Date.now() - t0) / 1000);
        setLeft(s); if (s <= 0 && r.state === "recording") r.stop();
      }, 200);
    } catch { setErr("Microphone access was blocked. Allow it in your browser and try again."); }
  };
  const stopRec = () => { if (rec.current?.state === "recording") rec.current.stop(); };

  const pickFile = async (file?: File) => {
    setErr(""); if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setErr("File is too big (2 MB max).");
    try { if ((await audioDuration(file)) > MAX_SECONDS + 0.5) return setErr(`Keep it under ${MAX_SECONDS} seconds.`); }
    catch { return setErr("That file doesn't look like audio."); }
    take(file);
  };
  const submit = async () => {
    if (!blob) return; setBusy(true); setErr("");
    try { await enterRoyale(blob, name, style); onEntered(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  };

  return (
    <section className="royale-enter">
      <div className="royale-mode">
        <button className={mode === "mic" ? "on" : ""} onClick={() => setMode("mic")}><Mic size={15} /> Record</button>
        <button className={mode === "upload" ? "on" : ""} onClick={() => setMode("upload")}><Upload size={15} /> Upload</button>
      </div>
      {mode === "mic" ? (
        <button className={`royale-mic ${recording ? "live" : ""}`} onClick={recording ? stopRec : startRec}>
          {recording ? <><Square size={30} /><span>{left}s · tap to stop</span></> : <><Mic size={34} /><span>Tap to record ({MAX_SECONDS}s max)</span></>}
        </button>
      ) : (
        <label className="royale-drop"><Upload size={28} /><span>Choose an MP3, WAV, M4A or WebM (under {MAX_SECONDS}s)</span>
          <input type="file" accept="audio/*,.mp3,.wav,.m4a,.webm" onChange={(e) => pickFile(e.target.files?.[0])} hidden /></label>
      )}
      {preview && <audio className="royale-preview" src={preview} controls />}
      <label className="select-label">Name your fart
        <input value={name} maxLength={30} placeholder="e.g. The Midnight Echo" onChange={(e) => setName(e.target.value)} />
      </label>
      <p className="select-label">Fighter skin</p>
      <div className="royale-styles">
        {BUTT_STYLES.map((s) => <button key={s.key} className={style === s.key ? "on" : ""} onClick={() => setStyle(s.key)}>{s.label}</button>)}
      </div>
      {err && <p className="royale-error">{err}</p>}
      <button className="rip-button royale-submit" disabled={!blob || !name.trim() || busy} onClick={submit}>{busy ? "Entering…" : "ENTER THE ROYALE"}</button>
    </section>
  );
}

function Mine({ roster, me, onEnter }: { roster: RoyaleFart[]; me: string; onEnter: () => void }) {
  const mine = roster.map((f, i) => ({ f, rank: i + 1 })).filter(({ f }) => f.device_id === me);
  if (!mine.length) return <div className="royale-empty"><p>You haven't entered a fart yet.</p><button className="royale-vote" onClick={onEnter}>Enter one now</button></div>;
  return (
    <ul className="royale-list">
      {mine.map(({ f, rank }) => (
        <li key={f.id} className="royale-mine">
          <button className="royale-play" onClick={() => play(f)} aria-label={`Play ${f.name}`}><Play size={16} /></button>
          <div><strong>{rank === 1 && <Crown size={14} className="royale-crown" />} {f.name}</strong>
            <small>Rank #{rank} of {roster.length} · {f.elo} pts · {f.wins}W–{f.losses}L · {rate(f)}% win rate</small></div>
        </li>
      ))}
    </ul>
  );
}

function Fame({ roster }: { roster: RoyaleFart[] }) {
  return (
    <ol className="royale-list">
      {roster.slice(0, 25).map((f, i) => (
        <li key={f.id} className={i < 3 ? `top top${i + 1}` : ""}>
          <span className="royale-rank">{i === 0 ? <Crown size={16} className="royale-crown" /> : i + 1}</span>
          <button className="royale-play" onClick={() => play(f)} aria-label={`Play ${f.name}`}><Play size={14} /></button>
          <div><strong>{f.name}</strong><small>{f.wins}W–{f.losses}L · {rate(f)}%</small></div>
          <span className="royale-elo">{f.elo}</span>
        </li>
      ))}
    </ol>
  );
}
