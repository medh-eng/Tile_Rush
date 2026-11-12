# Version 0.3 QA

## Checks performed

- `npm run check`, `npm test` (11 unit tests: song compilation, chart reachability and determinism, judgement, scoring, revive, clock pause/seek/resume, start cancellation, silent fallback) and `npm run build` pass.
- `npm run test:browser` passes in mobile-emulated Chrome (390×844, touch): four portrait layouts, menu preview, count-in, pause/resume, mute, miss → continue → try again, persistent bests, **a complete Neon Horizon run steered with real touch events to three stars**, landscape prompt, and play with Web Audio and storage removed. No uncaught page errors.
- Every one of the 25 tracks was rendered with `renderOffline()` in Chrome and measured: see the results in the pull request notes. The first five were checked in 0.2 (no clipping, peaks 0.75–0.88).
- The genre and track pages were reviewed from screenshots at 390×844 and 320×568; tests check that every genre lists five tracks and that Play stays on screen.
- Screens were reviewed from screenshots of all five tracks, the menu, the miss dialog and the result dialog.

## Not verified

- **How the music sounds.** Levels and clipping were measured; nobody has listened. The five original tracks were written by hand and the other twenty have generated melodies over hand-chosen chords, so some will be weaker than others. Expect to keep some, rework some and replace a few after listening.
- **Fairness of the hard charts.** Reachability is tested (every tile can be reached from the last at the track's reach rate, and a flawless autopilot completes all 25), but only a full run by touch on Neon Horizon was played in a browser. Expert tracks have not been played by a person.
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
