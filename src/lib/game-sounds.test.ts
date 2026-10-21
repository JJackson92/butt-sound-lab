import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import names from './fart-names.json';
import { getGameSoundConfig } from './game-sounds';

// The game's tap sound defaults to the library clip named "Crisp Toot".
describe('flappy cheeks default sounds', () => {
  it('defaults the tap toot to Crisp Toot', () => {
    const config = getGameSoundConfig();
    assert.equal(config.toot, 'p111');
    assert.equal((names as Record<string, string>)['p111'], 'Crisp Toot');
  });

  it('keeps the crash splat on the random wet pool', () => {
    assert.equal(getGameSoundConfig().splat, 'random');
  });
});
