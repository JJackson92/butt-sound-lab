import { useState } from "react";
import { FartParams } from "@/lib/fart-synth";

export function Buttocks({ params, jiggle, stink }: { params: FartParams; jiggle: number; stink: number }) {
  // Geometry derived from params
  const w = 220 + params.cheekSize * 70; // total width
  const h = 200 + params.cheekSize * 50;
  const cheekW = w / 2;
  const round = 60 + (1 - params.cheekShape) * 40; // round vs flat
  const holeR = 8 + params.holeSize * 16;

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
          <radialGradient id="cheek" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="oklch(0.92 0.07 50)" />
            <stop offset="60%" stopColor="var(--color-skin)" />
            <stop offset="100%" stopColor="var(--color-skin-shadow)" />
          </radialGradient>
          <radialGradient id="hole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.18 0.04 30)" />
            <stop offset="100%" stopColor="var(--color-hole)" />
          </radialGradient>
        </defs>

        {/* Left cheek */}
        <ellipse
          cx={cheekW * 0.55}
          cy={h * 0.5}
          rx={cheekW * 0.55}
          ry={h * 0.48 * (round / 100)}
          fill="url(#cheek)"
        />
        {/* Right cheek */}
        <ellipse
          cx={w - cheekW * 0.55}
          cy={h * 0.5}
          rx={cheekW * 0.55}
          ry={h * 0.48 * (round / 100)}
          fill="url(#cheek)"
        />

        {/* Crack shadow */}
        <ellipse cx={w / 2} cy={h * 0.5} rx={6} ry={h * 0.42} fill="oklch(0.45 0.08 35 / 0.5)" />

        {/* Butthole */}
        <ellipse
          cx={w / 2}
          cy={h * 0.55}
          rx={holeR * 0.7}
          ry={holeR}
          fill="url(#hole)"
        />
        {/* hole highlight */}
        <ellipse
          cx={w / 2 - holeR * 0.2}
          cy={h * 0.55 - holeR * 0.3}
          rx={holeR * 0.2}
          ry={holeR * 0.15}
          fill="oklch(0.5 0.1 30 / 0.6)"
        />
      </svg>
    </div>
  );
}
