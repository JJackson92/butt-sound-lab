import { FartParams } from "@/lib/fart-synth";

export function Buttocks({ params, jiggle, stink }: { params: FartParams; jiggle: number; stink: number }) {
  // Geometry derived from params
  const w = 240 + params.cheekSize * 80;
  const h = 230 + params.cheekSize * 60;
  const cheekW = w / 2;
  const round = 0.78 + (1 - params.cheekShape) * 0.22; // round vs flat (vertical squash)
  const holeR = 7 + params.holeSize * 14;
  const cx = w / 2;
  const cy = h * 0.52;
  const cheekRY = h * 0.46 * round;
  const cheekRX = cheekW * 0.58;
  const leftCX = cheekW * 0.52;
  const rightCX = w - cheekW * 0.52;
  const holeCY = cy + cheekRY * 0.18;

  // Pucker wrinkles (radial lines around hole) — more for tight, fewer for loose
  const wrinkleCount = 14;
  const wrinkles = Array.from({ length: wrinkleCount }).map((_, i) => {
    const a = (i / wrinkleCount) * Math.PI * 2;
    const r1 = holeR * 0.95;
    const r2 = holeR * (1.55 + (1 - params.holeSize / 1.5) * 0.45);
    return {
      x1: cx + Math.cos(a) * r1,
      y1: holeCY + Math.sin(a) * r1 * 0.85,
      x2: cx + Math.cos(a) * r2,
      y2: holeCY + Math.sin(a) * r2 * 0.85,
    };
  });

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
            bottom: 30,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(0.75 0.15 130 / 0.7), transparent 70%)",
            animationDelay: `${i * 0.15}s`,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ))}

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        key={jiggle}
        style={{ animation: jiggle ? "jiggle 0.5s ease-in-out" : undefined, transformOrigin: "center bottom" }}
      >
        <defs>
          {/* Skin gradient — top highlight, bottom shadow under cheek */}
          <radialGradient id="cheekL" cx="55%" cy="30%" r="75%">
            <stop offset="0%" stopColor="oklch(0.94 0.06 55)" />
            <stop offset="45%" stopColor="var(--color-skin)" />
            <stop offset="85%" stopColor="var(--color-skin-shadow)" />
            <stop offset="100%" stopColor="oklch(0.55 0.09 35)" />
          </radialGradient>
          <radialGradient id="cheekR" cx="45%" cy="30%" r="75%">
            <stop offset="0%" stopColor="oklch(0.94 0.06 55)" />
            <stop offset="45%" stopColor="var(--color-skin)" />
            <stop offset="85%" stopColor="var(--color-skin-shadow)" />
            <stop offset="100%" stopColor="oklch(0.55 0.09 35)" />
          </radialGradient>
          {/* Crack shadow gradient */}
          <linearGradient id="crack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.55 0.08 35 / 0)" />
            <stop offset="50%" stopColor="oklch(0.32 0.07 30 / 0.85)" />
            <stop offset="100%" stopColor="oklch(0.55 0.08 35 / 0)" />
          </linearGradient>
          {/* Butthole — dark center with brownish ring */}
          <radialGradient id="hole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.12 0.03 30)" />
            <stop offset="55%" stopColor="oklch(0.25 0.06 30)" />
            <stop offset="100%" stopColor="oklch(0.42 0.09 35)" />
          </radialGradient>
          {/* Soft body shadow under butt */}
          <radialGradient id="ground" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.2 0.03 30 / 0.45)" />
            <stop offset="100%" stopColor="oklch(0.2 0.03 30 / 0)" />
          </radialGradient>
          {/* Subtle skin freckle/texture noise via filter */}
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
            <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.08 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx={cx} cy={h - 8} rx={cheekW * 0.95} ry={14} fill="url(#ground)" />

        {/* Lower back hint (small curve at top center) */}
        <path
          d={`M ${cx - cheekRX * 0.6} ${cy - cheekRY * 0.95}
              Q ${cx} ${cy - cheekRY * 1.05} ${cx + cheekRX * 0.6} ${cy - cheekRY * 0.95}`}
          fill="none"
          stroke="var(--color-skin-shadow)"
          strokeWidth={1.5}
          opacity={0.5}
        />

        {/* Left cheek */}
        <ellipse cx={leftCX} cy={cy} rx={cheekRX} ry={cheekRY} fill="url(#cheekL)" />
        {/* Right cheek */}
        <ellipse cx={rightCX} cy={cy} rx={cheekRX} ry={cheekRY} fill="url(#cheekR)" />

        {/* Skin grain overlay */}
        <ellipse cx={leftCX} cy={cy} rx={cheekRX} ry={cheekRY} filter="url(#grain)" opacity={0.35} />
        <ellipse cx={rightCX} cy={cy} rx={cheekRX} ry={cheekRY} filter="url(#grain)" opacity={0.35} />

        {/* Soft cheek highlights (specular) */}
        <ellipse
          cx={leftCX - cheekRX * 0.15}
          cy={cy - cheekRY * 0.45}
          rx={cheekRX * 0.32}
          ry={cheekRY * 0.18}
          fill="oklch(0.96 0.04 60 / 0.55)"
        />
        <ellipse
          cx={rightCX + cheekRX * 0.15}
          cy={cy - cheekRY * 0.45}
          rx={cheekRX * 0.32}
          ry={cheekRY * 0.18}
          fill="oklch(0.96 0.04 60 / 0.55)"
        />

        {/* Crack — soft elongated shadow */}
        <ellipse cx={cx} cy={cy} rx={Math.max(5, 4 + params.cheekShape * 6)} ry={cheekRY * 0.92} fill="url(#crack)" />
        {/* Crack core line */}
        <path
          d={`M ${cx} ${cy - cheekRY * 0.85}
              Q ${cx + 2} ${cy} ${cx} ${cy + cheekRY * 0.7}`}
          stroke="oklch(0.22 0.05 30 / 0.7)"
          strokeWidth={1.8}
          fill="none"
        />

        {/* Pucker wrinkles around hole */}
        <g opacity={0.55} stroke="oklch(0.35 0.07 30)" strokeWidth={1} strokeLinecap="round">
          {wrinkles.map((wr, i) => (
            <line key={i} x1={wr.x1} y1={wr.y1} x2={wr.x2} y2={wr.y2} />
          ))}
        </g>

        {/* Butthole ring (puckered halo) */}
        <ellipse
          cx={cx}
          cy={holeCY}
          rx={holeR * 1.4}
          ry={holeR * 1.2}
          fill="oklch(0.5 0.09 30 / 0.45)"
        />

        {/* Butthole */}
        <ellipse cx={cx} cy={holeCY} rx={holeR * 0.8} ry={holeR} fill="url(#hole)" />

        {/* Hole inner shadow */}
        <ellipse
          cx={cx}
          cy={holeCY + holeR * 0.15}
          rx={holeR * 0.5}
          ry={holeR * 0.6}
          fill="oklch(0.08 0.02 30 / 0.7)"
        />
        {/* Hole highlight */}
        <ellipse
          cx={cx - holeR * 0.25}
          cy={holeCY - holeR * 0.4}
          rx={holeR * 0.18}
          ry={holeR * 0.12}
          fill="oklch(0.7 0.06 40 / 0.55)"
        />

        {/* Sacral dimples above the cheeks */}
        <ellipse cx={cx - cheekRX * 0.5} cy={cy - cheekRY * 0.88} rx={3} ry={2} fill="oklch(0.5 0.08 35 / 0.5)" />
        <ellipse cx={cx + cheekRX * 0.5} cy={cy - cheekRY * 0.88} rx={3} ry={2} fill="oklch(0.5 0.08 35 / 0.5)" />
      </svg>
    </div>
  );
}
