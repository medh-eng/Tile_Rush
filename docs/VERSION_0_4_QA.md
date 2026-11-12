# Version 0.4 QA — Pop and Rock

Two new genres of ten tracks each (20 new tracks, 45 in all), with a synthesised singer, guitars, keys, brass and extra percussion, and two new visual worlds (mirror-ball stage, concert stage).

## Checks performed

- `npm run check`, `npm test` (15 unit tests) and `npm run build` pass. New tests cover: seven genres and 45 unique tracks; difficulty ladders of ten; every pop and rock section resolving to a real drum kit, bass line, comping instrument and voice; syllable sets; song lengths (65–105 s, long layout only from 140 BPM); every new instrument and every syllable scheduling on a stand-in audio graph. The existing flawless-autopilot test completes all 45 charts with three stars, and chart reachability holds for all of them.
- `npm run test:browser` passes in mobile-emulated Chrome (390×844, touch), twice: once with a **complete Glitter Pulse run** (pop, Easy) and once with a **complete Riot Parade run** (rock, Expert, 184 BPM) steered by real touch events to three stars. The same run covers the seven-genre menu at four portrait sizes, ten-row genre pages with Play on screen, pause/resume, mute, miss → continue, persistent bests and silent play without Web Audio. No uncaught page errors.
- All 20 new tracks were rendered with `renderOffline()` in Chrome (32 kHz, deterministic) and measured against the existing synthwave, house and phonk tracks:

| | New (20 tracks) | Existing (3 tracks) |
| --- | --- | --- |
| Clipped samples / NaN / silent seconds | 0 / 0 / 0 | 0 / 0 / 0 |
| Peak | 0.72 – 0.91 | 0.76 – 0.87 |
| Average level (RMS) | −17.0 to −12.3 dB | −15.8 to −13.6 dB |
| Singers against the rest of the chorus | −6.9 to −3.3 dB | – |
| Rock guitars against the rest of the chorus | −8.4 to −6.8 dB | – |

- **Vocal balance was tuned from these measurements.** First pass spread the singers from −8.6 dB (buried, Disco Heartbeat) to −0.7 dB (as loud as the band, Velvet Funk). Six tracks got a `voxTrim` and the spread is now 3.6 dB. Four melodies that climbed to B♭5 (female) or E5 (male) were moved down a few semitones.
- **The singer produces distinct vowels.** One sustained note per syllable was rendered and its spectrum measured: "ee" puts 77% of its energy above 2 kHz with the second formant at 2425 Hz (target about 2475); "ah" puts 79% below 1.1 kHz with the second formant at 1325 Hz (target about 1265); "ooh" puts 95% below 1.1 kHz. The male voice moves all formants down.
- Screens were reviewed from screenshots: both genre pages and the runway in both new worlds.

## Not verified

- **How any of it sounds.** Nobody has listened to the 20 new tracks in the game. Levels, clipping, vowels and structure were measured; musicality, hook memorability, whether the grooves make people want to dance and whether the singer is pleasant rather than odd were not and cannot be measured here. The hook of each track is a hand-written one-bar motif moved with the chords; verses and pre-choruses are generated, so some will be weaker than others.
- **"Vocals" are synthesised syllables** ("oh", "ah", "ooh", "hey", "la", "na", "da", "yeah", "whoa"), sung on the melody, not recorded singers and not lyrics. A formant synthesiser sounds like a vocoder-style choir, not a human lead singer. Real sung lyrics need recorded vocals (own or properly licensed) added as audio files.
- **Not copies of hits.** The tracks use the tempos, grooves, chord loops and hook shapes typical of viral dance-pop and rock, but are original and none reproduces an existing song. They will not sound like specific famous songs.
- **Velvet Funk is the quietest track** (about 3 dB under the median) and **Highway Heart** has the highest peak (0.91). There is no per-track loudness trim yet.
- **Dance feel on a phone speaker.** Grooves are standard patterns (four-on-the-floor, disco octave bass, K-pop, afrobeat, dembow, funk, stomp, skate punk, double-kick). Low end on small speakers, headphone latency, heat and battery on the busier choruses were not measured. The headless machine has no GPU.
- **Fairness of the Hard and Expert charts for a person.** A touch-driven autopilot completes Glitter Pulse and Riot Parade; nobody has played them.

## Listening checklist

1. Open each Pop and Rock genre page and tap every track: the chorus should start, the scene should match, and the sung syllable should fall on each tile.
2. Per song, note: is the groove danceable at this tempo; is the sung hook catchy or grating; are guitars too harsh or too thin; are shouts on the right beats; does the final chorus feel bigger than the first.
3. Rank the 20 and mark which to keep, rewrite the motif of, or replace. Tell us which and the numbers in `GENRE_DEFS` (`motif`, `prog`, `root`, `voxTrim`, `comps`) are the knobs.
4. Try every song on headphones and the phone speaker. Note any crackle in the dense choruses.
