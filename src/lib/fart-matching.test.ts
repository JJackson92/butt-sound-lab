import { describe, expect, test } from "bun:test";
import { FART_PRESETS, findNearestPreset, measuredParams } from "./fart-matching";
import type { FartParams } from "./fart-synth";

const params: FartParams = { cheekSize: 1, cheekShape: 0.5, holeSize: 0.3, pressure: 1, food: "beans" };
const profile = { pitchHz: 500, tonality: 0.8, flatness: 0.01, lowEnergy: 0.1, rms: 0.1, variation: 0.4, activeDuration: 0.5 };

describe("recorded sound matching", () => {
  test("high-pitched tonal squeaks map to small tight holes", () => {
    expect(measuredParams(profile, params).holeSize).toBeCloseTo(0.28);
  });
  test("noisy air maps to large loose holes even when bright", () => {
    expect(measuredParams({ ...profile, pitchHz: 800, tonality: 0.2, flatness: 0.2 }, params).holeSize).toBe(1.5);
  });
  test("tight settings cannot select loose recordings", () => {
    const loose = { id: "loose", name: "loose", description: "", params: { ...params, holeSize: 1.3 } };
    expect(findNearestPreset(params, [loose])).toBeNull();
  });
  test("loose settings cannot select tight recordings", () => {
    const tight = { id: "tight", name: "tight", description: "", params };
    expect(findNearestPreset({ ...params, holeSize: 1.3 }, [tight])).toBeNull();
  });
  test("no recording within pressure filter returns synth fallback", () => {
    const loud = { id: "loud", name: "loud", description: "", params: { ...params, pressure: 1.5 } };
    expect(findNearestPreset({ ...params, pressure: 0.3 }, [loud])).toBeNull();
  });
  test("same settings consistently select the exact recording", () => {
    for (const preset of FART_PRESETS) {
      expect(findNearestPreset(preset.params)?.id).toBe(preset.id);
    }
  });
});