import { describe, expect, it } from "vitest";
import { pairKey, pickPair } from "./royale";

const roster = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("pickPair", () => {
  it("never pits a fart against itself", () => {
    for (let i = 0; i < 50; i++) {
      const p = pickPair(roster, new Set());
      expect(p![0].id).not.toBe(p![1].id);
    }
  });
  it("skips pairs the voter already judged", () => {
    const seen = new Set([pairKey("a", "b"), pairKey("a", "c")]);
    const p = pickPair(roster, seen)!;
    expect(p.map((f) => f.id).sort()).toEqual(["b", "c"]);
  });
  it("returns null when every pair is judged", () => {
    const seen = new Set([pairKey("a", "b"), pairKey("a", "c"), pairKey("b", "c")]);
    expect(pickPair(roster, seen)).toBeNull();
  });
});
