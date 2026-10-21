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
          const inRolls = !(100 + R < o.x || 100 - R > o.x + OBS_W);
          const hx = o.x + OBS_W / 2;
          const inHandle = Math.abs(100 - hx) < R + 6;
          return (inHandle && s.y - R + 4 < o.gapY - GAP / 2) || (inRolls && s.y + R - 4 > o.gapY + GAP / 2);
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

// Plunger stuck to the ceiling by its rubber cup, wooden handle hanging down to the gap.
function drawPlunger(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number) {
  const cx = x + OBS_W / 2, cupH = 30, cupW = OBS_W + 4;
  // shadow on ceiling/wall
  ctx.fillStyle = "rgba(60,50,40,0.12)";
  ctx.beginPath(); ctx.moveTo(cx + 10, top + cupH); ctx.lineTo(cx + 30, bottom - 10); ctx.lineTo(cx + 20, bottom - 10); ctx.lineTo(cx + 4, top + cupH); ctx.fill();
  // wooden handle
  const hw = 12;
  const wood = ctx.createLinearGradient(cx - hw / 2, 0, cx + hw / 2, 0);
  wood.addColorStop(0, "#6e4a26"); wood.addColorStop(0.45, "#a9763f"); wood.addColorStop(1, "#5a3a1c");
  ctx.fillStyle = wood; ctx.fillRect(cx - hw / 2, top + cupH - 4, hw, bottom - top - cupH);
  ctx.strokeStyle = "rgba(70,40,15,0.45)"; ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(cx - 3 + k * 3, top + cupH + 10 + k * 17); ctx.lineTo(cx - 2 + k * 3, bottom - 20 - k * 11); ctx.stroke(); }
  ctx.fillStyle = "#5a3a1c"; ctx.beginPath(); ctx.ellipse(cx, bottom - 2, hw / 2, 3, 0, 0, Math.PI * 2); ctx.fill();
  // rubber cup (dome flattened against ceiling)
  const rub = ctx.createRadialGradient(cx - 8, top + 8, 2, cx, top + 10, cupW / 2);
  rub.addColorStop(0, "#c2563a"); rub.addColorStop(0.6, "#8f3523"); rub.addColorStop(1, "#5e2014");
  ctx.fillStyle = rub; ctx.beginPath();
  ctx.moveTo(cx - cupW / 2, top);
  ctx.bezierCurveTo(cx - cupW / 2, top + cupH * 0.9, cx - 12, top + cupH, cx - 9, top + cupH);
  ctx.lineTo(cx + 9, top + cupH);
  ctx.bezierCurveTo(cx + 12, top + cupH, cx + cupW / 2, top + cupH * 0.9, cx + cupW / 2, top);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3d140c"; ctx.fillRect(cx - cupW / 2 - 2, top, cupW + 4, 4); // sealed rim
  ctx.fillStyle = "#4a1a10"; ctx.beginPath(); ctx.ellipse(cx, top + cupH - 2, 10, 5, 0, 0, Math.PI * 2); ctx.fill(); // collar
  ctx.fillStyle = "rgba(255,220,200,0.3)"; ctx.beginPath(); ctx.ellipse(cx - 12, top + 10, 6, 3, -0.3, 0, Math.PI * 2); ctx.fill();
}

// Stack of puffy toilet paper rolls, slightly offset, with quilted texture and a hole on top.
function drawTP(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number) {
  const rollH = 38, ry2 = 7, w = OBS_W - 6;
  const offs = [0, 3, -2, 2, -3, 1];
  const rolls: number[] = [];
  for (let y = bottom - rollH; y + rollH > top; y -= rollH) rolls.push(Math.max(y, top));
  rolls.forEach((ry, i) => {
    const rx = x + 3 + offs[Math.abs(i + Math.floor(x / 97)) % offs.length];
    const h = (bottom - i * rollH) - ry;
    const body = ctx.createLinearGradient(rx, 0, rx + w, 0);
    body.addColorStop(0, "#d9d9d4"); body.addColorStop(0.25, "#ffffff"); body.addColorStop(0.7, "#f1f1ec"); body.addColorStop(1, "#c8c8c2");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.roundRect(rx, ry, w, h, 6); ctx.fill();
    // quilted dots
    ctx.fillStyle = "rgba(160,160,150,0.28)";
    for (let yy = ry + 6; yy < ry + h - 3; yy += 5) for (let xx = rx + 5 + ((yy / 5) % 2) * 2.5; xx < rx + w - 4; xx += 5) ctx.fillRect(xx, yy, 1.4, 1.4);
    // seam shadow between rolls
    ctx.fillStyle = "rgba(120,120,110,0.35)"; ctx.beginPath(); ctx.ellipse(rx + w / 2, ry + h, w / 2 - 1, 2.5, 0, 0, Math.PI); ctx.fill();
  });
  // top roll face with hole
  const topX = x + 3 + offs[Math.abs(rolls.length - 1 + Math.floor(x / 97)) % offs.length];
  ctx.fillStyle = "#fbfbf8"; ctx.beginPath(); ctx.ellipse(topX + w / 2, top, w / 2, ry2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#d4d4ce"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "#a9a9a2"; ctx.beginPath(); ctx.ellipse(topX + w / 2, top, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c79a64"; ctx.beginPath(); ctx.ellipse(topX + w / 2, top + 1, 9, 2.2, 0, 0, Math.PI); ctx.fill();
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
