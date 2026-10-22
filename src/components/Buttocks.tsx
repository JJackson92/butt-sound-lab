import { FartParams } from "@/lib/fart-synth";
import type { ButtStyle } from "@/lib/creations";
import { useId } from "react";

type Look = { stops: [string, string, string, string]; stroke?: string; strokeW?: number; shine: string; hole: [string, string]; ring: string; grid?: boolean };
const LOOKS: Record<ButtStyle, Look> = {
  peach: { stops: ["oklch(0.97 0.04 70)", "oklch(0.9 0.08 60)", "oklch(0.78 0.13 50)", "oklch(0.62 0.14 40)"], shine: "oklch(1 0.02 80 / 0.7)", hole: ["oklch(0.22 0.05 30)", "oklch(0.42 0.1 35)"], ring: "oklch(0.5 0.1 35 / 0.5)" },
  comic: { stops: ["oklch(0.86 0.12 45)", "oklch(0.86 0.12 45)", "oklch(0.8 0.14 40)", "oklch(0.72 0.15 35)"], stroke: "oklch(0.15 0.02 30)", strokeW: 7, shine: "oklch(1 0 0 / 0.95)", hole: ["oklch(0.15 0.02 30)", "oklch(0.15 0.02 30)"], ring: "oklch(0.15 0.02 30 / 0.7)" },
  hologram: { stops: ["oklch(0.85 0.15 200 / 0.55)", "oklch(0.7 0.15 210 / 0.35)", "oklch(0.55 0.15 220 / 0.25)", "oklch(0.4 0.12 230 / 0.2)"], stroke: "oklch(0.85 0.17 195)", strokeW: 2.5, shine: "oklch(0.95 0.1 190 / 0.6)", hole: ["oklch(0.95 0.12 190)", "oklch(0.6 0.15 210)"], ring: "oklch(0.85 0.17 195 / 0.8)", grid: true },
  gold: { stops: ["oklch(0.98 0.08 95)", "oklch(0.86 0.16 85)", "oklch(0.68 0.15 70)", "oklch(0.45 0.1 60)"], shine: "oklch(1 0.05 100 / 0.9)", hole: ["oklch(0.25 0.05 60)", "oklch(0.45 0.1 65)"], ring: "oklch(0.95 0.15 90 / 0.7)" },
  alien: { stops: ["oklch(0.95 0.12 140)", "oklch(0.82 0.2 140)", "oklch(0.65 0.2 145)", "oklch(0.45 0.15 150)"], shine: "oklch(1 0.08 130 / 0.75)", hole: ["oklch(0.25 0.12 300)", "oklch(0.45 0.18 310)"], ring: "oklch(0.4 0.15 150 / 0.6)" },
};

