# Part 1 QA

## Checks performed

- Syntax validation passes for the four runtime modules.
- Five model tests pass: deterministic beat-aligned charts, judgement boundaries, complete 64-note run, miss termination, lower edge score and clamped input.
- Static build completes with no runtime dependencies.

## Browser validation

`tests/browser.mjs` is the repeatable browser suite. GitHub Actions executes it and stores screenshots/video under the `tile-rush-mobile-evidence` artifact. It checks four portrait widths, track selection, audio unlock, pause/resume, mute, miss/retry, persistent best scores, an entire 64-note track using real touch events, interruption, landscape fallback and silent/denied-storage fallback.

Local Chromium could not start in the authoring workspace: process singleton socket creation returned `Operation not permitted`. The separate preview browser could not connect to the local server. These are environment blockers; local screenshots and physical-device performance have not been verified. See the PR checks for the independent CI result rather than treating the presence of the suite as a passing result.

## Manual phone test for the next review

1. Use an HTTPS-hosted build on Android Chrome in portrait, first with speakers, then headphones.
2. Confirm sound begins only after Play. Drag from the bottom third without page scrolling or finger repositioning causing a ball jump.
3. Test both tracks. Miss, retry and complete a run. Reload and confirm the best score.
4. Pause for 10 seconds and resume. Switch apps, lock/unlock, rotate, and test an incoming notification/call. The run must pause and wait for an explicit resume.
5. Play for 15 minutes, including 20 retries. Record phone/OS/browser, audio route, obvious latency, stutter, warmth, battery change and any sound failure.
6. Test large text, a 320 px wide viewport, motion reduction and keyboard navigation. Core game travel is still animated.

## Known limits

No APK, PWA offline cache, native orientation lock, audio latency calibration, cloud save, analytics, third-party songs, purchases or ads. Audio is synthesised prototype music, not a mastered soundtrack. Desktop emulation cannot verify physical touch latency, Bluetooth output delay, sustained frame rate, battery impact or interruption behaviour on every phone. Complete these checks in Parts 2 and 4 before release.
