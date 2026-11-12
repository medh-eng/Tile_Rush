# Version 0.5 QA: drum & bass and punjabi

Scope: two genres of ten original tracks each (65 tracks, nine genres in all).

## What was checked
- `npm run check`, `npm test` (15 tests), `npm run build`.
- Real-touch browser run (`tests/browser.mjs`) on Sub Zero (drum & bass) and Bhangra Blast (punjabi): 11/11 checks each, no page errors.
- Offline render of all 20 tracks: no clipping, no NaN, no silent second. Loudness spread about 2 dB (RMS -14.3 to -12.2 dB).
- Vocal level against the rest of the mix inside choruses: drum & bass -6.6 to -1.9 dB, punjabi -5.8 to -2.1 dB; four forward vocals were trimmed afterwards with `voxTrim` and not re-measured.
- Screenshots of the two new worlds (`rave`: laser fan, EQ wall, LED towers; `fields`: sun and rays, crop rows, wheat sheaves).

## Known limits
- Nobody has listened to these tracks. Everything above is measurement, not taste.
- The songs are original. They borrow tempo, groove and chord-loop shapes from the viral styles, not melodies or lyrics from real songs.
- Vocals are synthesised syllables (formant synth), not sung words. Real lyrics need recorded or licensed vocals.
- Dhol, tumbi and harmonium are synthesised approximations, not samples.
