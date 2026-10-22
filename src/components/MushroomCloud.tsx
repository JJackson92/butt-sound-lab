// Cartoon mushroom cloud used as the Fart Bomb page backdrop.
// Colours come from the site theme tokens so it stays on-brand in any theme.
export function MushroomCloud({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 320" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mc-cap" cx="50%" cy="38%" r="68%">
          <stop offset="0%" style={{ stopColor: "var(--neon)", stopOpacity: 0.95 }} />
          <stop offset="60%" style={{ stopColor: "var(--accent)", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "var(--coral)", stopOpacity: 0.8 }} />
        </radialGradient>
        <linearGradient id="mc-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "var(--coral)", stopOpacity: 0.85 }} />
        </linearGradient>
        <radialGradient id="mc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--neon)", stopOpacity: 0.45 }} />
          <stop offset="100%" style={{ stopColor: "var(--neon)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* heat glow behind the blast */}
      <ellipse className="mc-glow" cx="210" cy="118" rx="200" ry="120" style={{ fill: "url(#mc-glow)" }} />

      {/* rolling ground burst */}
      <g className="mc-base" style={{ fill: "url(#mc-stem)" }}>
        <ellipse cx="210" cy="292" rx="152" ry="30" />
        <circle cx="88" cy="276" r="30" />
        <circle cx="332" cy="276" r="30" />
        <circle cx="140" cy="266" r="27" />
        <circle cx="280" cy="266" r="27" />
        <circle cx="210" cy="260" r="34" />
      </g>

      {/* rising column */}
      <path
        className="mc-stem"
        d="M180 148C170 196 152 236 138 288H282C268 236 250 196 240 148Z"
        style={{ fill: "url(#mc-stem)" }}
      />

      {/* billowing cap */}
      <g className="mc-cap" style={{ fill: "url(#mc-cap)" }}>
        <circle cx="210" cy="88" r="66" />
        <circle cx="150" cy="104" r="46" />
        <circle cx="272" cy="100" r="48" />
        <circle cx="196" cy="44" r="36" />
        <circle cx="150" cy="62" r="30" />
        <circle cx="258" cy="58" r="32" />
        <circle cx="118" cy="128" r="26" />
        <circle cx="302" cy="124" r="28" />
      </g>

      {/* shockwave rings */}
      <g className="mc-rings" style={{ fill: "none", stroke: "var(--coral)" }}>
        <ellipse cx="210" cy="290" rx="188" ry="40" strokeWidth="3" opacity="0.3" />
        <ellipse cx="210" cy="292" rx="228" ry="52" strokeWidth="2" opacity="0.18" />
      </g>

      {/* drifting debris */}
      <g className="mc-debris" style={{ fill: "var(--coral)", opacity: 0.45 }}>
        <circle cx="66" cy="170" r="6" />
        <circle cx="352" cy="158" r="5" />
        <circle cx="96" cy="212" r="4" />
        <circle cx="326" cy="206" r="4" />
      </g>
    </svg>
  );
}
