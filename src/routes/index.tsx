import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Buttocks } from "@/components/Buttocks";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FOODS, FartParams, FoodKey, playFart } from "@/lib/fart-synth";
import { PresetLibrary } from "@/components/PresetLibrary";
import { FART_PRESETS, type FartPreset } from "@/lib/fart-presets";
import { playPresetAudio, type FartAudioEntry } from "@/lib/fart-audio";
import { ENVIRONMENTS, applyEnvironment, type EnvKey } from "@/lib/fart-reverb";

// Find the preset whose params are closest to the current slider settings.
function findNearestPreset(p: FartParams): FartPreset {
  let best = FART_PRESETS[0];
  let bestScore = Infinity;
  for (const preset of FART_PRESETS) {
    const q = preset.params;
    // Normalized squared distance per dimension (weights reflect range size).
    const d =
      Math.pow((p.cheekSize - q.cheekSize) / 1.5, 2) +
      Math.pow((p.cheekShape - q.cheekShape) / 1.0, 2) * 0.8 +
      Math.pow((p.holeSize - q.holeSize) / 1.3, 2) * 1.4 +
      Math.pow((p.pressure - q.pressure) / 1.2, 2) +
      (p.food === q.food ? 0 : 0.35);
    if (d < bestScore) {
      bestScore = d;
      best = preset;
    }
  }
  return best;
}

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
  const [presetId, setPresetId] = useState<string | undefined>();
  const [credit, setCredit] = useState<FartAudioEntry | null>(null);
  const [env, setEnv] = useState<EnvKey>("dry");
  const [wet, setWet] = useState(1);

  const changeEnv = (e: EnvKey) => {
    setEnv(e);
    applyEnvironment(e, wet);
  };
  const changeWet = (w: number) => {
    setWet(w);
    applyEnvironment(env, w);
  };

  const update = <K extends keyof FartParams>(k: K, v: FartParams[K]) => {
    setParams((p) => ({ ...p, [k]: v }));
    setPresetId(undefined); // manual edit clears preset selection
  };

  const fart = async () => {
    const match = findNearestPreset(params);
    setPresetId(match.id);
    setJiggle((n) => n + 1);
    setStink((n) => n + 1);
    const entry = await playPresetAudio(match.id);
    if (entry) {
      setCredit(entry);
    } else {
      playFart(params);
      setCredit(null);
    }
  };

  const pickPreset = async (preset: FartPreset) => {
    setParams(preset.params);
    setPresetId(preset.id);
    setJiggle((n) => n + 1);
    setStink((n) => n + 1);
    const entry = await playPresetAudio(preset.id);
    if (entry) {
      setCredit(entry);
    } else {
      // fall back to synth if audio missing
      playFart(preset.params);
      setCredit(null);
    }
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

        <Card className="mt-6 p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-lg">🌀 Echo Environment</h2>
            <span className="text-xs text-muted-foreground">Where are you ripping it?</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {ENVIRONMENTS.map((e) => (
              <button
                key={e.key}
                onClick={() => changeEnv(e.key)}
                className={`rounded-lg border-2 p-2 text-center transition-all hover:scale-105 ${
                  env === e.key ? "border-primary bg-accent shadow-md" : "border-border bg-card"
                }`}
              >
                <div className="text-2xl">{e.emoji}</div>
                <div className="text-[10px] mt-1 leading-tight">{e.label.replace(" (no echo)", "")}</div>
              </button>
            ))}
          </div>
          <ControlSlider
            label="Echo Amount"
            hint="Subtle ↔ Drenched"
            value={wet}
            min={0}
            max={1.5}
            step={0.02}
            onChange={changeWet}
          />
        </Card>

        <div className="mt-6">
          <PresetLibrary onPick={pickPreset} currentId={presetId} />
        </div>

        {credit && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            🔊 Real recording:{" "}
            <a href={credit.url} target="_blank" rel="noreferrer" className="underline">
              "{credit.name}"
            </a>{" "}
            by <span className="font-medium">{credit.user}</span> on Freesound ({credit.license.split("/").slice(-3, -2)[0] || "CC"})
          </p>
        )}
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
