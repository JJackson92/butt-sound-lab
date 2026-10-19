import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { FART_PRESETS, findNearestPreset, measuredParams, scorePreset } from "./fart-matching";
import type { FartParams } from "./fart-synth";

const params: FartParams = { cheekSize: 1, cheekShape: 0.5, holeSize: 0.3, pressure: 1, food: "beans" };
const profile = { pitchHz: 500, tonality: 0.8, flatness: 0.01, lowEnergy: 0.1, rms: 0.1, variation: 0.4, activeDuration: 0.5 };

describe("recorded sound matching", () => {
  test("high-pitched tonal squeaks map to small tight holes", () => {
    assert.ok(Math.abs(measuredParams(profile, params).holeSize - 0.28) < 0.0001);
  });
  test("noisy air maps to large loose holes even when bright", () => {
    assert.equal(measuredParams({ ...profile, pitchHz: 800, tonality: 0.2, flatness: 0.2 }, params).holeSize, 1.5);
  });
  test("tight settings cannot select loose recordings", () => {
    const loose = { id: "loose", name: "loose", description: "", params: { ...params, holeSize: 1.3 } };
    assert.equal(findNearestPreset(params, [loose]), null);
  });
  test("loose settings cannot select tight recordings", () => {
    const tight = { id: "tight", name: "tight", description: "", params };
    assert.equal(findNearestPreset({ ...params, holeSize: 1.3 }, [tight]), null);
  });
  test("no recording within pressure filter returns synth fallback", () => {
    const loud = { id: "loud", name: "loud", description: "", params: { ...params, pressure: 1.5 } };
    assert.equal(findNearestPreset({ ...params, pressure: 0.3 }, [loud]), null);
  });
  test("same settings consistently select a zero-distance recording", () => {
    for (const preset of FART_PRESETS) {
      const match = findNearestPreset(preset.params);
      assert.ok(match);
      assert.equal(scorePreset(preset.params, match.params), 0);
      assert.equal(findNearestPreset(preset.params)?.id, match.id);
    }
  });
});