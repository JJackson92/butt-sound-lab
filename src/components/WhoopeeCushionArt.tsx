// Cartoon whoopee cushion used as the Whoopee Cushion page backdrop.
export function WhoopeeCushionArt({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 260" aria-hidden="true">
      <defs>
        <radialGradient id="wc-body" cx="40%" cy="35%" r="70%">
          <stop offset="0%" style={{ stopColor: "var(--coral)" }} />
          <stop offset="100%" style={{ stopColor: "var(--accent)" }} />
        </radialGradient>
      </defs>
      <g className="mc-cap">
        <ellipse cx="190" cy="150" rx="140" ry="85" style={{ fill: "url(#wc-body)" }} />
        <ellipse cx="150" cy="115" rx="55" ry="20" style={{ fill: "var(--background)", opacity: 0.35 }} />
        <path d="M318 135 L380 118 Q395 140 380 162 L318 160 Z" style={{ fill: "url(#wc-body)" }} />
      </g>
      <g className="mc-rings" style={{ fill: "none", stroke: "var(--neon)", strokeWidth: 6, strokeLinecap: "round" }}>
        <path d="M395 110 q15 30 0 60" />
        <path d="M410 95 q22 45 0 90" />
      </g>
    </svg>
  );
}

// Small air-filled whoopee cushion used inside the ARM THE CUSHION button.
export function InflatedCushionIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 44" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="wc-icon-body" cx="34%" cy="26%" r="78%">
          <stop offset="0%" style={{ stopColor: "color-mix(in oklch, var(--coral) 60%, white)" }} />
          <stop offset="55%" style={{ stopColor: "var(--coral)" }} />
          <stop offset="100%" style={{ stopColor: "color-mix(in oklch, var(--coral) 76%, black)" }} />
        </radialGradient>
      </defs>
      <path d="M19 25 L4 17 Q-1 24 4 31 L19 33 Z" style={{ fill: "url(#wc-icon-body)" }} />
      <ellipse cx="37" cy="22" rx="26" ry="18" style={{ fill: "url(#wc-icon-body)" }} />
      <ellipse
        cx="37"
        cy="22"
        rx="20"
        ry="12.5"
        style={{
          fill: "none",
          stroke: "color-mix(in oklch, var(--coral) 52%, black)",
          strokeWidth: 1.8,
          opacity: 0.55,
        }}
      />
      <ellipse cx="29" cy="12" rx="11" ry="4.5" style={{ fill: "white", opacity: 0.42 }} />
    </svg>
  );
}
