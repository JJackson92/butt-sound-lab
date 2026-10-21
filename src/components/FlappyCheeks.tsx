import { useEffect, useRef, useState } from "react";
import { playFart, type FartParams } from "@/lib/fart-synth";
import { BUTT_STYLES, DEFAULT_CREATION, type ButtStyle } from "@/lib/creations";

const W = 400, H = 600, CEIL = 24, FLOOR = 60;
const GRAVITY = 1500, FLAP = -430, SPEED = 150, GAP = 165, SPACING = 220, OBS_W = 64, R = 20;
const BEST_KEY = "flappy-cheeks-best";

const SKIN: Record<ButtStyle, [string, string]> = {
  peach: ["#ffd9b8", "#e8936a"], comic: ["#f7b38a", "#d9805a"], hologram: ["#9ff3ff", "#3aa9d6"],
  gold: ["#fff1a0", "#c9971f"], alien: ["#b9f59a", "#3fae5a"],
};

type Obs = { x: number; gapY: number; scored: boolean };
type Puff = { x: number; y: number; r: number; life: number };
type Phase = "ready" | "play" | "over";

function toot(): void {
  const base = DEFAULT_CREATION.params;
  const p: FartParams = { ...base, holeSize: 0.25 + Math.random() * 0.25, pressure: 0.5 + Math.random() * 0.3, duration: 0.18 + Math.random() * 0.12, wetness: 0.1 };
  try { playFart(p); } catch { /* audio unavailable */ }
}
function splat(): void {
  const p: FartParams = { ...DEFAULT_CREATION.params, holeSize: 1.3, pressure: 1, duration: 0.8, wetness: 0.9 };
  try { playFart(p); } catch { /* audio unavailable */ }
}
function ding(): void {
  try {
    const ac = new AudioContext(); const o = ac.createOscillator(); const g = ac.createGain();
    o.frequency.value = 1320; o.type = "triangle"; g.gain.setValueAtTime(0.15, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.25); o.onended = () => ac.close();
  } catch { /* noop */ }
}

