# ButtSounds.com — Phase 1 working release

## Goal
Turn the existing simulator into an instantly playable, shareable sound laboratory. Deliver Phase 1 first, preserving the working recordings, controls, matching rules, echo environments, butt animation, and news ticker. Gas density stays removed despite its inclusion in the older uploaded brief.

## Visual direction
- Bright Science Arcade overall: clean light surfaces, bold typography, vibrant lime, cyan, and coral accents, rounded interactive controls, and polished graphics.
- A darker, futuristic sound console within the Fart Lab: neon-accented meters, restrained glow, and dramatic effects driven by playback rather than decorative clutter.
- Keep the current straight-on cheek illustration and coordinated jiggle/ripple/shine, with no crack shadows. Improve framing on phones rather than replace it.
- Put **BUTT SOUNDS 💨**, “The Internet’s Most Unnecessary Sound Laboratory.”, “Create it. Name it. Share it.”, and a prominent **LET IT RIP!** action in the first screen. The homepage is playable, not a marketing page.
- Keep the BREAKING ticker readable on mobile. Respect reduced motion and limit screen shake to powerful sounds.

## What Phase 1 includes

### 1. Homepage and navigation
- Add a consistent branded header and mobile menu.
- Create working Home, Fart Lab, Sound Library, and shared-creation pages.
- Show shortcuts only to features that work in this release. Piano, Battles, and Hall of Fame enter navigation when their later phases are implemented—no dead links or fake feature buttons.

### 2. Simple and Advanced Fart Lab
- Default to four simple controls: **Size, Wetness, Duration, Power**. Each changes the audio, not just a number.
- Add explicit duration and wetness sound parameters; keep wetness separate from environmental echo.
- Advanced mode retains cheek size, cheek shape, butthole size, pressure/PSI, resonance, turbulence, meals including burrito, and all eight echo environments.
- Use one shared settings model so switching modes does not discard settings or create contradictory values.
- Add randomize, reset, replay, name, save, share, and WAV download actions.
- Retain settings during the session; never play automatically on page entry.

### 3. Reliable sound creation and playback
- Reuse and extend the current synthesizer rather than replace its character and meal profiles.
- Seed all randomized synthesis and reverb so replay, shared links, and downloads reproduce the same creation.
- Distinguish **custom synthesis** from **original recording playback**. Custom generation uses the exact settings so every control remains audible; library playback preserves the original recording.
- Preserve the existing measured recording matcher as an Advanced option, including tight/squeaky and loose/airy rules and synthesis fallback. Clearly identify the sound source rather than silently substitute a recording for a custom creation.
- Playback and export use the same rendered audio, including selected echo and its tail. Provide loading, playback, and failure states; initialize audio only after a user interaction.

### 4. Mystery Fart and Fart-O-Meter
- Mystery generates new settings and a seed, plays the result, and assigns a reusable combination-based ridiculous name.
- Allow mystery creations to be named, saved, shared, downloaded, and remixed like any other creation.
- Animate the pressure gauge and sound visualization from actual playback envelope data.
- Show duration, wetness, power, and a deterministic fictional Damage Rating based on settings—not invented decibel claims or unrelated random scores.

### 5. Shareable creations and downloads
- Create compact links at `/fart/<encoded-creation>` containing a validated, versioned name, settings, seed, source identifier, and echo configuration. No account or database is needed for these links.
- The recipient sees the creation name, settings, and Play, Save, Remix, Share, and Download actions. No autoplay.
- Use native sharing when supported, with copy-link fallback and clear confirmation.
- Download real, non-silent WAV files with sensible filenames. Prepare the file before the final download action so phone browsers retain the required user interaction.
- Do not add MP3 encoding unless reliable browser support is verified; WAV is the guaranteed Phase 1 format.
- For original recordings, verify license and cross-origin download access first. Preserve attribution. Never label a synthesized substitute as the original recording; explain unavailable recording downloads and offer an explicitly named synthesized remix instead.

### 6. Improved Sound Library and guest favorites
- Preserve the current 200 preset definitions, measured assignments, and recording attribution.
- Display 16 sounds initially, with Load More, search, acoustic category filters, and name sorting.
- Derive categories from measured character and duration where possible. Give duplicate titles distinguishable display labels while keeping original recording titles and credits available; descriptions remain honest about acoustic estimates.
- Add per-sound Play, Favorite, Share, supported Download, and Open in Lab actions.
- Add a small guest My Sounds view for favorites and named creations. Save locally without registration, as explicitly requested; distinguish device-local storage from shared links.
- Do not invent popularity counts or popularity ordering. Add those when real engagement tracking exists in Phase 3.
- Keep JSON export under advanced library options.

## Technical approach
- Keep React 19, TanStack Start/Router, and the existing semantic design system. Use separate route files for meaningful pages and reusable shared lab/library views.
- Keep acoustic measurements and matching in browser-safe shared modules; continue offline measurement generation, never analyze every recording on page load.
- Factor seeded synthesis and echo into reusable renderable audio modules, lazily initialized in the browser. Encode WAV from the resulting audio buffer.
- Add versioned validation for settings, locally stored creations, and URL payloads, with length/range limits and safe rendering of user-entered names.
- Phase 1 remains browser-powered and low-cost. Enable Lovable Cloud in Phase 3 for community submissions, votes, rankings, challenges, and moderation—not for basic local synthesis or parameter links.
- Give every content page unique titles, descriptions, canonical links, Open Graph metadata, and Twitter cards. Shared pages use their validated creation names. Add sitemap and robots coverage for the real indexable pages, without indexing every parameter combination.
- Record the accepted requirements and technical decisions, and update the project roadmap when implementation begins.

## Verification before Phase 1 is complete
- Run the existing matching tests and add focused tests for control mappings, seeded reproducibility, rating thresholds, share validation, and WAV encoding.
- Exercise create → change controls → play → name → save → share → open in a fresh browser → replay → remix → download.
- Verify downloaded WAV duration, nonzero audio samples, and playback. Compare exported and replayed buffer data for the same seeded creation.
- Verify original preset playback and honest behavior when remote recording playback/download access fails.
- Check desktop and phone layouts, navigation, touch controls, empty states, storage failures, reduced-motion behavior, and browser errors.
- Use available browsers for testing and explicitly report anything not checked on real iOS/Safari devices; do not claim universal browser support from Chromium alone.

## Later phases — not included in this release
1. **Phase 2:** Playable eight-key Fart Piano, performance recording/replay, Prank Mode with cancelable countdown, expanded My Sounds management, and further visualization.
2. **Phase 3:** Lovable Cloud-backed Battles, tracked popularity, community submissions, Hall of Fame, daily challenges using UTC, moderation, and anonymous vote-abuse protections. No fake engagement numbers.
3. **Phase 4:** Further mobile/accessibility refinement, performance tuning, social previews, cross-browser checks, and final polish. Core mobile usability, metadata, and accessibility are included from Phase 1.

No payments or subscriptions will be added. Build and verify Phase 1 before moving on to later phases.