export function Buttocks({ params, jiggle, stink, style = "peach" }: { params: FartParams; jiggle: number; stink: number; style?: ButtStyle }) {
  // Geometry derived from params
  const w = 260 + params.cheekSize * 90;
  const h = 240 + params.cheekSize * 70;
  const cheekW = w / 2;
  const round = 0.92 + (1 - params.cheekShape) * 0.18;
  const holeR = 6 + params.holeSize * 12;
  const cx = w / 2;
  const cy = h * 0.5;
  const cheekRY = h * 0.46 * round;
  const cheekRX = cheekW * 0.62;
  // Straight-on: cheeks slightly overlap on the centerline
  const overlap = cheekRX * 0.18;
  const leftCX = cx - cheekRX + overlap;
  const rightCX = cx + cheekRX - overlap;
  const holeCY = cy + cheekRY * 0.05;
  const L = LOOKS[style] ?? LOOKS.peach;
  const uid = useId().replace(/:/g, "");
  const id = `b-${style}-${uid}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: w + 80, height: h + 120 }}>
      {/* Stink clouds */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`${stink}-${i}`}
          className={stink ? "animate-stink" : ""}
          style={{
            position: "absolute",
            left: "50%",
            top: `calc(50% + ${holeCY - h / 2 - 22}px)`,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(0.78 0.18 130 / 0.85), transparent 70%)",
            animationDelay: `${i * 0.15}s`,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      <svg
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${w} ${h}`}
        key={jiggle}
        style={{
          animation: jiggle ? "jiggle 0.7s var(--ease-fart)" : undefined,
          transformOrigin: "center bottom",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Soft peachy 3D cheek — bright top-left highlight, deep warm shadow bottom-right */}
          <radialGradient id={`${id}-cheekL`} cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor={L.stops[0]} />
            <stop offset="35%" stopColor={L.stops[1]} />
            <stop offset="75%" stopColor={L.stops[2]} />
            <stop offset="100%" stopColor={L.stops[3]} />
          </radialGradient>
          <radialGradient id={`${id}-cheekR`} cx="62%" cy="32%" r="78%">
            <stop offset="0%" stopColor={L.stops[0]} />
            <stop offset="35%" stopColor={L.stops[1]} />
            <stop offset="75%" stopColor={L.stops[2]} />
            <stop offset="100%" stopColor={L.stops[3]} />
          </radialGradient>
          {/* Deep crack shadow */}
          <radialGradient id={`${id}-crack`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.35 0.1 35 / 0.85)" />
            <stop offset="60%" stopColor="oklch(0.5 0.12 40 / 0.4)" />
            <stop offset="100%" stopColor="oklch(0.6 0.12 45 / 0)" />
          </radialGradient>
          {/* Hole */}
          <radialGradient id={`${id}-holeFill`} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={L.hole[0]} />
            <stop offset="100%" stopColor={L.hole[1]} />
          </radialGradient>
          {/* Soft contact shadow under butt */}
          <radialGradient id={`${id}-ground`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.25 0.03 30 / 0.45)" />
            <stop offset="100%" stopColor="oklch(0.25 0.03 30 / 0)" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx={cx} cy={h - 8} rx={cheekW * 0.95} ry={14} fill={`url(#${id}-ground)`} />

        {/* Right cheek (drawn first so left overlaps it slightly — straight-on symmetric look) */}
        <ellipse cx={rightCX} cy={cy} rx={cheekRX} ry={cheekRY} fill={`url(#${id}-cheekR)`} stroke={L.stroke} strokeWidth={L.strokeW} />
        {/* Left cheek */}
        <ellipse cx={leftCX} cy={cy} rx={cheekRX} ry={cheekRY} fill={`url(#${id}-cheekL)`} stroke={L.stroke} strokeWidth={L.strokeW} />

        {L.grid && [0.25, 0.45, 0.65, 0.85].map(f => <line key={f} x1={leftCX - cheekRX} x2={rightCX + cheekRX} y1={h * f} y2={h * f} stroke={L.ring} strokeWidth={1} opacity={0.45} />)}
        {L.grid && <line x1={cx} x2={cx} y1={cy - cheekRY} y2={cy + cheekRY} stroke={L.ring} strokeWidth={1.5} />}

        {/* Crack highlight streak — brightens on press */}
        <ellipse
          key={`crack-shine-${jiggle}`}
          cx={cx}
          cy={cy - cheekRY * 0.1}
          rx={Math.max(2, cheekRX * 0.018)}
          ry={cheekRY * 0.55}
          fill="oklch(1 0.04 80 / 0.55)"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: jiggle ? "crack-shine 0.7s var(--ease-fart)" : undefined,
            opacity: 0.25,
          }}
        />


        {/* Glossy highlights — top of each cheek */}
        <ellipse
          cx={leftCX - cheekRX * 0.18}
          cy={cy - cheekRY * 0.55}
          rx={cheekRX * 0.32}
          ry={cheekRY * 0.16}
          fill={L.shine}
        />
        <ellipse
          cx={rightCX + cheekRX * 0.18}
          cy={cy - cheekRY * 0.55}
          rx={cheekRX * 0.32}
          ry={cheekRY * 0.16}
          fill={L.shine}
        />

        {/* Butthole — soft, no harsh outline */}
        <ellipse
          cx={cx}
          cy={holeCY}
          rx={holeR * 1.4}
          ry={holeR * 1.1}
          fill="oklch(0.55 0.12 35 / 0.5)"
        />
        <ellipse
          cx={cx}
          cy={holeCY}
          rx={holeR * 0.9}
          ry={holeR}
          fill={`url(#${id}-holeFill)`}
        />

        {/* Skin ripple on press */}
        {jiggle > 0 && (
          <g key={`ripple-${jiggle}`}>
            <defs>
              <clipPath id={`${id}-clip-${jiggle}`}>
                <ellipse cx={leftCX} cy={cy} rx={cheekRX} ry={cheekRY} />
                <ellipse cx={rightCX} cy={cy} rx={cheekRX} ry={cheekRY} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}-clip-${jiggle})`}>
              {[0, 0.14, 0.28].map((delay, i) => (
                <ellipse
                  key={i}
                  cx={cx}
                  cy={holeCY}
                  rx={holeR * 1.8}
                  ry={holeR * 1.5}
                  fill="none"
                  stroke={L.ring}
                  strokeWidth={2}
                  style={{
                    transformOrigin: `${cx}px ${holeCY}px`,
                    animation: `skin-ripple 0.7s var(--ease-fart) ${delay}s both`,
                  }}
                />
              ))}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
