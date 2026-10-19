import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FartPreset } from "@/lib/fart-presets";
import { FART_PRESETS } from "@/lib/fart-matching";
import { FOODS } from "@/lib/fart-synth";

const FOOD_EMOJI = Object.fromEntries(FOODS.map((f) => [f.key, f.emoji]));

export function PresetLibrary({
  onPick,
  currentId,
}: {
  onPick: (preset: FartPreset) => void;
  currentId?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FART_PRESETS;
    return FART_PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.params.food.includes(s),
    );
  }, [q]);

  return (
    <Card className="p-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-bold text-lg">Preset Library</h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length} / {FART_PRESETS.length}
        </span>
      </div>
      <Input
        placeholder="Search 200 farts… (e.g. 'thunder', 'squeak', 'cheese')"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-3"
      />
      <div className="max-h-[420px] overflow-y-auto pr-1 space-y-1.5">
        {filtered.map((p) => {
          const active = p.id === currentId;
          return (
            <Button
              variant="outline"
              key={p.id}
              onClick={() => onPick(p)}
              className={`w-full h-auto block whitespace-normal text-left rounded-md border p-2.5 transition-all hover:bg-accent hover:border-primary ${
                active ? "border-primary bg-accent shadow-sm" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  <span>{FOOD_EMOJI[p.params.food]}</span>
                  {p.name}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-1">
                  ▶ play
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {p.description}
              </div>
            </Button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No farts match that. Try less specific.
          </p>
        )}
      </div>
      <div className="mt-3 pt-3 border-t">
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(FART_PRESETS, null, 2))}`} download="fart-presets.json">
            ⬇ Download all 200 as JSON
          </a>
        </Button>
      </div>
    </Card>
  );
}
