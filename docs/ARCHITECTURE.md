# Architecture

- `src/model.js`: track definitions, deterministic charts, explicit landing judgement and state. Pure logic; no DOM/audio dependencies.
- `src/audio.js`: Web Audio clock, 25 ms scheduler with a 150 ms lookahead, original melody/bass/percussion synthesis, mute and lifecycle. Silent fallback uses a monotonic clock.
- `src/renderer.js`: Canvas 2D perspective projection, automatic bounce, active tile, background and bounded transient effects. Drawing resolution caps at 2× device pixels.
- `src/main.js`: home/play/pause/result flow, input, storage, focus and interruption handling. A single animation frame loop runs only during play.
- `index.html` / `styles.css`: semantic home/HUD/dialogs, responsive portrait layout, safe areas and landscape fallback.
- `scripts/build.mjs`: copies only public app files to `dist`.
- `server.mjs`: development server; do not treat it as a hardened internet service.

The chart and animation use musical elapsed time (`AudioContext.currentTime - origin`), rather than adding a constant distance on every frame. Each note is consumed exactly once. Input is relative horizontal movement clamped to the track width. Judgement compares horizontal separation at the landing beat: ≤0.10 is perfect; ≤0.26 is good; greater is a miss.

Pause stops animation, freezes the audio context, cancels scheduled voices and anchors the clock to the last rendered simulation time. Resume schedules future notes from that position. This also prevents a long stalled frame from consuming several notes with an old input sample. Audio context recreation is avoided across retries. Completed/stopped voices disconnect; there is only one scheduler per session. The audio context suspends when a run stops, avoiding idle audio processing.

No external music downloads, trackers or backend calls occur. Local storage contains only best scores and mute preference. Malformed or unavailable storage does not prevent play.

Future audio calibration should change the visual/judgement offset together. Keep chart format validation and content rights records separate from rendering. Native packaging is planned; the static build already has an index at its root for a future Capacitor webDir.
