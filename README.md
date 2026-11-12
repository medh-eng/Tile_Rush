# Tile Rush

An original neon rhythm arcade game for phones. Hold and drag sideways; the ball hops to the music and you steer it onto every tile.

**Version 0.2 — the neon overhaul.** Five original tracks, a full synthesised soundtrack, a 3D-perspective runway with a different world for every track, stars, perfect streaks, fever, one continue per run and a live menu preview.

## What is in the game

| Track | Style | BPM | Level | World |
| --- | --- | --- | --- | --- |
| Neon Horizon | Synthwave | 104 | Easy | Striped sun, mountain ridges, crystals |
| Starlight Drift | Chill bass | 92 | Easy | Ringed planet, nebulae, floating hoops |
| Pulse Runner | House | 124 | Medium | Moonlit skyline that bounces with the kick |
| Aurora Bloom | Trance | 136 | Hard | Northern lights over a pine forest |
| Midnight Phonk | Drift phonk | 140 | Hard | Eclipse, embers and spikes |

- **Tiles follow the melody.** Charts are generated from each track's lead line, so every landing is a note you hear.
- **Sections change the world.** Intro, verse, build, drop, break and finale each have their own colours; you fly through a neon gate at every change.
- **Scoring.** Centre landings are *Perfect*; a perfect streak raises the multiplier to ×5 and ignites *Fever* at ten in a row. Three stars mark a third, two thirds and the end of the track.
- **Tile types.** Wide tiles open each section; sliding tiles appear on the medium and hard tracks.
- **Forgiving flow.** A four-beat count-in, one continue per run, and a 3-2-1 after every pause.

## Play locally

Requires Node.js 20 or newer. There are no runtime dependencies.

```sh
npm start
```

Open `http://localhost:4173`. On a phone on the same network, use the computer's LAN address with port 4173. Tap a track to hear its drop, then press **Play**. Desktop: left/right arrows or A/D steer, Escape pauses. Add `?demo` to the address to watch the autopilot (demo runs do not save scores).

If audio cannot start, the game plays silently on the same clock.

## Validate and build

```sh
npm run check
npm test
npm run build
```

`dist/` is the complete static game and can be hosted over HTTPS, including at a subpath. No external assets, fonts or API keys are used. Opening `index.html` with `file://` will not load the JavaScript modules: use an HTTP server.

Browser checks (mobile-emulated Chromium, including a full track played with real touch events):

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium
npm run test:browser
```

GitHub Actions runs the syntax, unit, build and browser checks and uploads the web build and screenshots/video. For GitHub Pages, run the **Publish web preview** workflow from `main` after choosing **GitHub Actions** as the Pages source in the repository settings.

## Development parts

| Part | Deliverable | Status |
| --- | --- | --- |
| 1 | Playable portrait core | Done |
| 2 | Music, melody-driven charts, visual overhaul | Done in 0.2 except latency calibration and mastered audio; see QA notes |
| 3 | Progression, cosmetics, practice and challenges | Stars and bests done; the rest planned |
| 4 | Offline installation, Android package and device profiling | Planned |
| 5 | Store readiness, closed testing and release | Planned |

[Research and roadmap](docs/RESEARCH_AND_PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [0.2 QA and known limits](docs/PART_2_QA.md) · [Part 1 QA](docs/PART_1_QA.md)

## Scope

A browser game, not an APK or a store release. All music is original and generated in code by the game's own synthesiser; there are no licensed songs, ads, purchases or accounts. Scores stay on the device. Tile Rush has its own art, interface, music and charts; the bouncing-ball rhythm mechanic is a shared genre convention.
