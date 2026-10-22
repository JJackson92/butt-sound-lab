import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fanfareLength, fanfareNotes } from "./fanfare";

describe("fanfare", () => {
  it("opens with three rising calls", () => {
    const calls = fanfareNotes().filter((n) => n.at < 0.4);
    assert.equal(calls.length, 3);
    for (let i = 1; i < calls.length; i++) {
      assert.ok(calls[i].freq > calls[i - 1].freq, "each call should ring higher");
      assert.ok(calls[i].at > calls[i - 1].at, "each call should land later");
    }
  });

  it("lands on a held major chord", () => {
    const chord = fanfareNotes().filter((n) => n.at === 0.46 && n.dur > 0.5);
    assert.equal(chord.length, 4);
    assert.equal(new Set(chord.map((n) => n.freq)).size, 4, "chord voices should differ");
  });

  it("finishes before the matchup auto-advances at 1600ms", () => {
    const ms = fanfareLength() * 1000;
    assert.ok(ms >= 1000, "fanfare should feel like a win, not a blip");
    assert.ok(ms < 1600, "fanfare should end before the next matchup");
  });

  it("keeps every note in range and on or after the click", () => {
    for (const n of fanfareNotes()) {
      assert.ok(n.at >= 0, "no note should start before the click");
      assert.ok(n.gain > 0 && n.gain <= 1, "gain should stay audible but not clipping");
      assert.ok(n.freq > 20 && n.freq < 8000, "notes should stay within hearing");
    }
  });
});
