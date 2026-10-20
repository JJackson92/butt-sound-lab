import { useEffect, useState } from "react";

const HEADLINES = [
  "3 NPCs emotionally devastated",
  "Mall food court evacuated",
  "Neighborhood air quality warning issued",
  "Grandma knocked unconscious for 12 seconds",
  "Local pigeons displaced",
  "Gas cloud reached DEFCON 2",
  "Hospital beds occupied: 47",
  "Civilization setback: 3 years",
  "NASA detects new atmospheric anomaly",
  "Cat filed for emotional damages",
  "Smoke alarm resigns in protest",
  "Houseplants wilted in 4-block radius",
  "Mailman switches careers mid-route",
  "Local meteorologist baffled by sudden front",
  "EPA opens investigation",
  "Toddler learns first curse word",
  "Uber driver awards 1-star posthumously",
  "Couch cushions file restraining order",
  "Yoga class achieves collective enlightenment",
  "Bigfoot sighted fleeing scene",
  "Stock market dips 4% on the news",
  "Dog refuses to make eye contact",
  "City declares state of emergency",
  "Wifi router unplugged itself",
  "Scented candles surrender",
  "Funeral home reports 2 reawakenings",
  "Local news anchor breaks character",
  "Air freshener industry stock soars",
  "Pope issues statement of concern",
  "Time briefly moved backwards",
  "Authorities responding to catastrophic turbulence event at airport terminal",
];

function pickHeadlines(seed: number, count = 6): string[] {
  const arr = [...HEADLINES];
  // simple shuffle seeded by `seed`
  let s = seed * 9301 + 49297;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export function NewsTicker({ trigger }: { trigger: number }) {
  const [items, setItems] = useState<string[]>(() => pickHeadlines(1));

  useEffect(() => {
    if (trigger === 0) return;
    setItems(pickHeadlines(trigger + Date.now()));
  }, [trigger]);

  const loop = [...items, ...items];

  return (
    <div className="news-ticker relative overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-stretch">
        <div className="shrink-0 bg-destructive text-destructive-foreground font-black uppercase text-xs px-3 flex items-center tracking-wider">
          <span className="animate-pulse">● Breaking</span>
        </div>
        <div className="flex-1 overflow-hidden py-2 relative">
          <div
            key={trigger}
            className="flex gap-12 whitespace-nowrap animate-[ticker_40s_linear_infinite] font-mono text-sm"
          >
            {loop.map((h, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="text-primary" aria-hidden>•</span>
                <span>{h}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
