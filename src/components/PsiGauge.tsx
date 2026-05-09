import { pressureToPsi } from "@/lib/fart-synth";

export function PsiGauge({ pressure }: { pressure: number }) {
  const psi = pressureToPsi(pressure);
  // Sweep from -120deg (0 PSI) to +120deg (100 PSI)
  const angle = -120 + (psi / 100) * 240;
  // Color shift: green -> yellow -> red as PSI rises
  const hue = 130 - (psi / 100) * 130;

  // Tick marks every 10 PSI
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const t = -120 + (i / 10) * 240;
    return t;
  });

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-32 h-20 overflow-hidden">
        <svg viewBox="0 0 120 70" className="w-full h-full">
          {/* Arc background */}
          <path
            d="M 10 65 A 50 50 0 0 1 110 65"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Color arc up to current value */}
          <path
            d="M 10 65 A 50 50 0 0 1 110 65"
            fill="none"
            stroke={`hsl(${hue} 80% 50%)`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(psi / 100) * 157} 999`}
            style={{ transition: "stroke-dasharray 200ms ease, stroke 200ms ease" }}
          />
          {/* Tick marks */}
          {ticks.map((t, i) => {
            const rad = (t * Math.PI) / 180;
            const x1 = 60 + Math.sin(rad) * 42;
            const y1 = 65 - Math.cos(rad) * 42;
            const x2 = 60 + Math.sin(rad) * 48;
            const y2 = 65 - Math.cos(rad) * 48;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--foreground))"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.6}
                opacity={0.6}
              />
            );
          })}
          {/* Needle */}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "60px 65px", transition: "transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <line x1="60" y1="65" x2="60" y2="20" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <circle cx="60" cy="65" r="4" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="text-center -mt-1">
        <div className="font-mono font-bold text-lg leading-none">{psi}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">PSI</div>
      </div>
    </div>
  );
}
