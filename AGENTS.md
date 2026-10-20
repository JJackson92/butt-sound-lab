# Project rules
- Keep recording measurements and preset matching in browser-safe library modules shared by the simulator and preset library; this prevents labels and playback settings from diverging.
- Generate acoustic measurements offline with the analysis script, not at page load; this avoids downloading every recording for each visitor.
- Represent shareable creations as validated versioned settings with a seed and explicit sound source; this keeps guest sharing independent of accounts.
- Render custom sounds into a seeded browser audio buffer shared by playback and WAV export; this makes replay and downloads identical.
- Store guest creations locally and session lab settings separately; this preserves anonymous favorites without introducing community data.