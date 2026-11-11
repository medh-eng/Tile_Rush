# Tile Rush — research and staged delivery plan

Prepared 11 November 2026. Part 1 is a playable web prototype, not a store release.

## Product direction

Build a portrait, one-finger music arcade game: the ball hops automatically on the beat, and the player drags sideways to land on the next tile. Short tracks, a readable path and immediate retry are the core loop. Tile Rush uses its own name, visual identity, interface, charts and synthesised music.

The supplied screenshots identify Amanotes' Tiles Hop. They show the store description and marketing screenshots, not a full gameplay recording. The official product portfolio and store listings support the bouncing-ball/hold-and-drag mechanic. Store download claims are publisher claims, not evidence of current virality, retention or profitability. We have not measured those metrics. A similar mechanic alone cannot establish that Tile Rush will attract the same audience.

### Source findings and decisions

| Finding | Source | Tile Rush decision |
| --- | --- | --- |
| Players guide a bouncing ball across tiles to music | [Amanotes portfolio](https://products.amanotes.com/) | Automatic forward progression and vertical hops; player controls horizontal position only |
| The official listing describes holding and dragging | [Official App Store listing](https://apps.apple.com/in/app/tiles-hop-rhythm-music-ball/id1344702806) | Relative drag anywhere on the playfield; no precision tapping or fixed virtual joystick |
| Web Audio provides a separate audio timeline and scheduled sound | [MDN currentTime](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime), [Web Audio specification](https://www.w3.org/TR/webaudio/) | Drive chart progression and rendering from the music clock; schedule audio ahead |
| Audio should be initiated by a user interaction | [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) | Unlock sound with the Play button; allow mute and silent fallback |
| Pointer events unify touch, mouse and pen; capture preserves drags | [MDN Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) | Pointer capture, relative horizontal movement and touch-action control |
| Background tabs can throttle animation and timers | [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) | Pause when hidden or interrupted; do not accumulate misses in the background |
| Capacitor supports an Android runtime for web applications | [Capacitor Android](https://capacitorjs.com/docs/android), [installation requirements](https://capacitorjs.com/docs/getting-started) | Keep a static dist build for an Android wrapper in Part 4; validate latency on devices first |
| Google Play requires rights to third-party content and branding | [Google Play intellectual property policy](https://support.google.com/googleplay/android-developer/answer/9888072?hl=en) | Original prototype music and art; add a rights ledger before introducing any third-party track |

Research informed the engineering choices; device performance and player preference remain hypotheses until tested. Recheck platform requirements when preparing a release.

## Why this implementation

| Option | Strength | Cost for this first milestone | Decision |
| --- | --- | --- | --- |
| Canvas 2D + Web Audio | Small static build, immediate browser access, direct audio scheduling, no game runtime to download | Must build and test projection, input and lifecycle handling ourselves | Selected for Part 1 |
| Phaser | Scene and asset tooling for a larger 2D game | Adds a dependency and more framework surface before the mechanic is validated | Reconsider if content complexity grows |
| Godot / Unity | Full 3D tooling and mature native game workflows | Larger setup and build process for an empty repository and a small prototype | Consider only if device trials show the web route cannot meet timing/performance needs |

The first build uses JavaScript modules with no runtime dependencies, an independent deterministic game model and a separate renderer/audio engine. It can be hosted below a repository subpath. No external fonts, songs, analytics, logins or ad SDKs are required.

## Five delivery parts

### Part 1 — playable core (this change)

Deliver a portrait home screen, two selectable original instrumental tracks, relative touch drag, perspective tiles and a bouncing ball. Include a four-beat count-in, centre/edge landings, scoring, combo multipliers, miss/result/retry, completion, pause, mute and local best scores. Support keyboard testing, small screens, safe areas and a portrait frame in landscape. Pause on tab hiding, pointer cancellation, window blur and unusually long frame gaps. Add model tests, browser checks, build instructions and CI.

Acceptance: an actual touch-driven run can reach the end of the chart; missing a tile ends the run; pause freezes chart and audio; reload retains best scores when storage is available; no uncaught browser errors; no horizontal overflow across 320–430 px portrait viewports. Physical device feel is a separate acceptance gate before release.

### Part 2 — music and chart quality

Replace the short synthesiser sketches with polished original or appropriately licensed masters. Define a versioned chart format with beat offset, lane position, tempo map and difficulty. Add an internal chart preview/validator, musical section transitions, gentle tutorials and a calibration screen with a saved latency offset. Test speakers, wired headphones and Bluetooth separately. Keep import of copyrighted popular songs out of the initial scope.

Acceptance: at least five complete tracks with a rights record, predictable sections, an audible musical climax and no chart/music drift on selected phones. Have three people independently play each easy chart without instruction beyond the on-screen tutorial.

### Part 3 — progression and replay

Add a local player profile, track unlocks, clear star rules, cosmetic ball styles, a practice mode and daily seeded challenges. Keep easy tracks available and retries immediate. Add shareable result images without accounts. Decide on analytics only after identifying the questions and data needed.

Acceptance: returning players retain unlocks, the scoring economy is documented, and practice scores cannot contaminate normal records. Evaluate first-run completion, voluntary retries, track completion, return visits and reported enjoyment. Set success targets from an initial pilot rather than inventing retention forecasts.

### Part 4 — installation and mobile performance

Add a PWA manifest, offline cache/update strategy and installable app icons. Package with Capacitor for Android, set the native portrait orientation and handle back, audio interruption and safe areas. Profile a lower-end Android phone, a midrange Android phone and an iPhone browser. Add explicit low-effects mode if profiling shows a need.

Targets, not measured promises: steady 60 fps on the chosen midrange phone, responsive drag without page scrolling, no hidden animation/audio loop, no persistent memory growth through repeated runs. Record device, OS, browser, temperatures and test duration. Conduct a 15-minute session and 20 retries. If the browser audio stack cannot meet the rhythm tolerance, reassess native audio or engine choice before monetisation work.

### Part 5 — release preparation and measured growth

Create the signed Android app bundle, store assets, privacy/data disclosures, content rating, support contact and a device QA report. Recheck current Google Play account/testing requirements for the actual publisher account. Evaluate optional rewarded ads and cosmetic purchases only after the play loop performs well; no forced ad in the first run. Use licensed music only with written distribution scope and expiry recorded.

Acceptance: all prior gates met, current store requirements checked, the publisher reviews signing/release settings, and a closed test validates installation, upgrades, lifecycle, records and audio across the device matrix. Release timing and commercial music spend remain separate decisions.

## Design details for Part 1

- Portrait first; UI works on narrow phones and does not require an orientation lock API.
- Teal night landscape, acid-lime active tiles, a light ball and clear foreground contrast.
- Relative drag lets the player place a finger comfortably without the ball snapping to it.
- The first notes stay centred before introducing lateral movement.
- Position is sampled at each automatic musical landing; this is a steering game, not tap-timing input.
- Perfect centre landings earn 100 base points, good edge landings 60. The multiplier rises every eight successful landings, capped at four.
- Missing ends the run. There is no payment or ad revive.
- Two finite charts: Afterglow (110 BPM / 64 beats) and Night Drive (126 BPM / 80 beats).
- Motion reduction reduces decorative effects and hop height. Essential tile travel remains visible.

## Risks and review gates

Music appeal, touch feel, latency and chart readability matter more than adding menus. The simple synth tracks are prototype material. Bluetooth latency, touch-to-display delay, battery impact, audio recovery during calls and sustained low-end performance have not been established by desktop automation. Browser success does not substitute for phone testing.

Keep the next milestone focused on those points. Do not describe the prototype as a published Android app, a proven viral product, or a finished content catalogue.
