# Tile Rush

A portrait rhythm arcade game. Hold and drag sideways; the ball hops onto the next tile with the music.

**Codex version 0.4 — Piano Sessions.** Three real piano performances now lead the collection, alongside the existing 25 electronic tracks. This branch adapts the visually richer/playable setup from the user's separate Claude branch. Claude's branch is unchanged.

## Listen and play

Choose **Piano Sessions**, then a track. Listen to its preview or press **Play**. The first download prepares the selected recording; later retries reuse it. Hold anywhere on the playfield and drag sideways to land on each glowing tile. The ball jumps automatically. On desktop, use the arrow keys or A/D; Escape pauses.

| Piano track | Performer / composer | Game edit |
| --- | --- | --- |
| Prelude in C — BWV 846 | Kimiko Ishizaka / J. S. Bach | 48 seconds |
| Prelude in E minor — BWV 855 | Kimiko Ishizaka / J. S. Bach | 48 seconds |
| Prelude in C minor — BWV 847 | Kimiko Ishizaka / J. S. Bach | 48 seconds |

These are human performances from *The Open Well-Tempered Clavier*, released under CC0. The pianist's natural timing/dynamics are retained. Edits trim leading silence, apply constant gain and fades, and encode MP3; they do not time-stretch the music. In-game credits and the [recording ledger](public/music/rights.json) identify sources and edits.

The five electronic genres remain available: Synthwave, Chill, House, Trance and Phonk. Stars, scores, one continue per run, section changes, neon worlds and the live menu backdrop come from the adapted setup.

## Run and build

Node.js 20 or newer. No runtime dependencies.

```sh
npm start
npm run check
npm test
npm run build
```

Open `http://localhost:4173`. For a phone, host `dist/` over HTTPS or use the computer's LAN address on the same network. Bundled music is fetched from the game host; no external audio CDN or API key is required. Do not open `index.html` via `file://` because the app uses modules.

Browser checks:

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium
npm run test:browser
```

GitHub Actions uses hosted Chrome and uploads screenshots/video. The optional **Publish web preview** workflow can deploy `main` to Pages after the owner enables GitHub Actions as the Pages source.

## Development parts

| Part | Scope | Status on this branch |
| --- | --- | --- |
| 1 | Playable portrait core | Implemented |
| 2 | Music and charts | Three real piano excerpts, performance cue charts and adapted neon setup implemented; calibration and broader catalogue remain |
| 3 | Progression and replay | Stars/bests/continue adapted; further progression planned |
| 4 | Offline installation, Android and device profiling | Planned |
| 5 | Store preparation and release | Planned |

[Part 2 implementation and provenance](docs/PART_2_NATURAL_MUSIC.md) · [Research/roadmap](docs/RESEARCH_AND_PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [Music credits](public/music/CREDITS.md)

This is a browser game, not an APK. No ad SDK, purchase flow, analytics or cloud account is required by the game. Records stay in this browser. Real-phone listening/latency and sustained performance still need testing.
