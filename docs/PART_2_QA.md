# Version 0.2 QA

## Checks performed

- `npm run check`, `npm test` (11 unit tests: song compilation, chart reachability and determinism, judgement, scoring, revive, clock pause/seek/resume, start cancellation, silent fallback) and `npm run build` pass.
- `npm run test:browser` passes in mobile-emulated Chrome (390×844, touch): four portrait layouts, menu preview, count-in, pause/resume, mute, miss → continue → try again, persistent bests, **a complete Neon Horizon run steered with real touch events to three stars**, landscape prompt, and play with Web Audio and storage removed. No uncaught page errors.
- Every track was rendered with `renderOffline()` in Chrome and measured per section: no clipped samples, peaks 0.75–0.88, full sections around −12 to −14 dB RMS.
- Screens were reviewed from screenshots of all five tracks, the menu, the miss dialog and the result dialog.

## Not verified

- **How the music sounds.** Levels and clipping were measured; the arrangements were written from music theory and have not been auditioned by ear. Expect to want changes to melodies, sounds and balance after listening.
- **Feel on a real phone.** Touch latency, Bluetooth delay, frame rate, heat and battery were not measured. The headless test machine has no GPU.
- **iOS Safari.** Only Chrome was run.

## Manual phone test

1. Open an HTTPS-hosted build in Chrome on Android, portrait, with headphones and then the speaker.
2. Tap each track card: its drop should play and the scene behind should match.
3. Play Neon Horizon. Check the ball lands on the beat of the lead melody, drag feels 1:1, and no page scrolling occurs.
4. Miss on purpose: Continue should count 3-2-1 and drop the ball onto the tile you missed. Miss again: only Try again is offered.
5. Pause for ten seconds, resume, switch apps, lock and unlock. The run must wait for Resume.
6. Finish a track; stars and best score must survive a reload.
7. Play 15 minutes including the two hard tracks. Note phone, browser, audio route, any stutter, late audio or heat.

## Known limits

No latency calibration screen yet (the game compensates with the browser's reported output latency only). No offline install, Android package, cloud save, cosmetics or practice mode. Audio is synthesised live, so very slow phones may crackle on the densest sections; the renderer lowers its resolution automatically but the synth does not yet have a low-cost mode.
