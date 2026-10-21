import { describe, expect, it } from "vitest";
import names from "./fart-names.json";
import { getGameSoundConfig } from "./game-sounds";

// The game's tap sound defaults to the library clip named "Crisp Toot".
describe("flappy cheeks default sounds", () => {
  it("defaults the tap toot to Crisp Toot", () => {
    const config = getGameSoundConfig();
    expect(config.toot).toBe("p111");
    expect((names as Record<string, string>)["p111"]).toBe("Crisp Toot");
  });

  it("keeps the crash splat on the random wet pool", () => {
    expect(getGameSoundConfig().splat).toBe("random");
  });
});
