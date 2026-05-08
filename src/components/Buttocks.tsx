import { FartParams } from "@/lib/fart-synth";

export function Buttocks({ params, jiggle, stink }: { params: FartParams; jiggle: number; stink: number }) {
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
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(0.78 0.18 130 / 0.85), transparent 70%)",
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
        style={{
          animation: jiggle ? "jiggle 0.7s var(--ease-fart)" : undefined,
          transformOrigin: "center bottom",
        }}
      >
        <defs>
          {/* Soft peachy 3D cheek — bright top-left highlight, deep warm shadow bottom-right */}
          <radialGradient id="cheekL" cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor="oklch(0.97 0.04 70)" />
            <stop offset="35%" stopColor="oklch(0.9 0.08 60)" />
            <stop offset="75%" stopColor="oklch(0.78 0.13 50)" />
            <stop offset="100%" stopColor="oklch(0.62 0.14 40)" />
          </radialGradient>
          <radialGradient id="cheekR" cx="62%" cy="32%" r="78%">
            <stop offset="0%" stopColor="oklch(0.97 0.04 70)" />
            <stop offset="35%" stopColor="oklch(0.9 0.08 60)" />
            <stop offset="75%" stopColor="oklch(0.78 0.13 50)" />
            <stop offset="100%" stopColor="oklch(0.62 0.14 40)" />
          </radialGradient>
          {/* Deep crack shadow */}
          <radialGradient id="crack" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.35 0.1 35 / 0.85)" />
            <stop offset="60%" stopColor="oklch(0.5 0.12 40 / 0.4)" />
            <stop offset="100%" stopColor="oklch(0.6 0.12 45 / 0)" />
          </radialGradient>
          {/* Hole */}
          <radialGradient id="holeFill" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="oklch(0.22 0.05 30)" />
            <stop offset="100%" stopColor="oklch(0.42 0.1 35)" />
          </radialGradient>
          {/* Soft contact shadow under butt */}
          <radialGradient id="ground" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.25 0.03 30 / 0.45)" />
            <stop offset="100%" stopColor="oklch(0.25 0.03 30 / 0)" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx={cx} cy={h - 8} rx={cheekW * 0.95} ry={14} fill="url(#ground)" />

        {/* Right cheek (drawn first so left overlaps it slightly — straight-on symmetric look) */}
        <ellipse cx={rightCX} cy={cy} rx={cheekRX} ry={cheekRY} fill="url(#cheekR)" />
        {/* Left cheek */}
        <ellipse cx={leftCX} cy={cy} rx={cheekRX} ry={cheekRY} fill="url(#cheekL)" />

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
          fill="oklch(1 0.02 80 / 0.7)"
        />
        <ellipse
          cx={rightCX + cheekRX * 0.18}
          cy={cy - cheekRY * 0.55}
          rx={cheekRX * 0.32}
          ry={cheekRY * 0.16}
          fill="oklch(1 0.02 80 / 0.7)"
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
          fill="url(#holeFill)"
        />

        {/* Skin ripple on press */}
        {jiggle > 0 && (
          <g key={`ripple-${jiggle}`}>
            <defs>
              <clipPath id={`cheekClip-${jiggle}`}>
                <ellipse cx={leftCX} cy={cy} rx={cheekRX} ry={cheekRY} />
                <ellipse cx={rightCX} cy={cy} rx={cheekRX} ry={cheekRY} />
              </clipPath>
            </defs>
            <g clipPath={`url(#cheekClip-${jiggle})`}>
              {[0, 0.14, 0.28].map((delay, i) => (
                <ellipse
                  key={i}
                  cx={cx}
                  cy={holeCY}
                  rx={holeR * 1.8}
                  ry={holeR * 1.5}
                  fill="none"
                  stroke="oklch(0.5 0.1 35 / 0.5)"
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