export function FlappyCheeks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [style, setStyle] = useState<ButtStyle>("peach");
  const st = useRef({ y: H / 2, vy: 0, obs: [] as Obs[], puffs: [] as Puff[], scroll: 0, score: 0, shake: 0, phase: "ready" as Phase, style: "peach" as ButtStyle, t: 0 });

  useEffect(() => { setBest(Number(localStorage.getItem(BEST_KEY)) || 0); }, []);
  useEffect(() => { st.current.style = style; }, [style]);

  const reset = () => {
    const s = st.current;
    s.y = H / 2; s.vy = 0; s.obs = []; s.puffs = []; s.score = 0; s.shake = 0;
    for (let i = 0; i < 3; i++) s.obs.push({ x: W + 80 + i * SPACING, gapY: randGap(), scored: false });
    setScore(0);
  };
  const randGap = () => CEIL + 70 + Math.random() * (H - CEIL - FLOOR - 140 - GAP) + GAP / 2;

  const flap = () => {
    const s = st.current;
    if (s.phase === "over") return;
    if (s.phase === "ready") { reset(); s.phase = "play"; setPhase("play"); }
    s.vy = FLAP;
    for (let i = 0; i < 5; i++) s.puffs.push({ x: 100 - 18 + Math.random() * 8, y: s.y + 12 + Math.random() * 10, r: 6 + Math.random() * 6, life: 1 });
    toot();
  };
  const restart = () => { reset(); st.current.phase = "ready"; setPhase("ready"); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); flap(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      const s = st.current; s.t += dt;
      if (s.phase === "play") {
        s.vy += GRAVITY * dt; s.y += s.vy * dt; s.scroll += SPEED * dt;
        for (const o of s.obs) {
          o.x -= SPEED * dt;
          if (!o.scored && o.x + OBS_W < 100 - R) { o.scored = true; s.score++; setScore(s.score); ding(); }
        }
        if (s.obs[0].x < -OBS_W - 10) { s.obs.shift(); s.obs.push({ x: s.obs[s.obs.length - 1].x + SPACING, gapY: randGap(), scored: false }); }
        const hit = s.y - R < CEIL || s.y + R > H - FLOOR || s.obs.some(o => {
          if (100 + R < o.x || 100 - R > o.x + OBS_W) return false;
          return s.y - R + 4 < o.gapY - GAP / 2 || s.y + R - 4 > o.gapY + GAP / 2;
        });
        if (hit) {
          s.phase = "over"; s.shake = 0.4; setPhase("over"); splat();
          const b = Math.max(Number(localStorage.getItem(BEST_KEY)) || 0, s.score);
          localStorage.setItem(BEST_KEY, String(b)); setBest(b);
        }
      } else if (s.phase === "ready") { s.y = H / 2 + Math.sin(s.t * 3) * 10; s.scroll += SPEED * dt * 0.4; }
      else if (s.y + R < H - FLOOR) { s.vy += GRAVITY * dt; s.y = Math.min(H - FLOOR - R, s.y + s.vy * dt); }
      s.puffs.forEach(p => { p.x -= (SPEED + 60) * dt; p.r += 30 * dt; p.life -= dt * 1.6; });
      s.puffs = s.puffs.filter(p => p.life > 0);
      s.shake = Math.max(0, s.shake - dt);
      draw(ctx, s);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flappy-wrap">
      <div className="flappy-stage" onPointerDown={(e) => { e.preventDefault(); flap(); }}>
        <canvas ref={canvasRef} width={W} height={H} className="flappy-canvas" aria-label="Flappy Cheeks game" />
        <div className="flappy-score" aria-live="polite">{score}</div>
        {phase === "ready" && <div className="flappy-overlay"><p className="flappy-big">Tap to Toot</p><p>Tap, click or press Space to fart upward.</p></div>}
        {phase === "over" && (
          <div className="flappy-overlay" onPointerDown={(e) => e.stopPropagation()}>
            <p className="flappy-big">Plunged!</p>
            <p>Score: <b>{score}</b> · Best: <b>{best}</b></p>
            <button className="flappy-btn" onClick={restart}>Toot Again</button>
          </div>
        )}
      </div>
      <div className="butt-styles" role="group" aria-label="Butt style">
        {BUTT_STYLES.map(b => (
          <button key={b.key} className={b.key === style ? "active" : ""} onClick={() => setStyle(b.key)} disabled={phase === "play"}>{b.label}</button>
        ))}
      </div>
      <p className="flappy-best">Personal best: {best}</p>
    </div>
  );
}

