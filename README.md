# Tile Rush

An original portrait rhythm arcade game. Hold and drag sideways; the ball hops automatically to the music.

**Part 1: playable core.** Two original synthesised tracks, touch steering, perspective tiles, score/combo, completion, retry, pause, mute and saved best scores. The reference is the general bouncing-ball rhythm mechanic; Tile Rush contains its own interface, art, music and charts.

## Play locally

Requires Node.js 20 or newer. There are no runtime dependencies to install.

```sh
npm start
```

Open `http://localhost:4173` in a browser. To test on a phone on the same network, use the computer's LAN address with port 4173. Web Audio support can differ on plain HTTP; use HTTPS for a hosted mobile test. If audio cannot start, the game continues silently.

Choose a track and press **Let's play**. After the count-in, hold anywhere on the playfield and drag horizontally towards the next glowing tile. You do not tap on every beat. Desktop: left/right arrows or A/D. Escape pauses. Press Resume to continue.

## Validate and build

```sh
npm run check
npm test
npm run build
```

`dist/` contains the complete static game and can be hosted over HTTPS, including at a subpath. No external assets or API keys are needed. Opening `index.html` directly with `file://` will not load the JavaScript modules: use an HTTP server.

Optional browser checks:

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium
npm run test:browser
```

GitHub Actions runs syntax, model, static build and Chromium mobile emulation checks. It uploads the web build and mobile screenshots/video as workflow artifacts. For GitHub Pages, run the optional **Publish web preview** workflow from `main` after selecting **GitHub Actions** as the Pages source in repository settings. The first Pages setup is an owner action; this project does not change account or repository settings automatically.

## Development parts

| Part | Deliverable | Status |
| --- | --- | --- |
| 1 | Playable portrait core and original prototype tracks | Implemented; see QA notes |
| 2 | Polished music, authored beat maps and latency calibration | Planned |
| 3 | Progression, cosmetics, practice and challenges | Planned |
| 4 | Offline installation, Android package and device profiling | Planned |
| 5 | Store readiness, closed testing and release | Planned |

[Research and detailed roadmap](docs/RESEARCH_AND_PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [Part 1 QA and known limits](docs/PART_1_QA.md)

## Scope

This is a browser prototype, not an APK or a store release. The music consists of short original code-generated sketches; popular licensed tracks, ads, in-app purchases, accounts, offline installation and Android signing are future work. Best scores stay in this browser/device and do not sync. Real-phone latency and sustained performance still require device trials.
