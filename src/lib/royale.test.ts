import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pairKey, pickPair } from "./royale";

const roster = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("pickPair", () => {
  it("never pits a fart against itself", () => {
    for (let i = 0; i < 50; i++) {
      const p = pickPair(roster, new Set())!;
      assert.notEqual(p[0].id, p[1].id);
    }
  });
  it("skips pairs the voter already judged", () => {
    const p = pickPair(roster, new Set([pairKey("a", "b"), pairKey("a", "c")]))!;
    assert.deepEqual(p.map((f) => f.id).sort(), ["b", "c"]);
  });
  it("returns null when every pair is judged", () => {
    assert.equal(pickPair(roster, new Set([pairKey("a", "b"), pairKey("a", "c"), pairKey("b", "c")])), null);
  });
});