function draw(ctx: CanvasRenderingContext2D, s: { y: number; vy: number; obs: Obs[]; puffs: Puff[]; scroll: number; shake: number; style: ButtStyle; phase: Phase }) {
  ctx.save();
  if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * s.shake / 0.4, (Math.random() - 0.5) * 14 * s.shake / 0.4);
  // tiled wall
  ctx.fillStyle = "#dff4f1"; ctx.fillRect(0, 0, W, H);
  const T = 40, off = -(s.scroll * 0.5) % T;
  ctx.strokeStyle = "#b5d8d3"; ctx.lineWidth = 2;
  for (let x = off; x < W; x += T) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += T) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let x = off; x < W; x += T) for (let y = 0; y < H; y += T) ctx.fillRect(x + 5, y + 5, 8, 3);
  // ceiling trim
  ctx.fillStyle = "#f4f4f0"; ctx.fillRect(0, 0, W, CEIL); ctx.fillStyle = "#9cc"; ctx.fillRect(0, CEIL - 4, W, 4);
  // obstacles
  for (const o of s.obs) { drawPlunger(ctx, o.x, CEIL, o.gapY - GAP / 2); drawTP(ctx, o.x, o.gapY + GAP / 2, H - FLOOR); }
  // checker floor
  const fo = -s.scroll % 30;
  for (let x = fo - 30; x < W; x += 30) for (let r = 0; r < 2; r++) {
    ctx.fillStyle = ((Math.round((x - fo) / 30) + r) % 2) ? "#222" : "#f2f2f2";
    ctx.fillRect(x, H - FLOOR + 6 + r * 27, 30, 27);
  }
  ctx.fillStyle = "#9cc"; ctx.fillRect(0, H - FLOOR, W, 6);
  // puffs
  for (const p of s.puffs) { ctx.fillStyle = `rgba(140,200,60,${p.life * 0.7})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
  drawButt(ctx, 100, s.y, Math.max(-0.5, Math.min(1.1, s.vy / 600)), s.style);
  ctx.restore();
}

function drawPlunger(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number) {
  const cx = x + OBS_W / 2, cupH = 34;
  ctx.fillStyle = "#c98b4a"; ctx.fillRect(cx - 7, top, 14, bottom - top - cupH + 4);
  ctx.fillStyle = "#a96d33"; ctx.fillRect(cx - 7, top, 4, bottom - top - cupH + 4);
  ctx.fillStyle = "#d62f2f"; ctx.beginPath();
  ctx.moveTo(cx - 14, bottom - cupH); ctx.lineTo(cx + 14, bottom - cupH);
  ctx.quadraticCurveTo(cx + OBS_W / 2 + 4, bottom - 6, cx + OBS_W / 2, bottom);
  ctx.lineTo(cx - OBS_W / 2, bottom); ctx.quadraticCurveTo(cx - OBS_W / 2 - 4, bottom - 6, cx - 14, bottom - cupH);
  ctx.fill(); ctx.fillStyle = "#8f1d1d"; ctx.fillRect(x, bottom - 5, OBS_W, 5);
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(cx - 8, bottom - cupH + 6, 4, 18);
  // suction cup on ceiling
  ctx.fillStyle = "#d62f2f"; ctx.fillRect(cx - 16, top, 32, 6);
}

function drawTP(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number) {
  const rollH = 40;
  for (let y = bottom - rollH, i = 0; y + rollH > top; y -= rollH, i++) {
    const ry = Math.max(y, top), h = y + rollH - ry;
    ctx.fillStyle = "#fbfbf7"; ctx.fillRect(x, ry, OBS_W, h);
    ctx.fillStyle = "#e3e3dc"; ctx.fillRect(x + OBS_W - 10, ry, 10, h);
    ctx.strokeStyle = "#d4d4cc"; ctx.lineWidth = 1;
    for (let k = 8; k < h; k += 8) { ctx.beginPath(); ctx.moveTo(x, ry + k); ctx.lineTo(x + OBS_W, ry + k); ctx.stroke(); }
    ctx.strokeStyle = "#bdbdb4"; ctx.lineWidth = 2; ctx.strokeRect(x, ry, OBS_W, h);
    if (y <= top) {
      ctx.fillStyle = "#fbfbf7"; ctx.beginPath(); ctx.ellipse(x + OBS_W / 2, top, OBS_W / 2, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#b07a45"; ctx.beginPath(); ctx.ellipse(x + OBS_W / 2, top, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fbfbf7"; ctx.fillRect(x + 4, top + 2, 12, 18); // loose tail
      break;
    }
    if (i > 20) break;
  }
}

function drawButt(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number, style: ButtStyle) {
  const [light, dark] = SKIN[style];
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt * 0.6);
  for (const dx of [-11, 11]) {
    const g = ctx.createRadialGradient(dx - 4, -6, 2, dx, 0, R);
    g.addColorStop(0, light); g.addColorStop(1, dark);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(dx, 0, 15, R, 0, 0, Math.PI * 2); ctx.fill();
    if (style === "comic") { ctx.strokeStyle = "#222"; ctx.lineWidth = 2.5; ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.ellipse(dx - 5, -9, 4, 6, -0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(80,30,20,0.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 10); ctx.stroke();
  ctx.fillStyle = "#4a1f17"; ctx.beginPath(); ctx.arc(0, 12, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
