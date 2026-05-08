import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Buttocks } from "@/components/Buttocks";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FOODS, FartParams, FoodKey, playFart } from "@/lib/fart-synth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [params, setParams] = useState<FartParams>({
    cheekSize: 1,
    cheekShape: 0.5,
    holeSize: 0.7,
    pressure: 1,
    food: "beans",
  });
  const [jiggle, setJiggle] = useState(0);
  const [stink, setStink] = useState(0);

  const update = <K extends keyof FartParams>(k: K, v: FartParams[K]) =>
    setParams((p) => ({ ...p, [k]: v }));

  const fart = () => {
    playFart(params);
    setJiggle((n) => n + 1);
    setStink((n) => n + 1);
  };

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            💨 Fart Simulator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Design the perfect toot. Adjust the cheeks, tighten the hole, pick your meal.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Stage */}
          <Card className="p-6 flex flex-col items-center justify-between bg-gradient-to-b from-secondary to-card">
            <div className="flex-1 flex items-center justify-center w-full">
              <Buttocks params={params} jiggle={jiggle} stink={stink} />
            </div>
            <Button
              size="lg"
              onClick={fart}
              className="w-full text-2xl font-bold py-8 mt-4 shadow-lg active:scale-95 transition-transform"
            >
              💨 LET IT RIP
            </Button>
          </Card>

          {/* Controls */}
          <Card className="p-6 space-y-6">
            <ControlSlider
              label="Cheek Size"
              hint="Bigger cheeks, beefier sound"
              value={params.cheekSize}
              min={0.5}
              max={2}
              step={0.05}
              onChange={(v) => update("cheekSize", v)}
            />
            <ControlSlider
              label="Cheek Shape"
              hint="Flat ↔ Round"
              value={params.cheekShape}
              min={0}
              max={1}
              step={0.02}
              onChange={(v) => update("cheekShape", v)}
            />
            <ControlSlider
              label="Butthole Size"
              hint="Tight squeak ↔ Loose blast"
              value={params.holeSize}
              min={0.2}
              max={1.5}
              step={0.02}
              onChange={(v) => update("holeSize", v)}
            />
            <ControlSlider
              label="Pressure"
              hint="How hard you push"
              value={params.pressure}
              min={0.3}
              max={1.5}
              step={0.02}
              onChange={(v) => update("pressure", v)}
            />

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Last meal</span>
                <span className="text-sm text-muted-foreground">{params.food}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {FOODS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => update("food", f.key as FoodKey)}
                    className={`rounded-lg border-2 p-2 text-center transition-all hover:scale-105 ${
                      params.food === f.key
                        ? "border-primary bg-accent shadow-md"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="text-2xl">{f.emoji}</div>
                    <div className="text-xs mt-1">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Headphones recommended. Volume varies wildly. Don't blame us.
        </p>
      </div>
    </main>
  );
}

function ControlSlider({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
