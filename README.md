# Tile Rush

An original neon rhythm arcade game for phones. Hold and drag sideways; the ball hops to the music and you steer it onto every tile.

**Version 0.3 — genres.** Five genres with five original tracks each (25 in all), a genre page and a track page, and everything from the 0.2 overhaul: a full synthesised soundtrack, a perspective runway with a different world per genre, stars, perfect streaks, fever, one continue per run and a live menu preview.

## What is in the game

Pick a genre, then one of its five tracks. Each genre climbs from Easy to Expert and has its own world.

| Genre | Feel | Tracks (easy → expert) | World |
| --- | --- | --- | --- |
| Synthwave | Retro synths, 104–124 BPM | Neon Horizon · Chrome Highway · Laser Palms · Midnight Arcade · Turbo Sunset | Striped sun, mountains, crystals |
| Chill | Soft bass, 84–100 BPM | Starlight Drift · Moon Garden · Paper Lanterns · Slow Orbit · Deep Blue Lullaby | Ringed planet, nebulae, hoops |
| House | Four on the floor, 118–130 BPM | Rooftop 3AM · Velvet Elevator · Pulse Runner · Warehouse Glow · Skyline Social | Skyline that bounces with the kick |
| Trance | Big leads and drops, 130–140 BPM | Skyward · Infinite Dawn · Crystal Ascent · Aurora Bloom · Polar Rave | Northern lights over pines |
| Phonk | Cowbells and 808s, 132–146 BPM | Ghost Mode · Red Line · Cowbell Cartel · Midnight Phonk · Drift King | Eclipse, embers, spikes |

- **Tiles follow the melody.** Charts are generated from each track's lead line, so every landing is a note you hear. Easy tracks mostly land on the beat; harder ones follow faster phrases.
- **Sections change the world.** Intro, verse, build, drop, break and finale each have their own colours, and you fly through a neon gate at every change. Each track also has its own colour shift.
- **Scoring.** Centre landings are *Perfect*; a perfect streak raises the multiplier to ×5 and ignites *Fever* at ten in a row. Three stars mark a third, two thirds and the end of the track. Stars and best scores are kept per track.
- **Tile types.** Wide tiles open each section; sliding tiles appear from Medium upward.
- **Forgiving flow.** A four-beat count-in, one continue per run, and a 3-2-1 after every pause. The game reopens on the last track you played.

## Play locally

Requires Node.js 20 or newer. There are no runtime dependencies.

```sh
npm start
```

Open `http://localhost:4173`. On a phone on the same network, use the computer's LAN address with port 4173. Pick a genre, tap a track to hear its drop, then press **Play**. Desktop: left/right arrows or A/D steer, Escape pauses. Add `?demo` to the address to watch the autopilot (demo runs do not save scores).

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
| 2 | Music, melody-driven charts, visual overhaul, 25 tracks in five genres | Done through 0.3 except latency calibration and mastered audio; see QA notes |
| 3 | Progression, cosmetics, practice and challenges | Stars and bests done; the rest planned |
| 4 | Offline installation, Android package and device profiling | Planned |
| 5 | Store readiness, closed testing and release | Planned |

[Research and roadmap](docs/RESEARCH_AND_PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [0.3 QA and known limits](docs/PART_2_QA.md) · [Part 1 QA](docs/PART_1_QA.md)

## Scope

A browser game, not an APK or a store release. All music is original and generated in code by the game's own synthesiser; there are no licensed songs, ads, purchases or accounts. Scores stay on the device. Tile Rush has its own art, interface, music and charts; the bouncing-ball rhythm mechanic is a shared genre convention.
