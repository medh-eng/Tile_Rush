# Part 2 — real piano performances

12 November 2026. Work continues on `codex/part-1-playable-core`.

## Branch isolation and reused setup

The user's parallel version is `claude/neon-overhaul`, observed at `e42f68c65a90a62220825686c76381eb9c95f088` when this task began. This work reads that snapshot and adapts its neon presentation, genre/track menus, renderer, electronic catalogue and playable chart/controller foundation into the Codex branch. No push, ref change, merge, PR edit or deployment is made for Claude's branch. Its history remains independent.

The visual/gameplay baseline is Claude's contribution. This milestone adds a separate real-performance music path, the piano collection, recording-specific charts, source attribution, loading/error handling, cache limits, preview controls, interruption fixes and tests. It is not a claim that the reused baseline was newly authored here.

## What plays

Three 48-second excerpts of Bach performed by pianist Kimiko Ishizaka: BWV 846 in C major, BWV 855 in E minor and BWV 847 in C minor. The artist's release and the specific Wikimedia Commons file pages identify the recordings as CC0. Exact URLs and source hashes are kept in `public/music/rights.json`; in-game credits identify both composer and performer.

The audio is a real performance. Constant volume gain, silence trim, fades and MP3 encoding make a short mobile game edit. No notes are synthesised over these recordings, and no playback speed, pitch or expressive dynamics are changed. The original electronic collection remains available under its five existing genres.

## Timing and resource use

`src/recording-data.js` contains prepared attack times. The performance is not quantised; tiles follow those non-uniform timestamps. These are playable onset cues, not a claim of a fully musicologically annotated score. The first four tiles are centred and lateral travel is limited by the time between cues.

`src/recordings.js` lazily fetches/decode the selected MP3. It caches at most two decoded excerpts, schedules a single audio-buffer source against the existing audio clock, and stops the old source on a seek/pause/track switch. A failed download stays in the menu with a retry message; it does not silently substitute synthesised music. If the browser has no audio support at all, the existing clearly indicated silent-play fallback still works.

There is no synth scheduling interval or electronic reward chime during a recorded track. On recorded runs, per-perfect haptics are also suppressed so they do not distract from the piano. Preview audio can be paused separately.

## Asset preparation

Bundled MP3s make normal builds and play independent of Wikimedia availability. The three files total about 1.65 MiB. A selected decoded 48-second stereo excerpt occupies roughly 16 MiB at 44.1 kHz; two cached excerpts use roughly 32 MiB, excluding browser overhead.

To recreate the assets, install authoring-only `numpy`/`scipy` and ffmpeg, then run:

```sh
python scripts/prepare-recordings.py --source-dir /absolute/path/to/source-recordings
```

The script downloads missing originals, detects candidate attacks, selects reachable cue spacing, encodes each edit and writes the rights ledger and cue module. Runtime/build commands do not require Python or these authoring dependencies. Original complete recordings are not bundled.

## Validation and limits

Unit checks cover the existing electronic catalogue, recorded buffer seek/pause/mute/reuse, lazy loads, two-buffer eviction, download retry, file hashes, cue ordering/reachability, and flawless completion of each recorded chart. Browser checks cover portrait layout, all genre/track lists, normal play and a whole piano track driven by touch input, interruption, preview/play failure recovery and silent fallback.

Local Chromium launch is blocked by this authoring workspace's socket restrictions; browser checks run in GitHub Actions and store screenshots/video. Use the actual PR check result for browser verification. Listening preference, precise acoustic attack alignment, Bluetooth delay and sustained physical-phone performance still need device review. Latency calibration, more recordings/instrument families and the Android build remain subsequent work. This milestone does not mark all of the broader Part 2 roadmap complete.
