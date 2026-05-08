import { FartParams } from "@/lib/fart-synth";

export function Buttocks({ params, jiggle, stink }: { params: FartParams; jiggle: number; stink: number }) {
  // Geometry derived from params
  const w = 240 + params.cheekSize * 80;
  const h = 230 + params.cheekSize * 60;
  const cheekW = w / 2;
  const round = 0.82 + (1 - params.cheekShape) * 0.22;
  const holeR = 7 + params.holeSize * 14;
  const cx = w / 2;
  const cy = h * 0.52;
  const cheekRY = h * 0.46 * round;
  const cheekRX = cheekW * 0.6;
  const leftCX = cheekW * 0.5;
  const rightCX = w - cheekW * 0.5;
  const holeCY = cy + cheekRY * 0.18;
  const stroke = "oklch(0.25 0.06 30)";
  const strokeW = 4;

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
        style={{ animation: jiggle ? "jiggle 0.5s ease-in-out" : undefined, transformOrigin: "center bottom" }}
      >
        <defs>
          {/* Flat-ish cartoon fill with a soft top highlight */}
          <radialGradient id="cheekFill" cx="50%" cy="32%" r="70%">
            <stop offset="0%" stopColor="oklch(0.95 0.05 60)" />
            <stop offset="55%" stopColor="var(--color-skin)" />
            <stop offset="100%" stopColor="var(--color-skin)" />
          </radialGradient>
          {/* Solid cartoon hole */}
          <radialGradient id="holeFill" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="oklch(0.18 0.04 30)" />
            <stop offset="100%" stopColor="oklch(0.32 0.07 30)" />
          </radialGradient>
          {/* Cartoon ground shadow */}
          <radialGradient id="ground" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.2 0.03 30 / 0.4)" />
            <stop offset="100%" stopColor="oklch(0.2 0.03 30 / 0)" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx={cx} cy={h - 6} rx={cheekW * 0.95} ry={12} fill="url(#ground)" />

        {/* Left cheek (with bold outline) */}
        <ellipse
          cx={leftCX}
          cy={cy}
          rx={cheekRX}
          ry={cheekRY}
          fill="url(#cheekFill)"
          stroke={stroke}
          strokeWidth={strokeW}
        />
        {/* Right cheek */}
        <ellipse
          cx={rightCX}
          cy={cy}
          rx={cheekRX}
          ry={cheekRY}
          fill="url(#cheekFill)"
          stroke={stroke}
          strokeWidth={strokeW}
        />

        {/* Big shiny highlight on each cheek (cartoon style) */}
        <ellipse
          cx={leftCX - cheekRX * 0.25}
          cy={cy - cheekRY * 0.5}
          rx={cheekRX * 0.28}
          ry={cheekRY * 0.18}
          fill="oklch(1 0.02 80 / 0.85)"
        />
        <ellipse
          cx={rightCX + cheekRX * 0.25}
          cy={cy - cheekRY * 0.5}
          rx={cheekRX * 0.28}
          ry={cheekRY * 0.18}
          fill="oklch(1 0.02 80 / 0.85)"
        />

        {/* Pink blush spots */}
        <circle
          cx={leftCX - cheekRX * 0.1}
          cy={cy + cheekRY * 0.05}
          r={Math.max(14, cheekRX * 0.18)}
          fill="oklch(0.78 0.16 25 / 0.55)"
        />
        <circle
          cx={rightCX + cheekRX * 0.1}
          cy={cy + cheekRY * 0.05}
          r={Math.max(14, cheekRX * 0.18)}
          fill="oklch(0.78 0.16 25 / 0.55)"
        />

        {/* Crack as a single bold curve */}
        <path
          d={`M ${cx} ${cy - cheekRY * 0.85}
              Q ${cx + 3} ${cy} ${cx} ${cy + cheekRY * 0.7}`}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          fill="none"
        />

        {/* Butthole — bold outlined cartoon dot */}
        <ellipse
          cx={cx}
          cy={holeCY}
          rx={holeR * 0.85}
          ry={holeR}
          fill="url(#holeFill)"
          stroke={stroke}
          strokeWidth={strokeW * 0.85}
        />
        {/* Hole shine */}
        <ellipse
          cx={cx - holeR * 0.25}
          cy={holeCY - holeR * 0.4}
          rx={holeR * 0.22}
          ry={holeR * 0.15}
          fill="oklch(0.92 0.04 60 / 0.85)"
        />

        {/* Skin ripple — cartoon rings on press */}
        {jiggle > 0 && (
          <g key={`ripple-${jiggle}`}>
            <defs>
              <clipPath id={`cheekClip-${jiggle}`}>
                <ellipse cx={leftCX} cy={cy} rx={cheekRX} ry={cheekRY} />
                <ellipse cx={rightCX} cy={cy} rx={cheekRX} ry={cheekRY} />
              </clipPath>
            </defs>
            <g clipPath={`url(#cheekClip-${jiggle})`}>
              {[0, 0.18, 0.36].map((delay, i) => (
                <ellipse
                  key={i}
                  cx={cx}
                  cy={holeCY}
                  rx={holeR * 1.6}
                  ry={holeR * 1.35}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={2}
                  style={{
                    transformOrigin: `${cx}px ${holeCY}px`,
                    animation: `skin-ripple 0.9s ease-out ${delay}s both`,
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
