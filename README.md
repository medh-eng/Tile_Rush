# Tile Rush

An original neon rhythm arcade game for phones. Hold and drag sideways; the ball hops to the music and you steer it onto every tile.

**Version 0.5 — drum & bass and punjabi.** Two more genres of ten original tracks each (170–180 BPM rollers with reese basses and an MC, and dhol-driven bhangra with tumbi, harmonium and a trap-bhangra track), joining pop and rock for nine worlds and 65 tracks in all. Everything from 0.3 and the 0.2 overhaul is still here: a full synthesised soundtrack, a perspective runway with a different world per genre, stars, perfect streaks, fever, one continue per run and a live menu preview.

## What is in the game

Pick a genre, then one of its tracks. Each genre climbs from Easy to Expert and has its own world.

| Genre | Feel | Tracks (easy → expert) | World |
| --- | --- | --- | --- |
| Synthwave | Retro synths, 104–124 BPM | Neon Horizon · Chrome Highway · Laser Palms · Midnight Arcade · Turbo Sunset | Striped sun, mountains, crystals |
| Chill | Soft bass, 84–100 BPM | Starlight Drift · Moon Garden · Paper Lanterns · Slow Orbit · Deep Blue Lullaby | Ringed planet, nebulae, hoops |
| House | Four on the floor, 118–130 BPM | Rooftop 3AM · Velvet Elevator · Pulse Runner · Warehouse Glow · Skyline Social | Skyline that bounces with the kick |
| Trance | Big leads and drops, 130–140 BPM | Skyward · Infinite Dawn · Crystal Ascent · Aurora Bloom · Polar Rave | Northern lights over pines |
| Phonk | Cowbells and 808s, 132–146 BPM | Ghost Mode · Red Line · Cowbell Cartel · Midnight Phonk · Drift King | Eclipse, embers, spikes |
| **Pop** | Dance-floor hooks, 96–156 BPM | Glitter Pulse · Disco Heartbeat · Sugar Rush · Palm Romance · Hola Sunset · Velvet Funk · Neon Confetti · Highway Heart · Starlit Showdown · Main Character | Mirror ball, searchlights, glowing stars |
| **Rock** | Riffs and gang vocals, 104–184 BPM | Garage Sunrise · Back Seat Anthem · Jukebox Lightning · Stadium Lights · Sunday Riot · Dance Floor Fuzz · Gasoline Heart · Voltage Kid · Riot Parade · Final Encore | Concert stage, spotlights, amp stacks |

- **Pop and rock have singers.** The hook of every pop and rock song is *sung*: a formant voice synthesiser sings "oh", "ah", "hey", "la", "yeah" and "whoa" on the lead melody (so every tile lands on a sung note), adds "ooh/aah" backing in pre-choruses and finales, and a stacked crowd shouts on the backbeat in the choruses. Pop uses a bright voice with dance-floor claps, disco and funk brass, e-piano, piano, clean guitar, congas, snaps and tambourine, with the music ducking on every kick. Rock uses a gritty voice, palm-muted and ringing power-chord guitars, a lead-guitar solo, a picked bass, toms fills and crashes.
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
| 2 | Music, melody-driven charts, visual overhaul, 65 tracks in nine genres | Done through 0.5 except latency calibration, listening review and mastered audio; see QA notes |
| 3 | Progression, cosmetics, practice and challenges | Stars and bests done; the rest planned |
| 4 | Offline installation, Android package and device profiling | Planned |
| 5 | Store readiness, closed testing and release | Planned |

[Research and roadmap](docs/RESEARCH_AND_PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [0.4 QA](docs/VERSION_0_4_QA.md) · [0.3 QA and known limits](docs/PART_2_QA.md) · [Part 1 QA](docs/PART_1_QA.md)

## Scope

A browser game, not an APK or a store release. All music is original and generated in code by the game's own synthesiser; there are no licensed songs, samples, ads, purchases or accounts. The pop and rock tracks borrow the tempos, grooves, chord loops and hook shapes that make dance-pop and rock work, but none reproduces an existing song, and the "vocals" are synthesised syllables, not a recorded singer or written lyrics. Scores stay on the device. Tile Rush has its own art, interface, music and charts; the bouncing-ball rhythm mechanic is a shared genre convention.
