# Architecture

Six small ES modules, no dependencies, no build step.

| File | Responsibility |
| --- | --- |
| `src/songs.js` | The catalogue: `GENRES` (five, each with five tracks) and flat `TRACKS`. A track is data: key, chord loop, drum/bass styles, sections and lead phrases. Five tracks are hand-written; the other twenty are composed by `compose()` from a seed, key, tempo and chord loop (see below). `compile()` expands any track into a timeline of sections and lead notes. |
| `src/model.js` | Rules. `createChart()` turns the lead line into tiles; `Run` judges landings, scores, awards stars and handles the single revive; `autoX()` is the autopilot used by the menu preview, `?demo` and tests. No DOM or audio. |
| `src/audio.js` | `Synth` (drums, bass, pads, arps, five lead voices, risers, impacts, reverb, echo, side-chain, bus compressor) and `Soundtrack` (the clock, 25 ms scheduler with 200 ms lookahead, pause/seek/resume, silent fallback). `renderOffline()` renders a whole track for mix checks. |
| `src/renderer.js` | Canvas 2D one-point perspective: sky and backdrop per theme, beat-locked floor grid, roadside scenery, section gates, tiles, ball, trail, particles, rings, beams, overlays. Adaptive resolution. |
| `src/main.js` | Screens, HUD, dialogs, input, storage and interruption handling. One animation loop. |
| `index.html`, `styles.css` | Markup and the neon interface. `--h` carries the selected track's accent hue. |

## Generated tracks

A genre profile fixes the sound: world, lead voice, bass style, scale, section layout (copied from the genre's hand-written track) and melodic range. Each generated track supplies a seed, tempo, key, scale and chord loop, and may swap its lead voice or drum kit. `genPhrase()` then writes three phrases in the same notation as the hand-written ones. Phrases A and B are four bars of long notes. Phrase H, the drop hook, is one repeated motif moved with the chords, with a fresh bar at bars 4 and 7 and a cadence on the chord root. Notes on strong beats prefer chord tones and motion is mostly stepwise. The seed makes every build identical. Difficulty comes from the slot (Easy, Easy, Medium, Hard, Expert): tile spacing, how far apart tiles may sit, scroll speed and how dense the hook rhythm is.

Generated melodies are a starting point, not final compositions; any track can be replaced by a hand-written one by adding it to `HAND` and naming it in a genre's `slots`.

## One clock

`Soundtrack.time` is song time in seconds (`AudioContext.currentTime − origin − output latency`); it is negative during the four-beat count-in. Tiles, ball height, camera, grid lines, colour changes and judgement are all functions of that value, so the picture cannot drift from the music. Only decorative particles integrate per frame.

Seeking sets a new origin and drops the voice bus (`Synth.cut()`), then the scheduler continues from the next sixteenth. Pause is "freeze the time the player last saw, suspend the context"; resume is a seek to that time. The same path serves the continue after a miss and the looping menu preview. A frame gap over 300 ms or a context that stops running pauses the game rather than judging tiles against stale input.

Without Web Audio (or before the first user gesture, for the menu) the same clock runs silently on `performance.now()`.

## From song to chart

1. Lead-note onsets become tiles.
2. Beats with no nearby note get a fill tile, so the ball never stops hopping.
3. Tiles closer together than the track's `minGap` are dropped.
4. Tile position follows the pitch of the note, folded into the stage and limited by the track's `reach` (lanes per second), so every tile is reachable.
5. The first tile of each section is wide; medium and hard tracks get occasional sliding tiles on slow hops.

Judgement compares ball and tile centre at the landing time: within `PERFECT × width` is perfect, within `TILE_HALF × width + GRACE` is good, otherwise a miss.

## Rendering budget

No `shadowBlur`; glow is additive strokes and a few gradients. Resolution starts at up to 2× device pixels and steps down to 1.5× then 1× if more than about half of a two-second window of frames exceed 24 ms. `prefers-reduced-motion` removes shake, flashes, pulses and speed lines; tile travel stays.

## Storage and privacy

`localStorage` holds best score and stars per track and the mute preference. No network requests, analytics or third-party code. Unavailable storage does not prevent play.

## Codex Piano Sessions extension

This Codex branch adapts the above presentation/gameplay from `claude/neon-overhaul` at `e42f68c65a90a62220825686c76381eb9c95f088`. The parallel branch is independent.

- `src/recording-data.js`: prepared real-performance metadata/cue timestamps; Piano Sessions is the first genre.
- `src/recordings.js`: lazy fetch/decode, a two-buffer LRU cache, one active recorded voice, sample-clock scheduling, gain and explicit voice teardown.
- `src/songs.js`: recorded tracks compile to a duration/section timeline without fabricating synth lead notes. `sectionAt` uses actual seconds for the recorded collection.
- `src/model.js`: recorded charts use the prepared non-uniform attacks, centred opening and reach-limited lane positions. Electronic tracks keep the existing chart builder.
- `src/audio.js`: selects sample playback for recordings and the existing synthesiser for electronic tracks. Recorded music uses no synth scheduling loop or electronic reward chimes. Seek/pause/revive resume the recording at the frozen song offset.
- `scripts/prepare-recordings.py`: optional authoring pipeline; reproducible source URLs, CC0 attribution, file hashes, audio edit parameters and attack selection. Audio is bundled for normal deployment; no runtime third-party media requests.

The existing browser-facing read-only clock is used by automation; `?demo` remains a visible autopilot that does not save scores. Tests validate genuine touch steering separately.
