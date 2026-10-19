# Project rules
- Keep recording measurements and preset matching in browser-safe library modules shared by the simulator and preset library; this prevents labels and playback settings from diverging.
- Generate acoustic measurements offline with the analysis script, not at page load; this avoids downloading every recording for each visitor.