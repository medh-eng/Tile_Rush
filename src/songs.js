import { PIANO_TRACKS } from './recording-data.js';
// Original compositions for Tile Rush. Every track is described as data: a key,
// a chord loop, drum/bass styles per section and hand-written lead phrases.
// The same data drives the synthesiser (audio.js) and the tile chart (model.js),
// so tiles always land on notes the player can hear.
//
// Phrase notation: one token per eighth note, bars separated by "|".
//   number  scale degree relative to the tonic (7 = one octave up, -1 = below)
//   -       hold the previous note
//   .       rest
//   a,b     two sixteenth notes inside one eighth

export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

export const DRUMS = {
  none: {},
  light: { k: 'x.......x.......', h: '..o...o...o...o.' },
  synth: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.o.x.o.x.o.x.o.' },
  synthFull: { k: 'x.....x.x.x.....', s: '....x.......x...', h: 'x.o.x.o.x.o.x.oo', o: '..............x.' },
  chill: { k: 'x.........x.....', s: '........x.......', h: 'x.o.x.o.x.o.x.o.' },
  chillFull: { k: 'x.....x...x..x..', c: '........x.......', h: 'x.oox.o.x.oox.oo', o: '......x.........' },
  four: { k: 'x...x...x...x...', c: '....x.......x...', h: '..x...x...x...x.' },
  fourFull: { k: 'x...x...x...x...', c: '....x.......x...', h: 'o.xoo.xoo.xoo.xo', o: '..x...x...x...x.' },
  phonk: { k: 'x.....x...x.....', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  phonkFull: { k: 'x..x..x...x..x..', c: '....x.......x...', h: 'x.xxx.x.x.xxx.xx', o: '..........x.....' },
  build: { k: 'x...x...x...x...', roll: true },
  // Alternate grooves so tracks of one genre do not share a drum part.
  synthAlt: { k: 'x...x...x...x...', s: '....x.......x...', h: '..o...o...o...o.' },
  synthAltFull: { k: 'x...x...x...x.x.', s: '....x.......x...', h: 'x.xox.xox.xox.xo', o: '..............x.' },
  chillAlt: { k: 'x......x..x.....', s: '........x.......', h: 'x.o.x.o.x.o.x.o.' },
  chillAltFull: { k: 'x..x....x..x..x.', c: '........x.......', h: 'x.oox.o.x.oox.oo', o: '......x.........' },
  drift: { k: 'x..x....x..x....', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  driftFull: { k: 'x..x..x.x..x..x.', c: '....x.......x...', h: 'x.xxx.xxx.xxx.xx', o: '..........x.....' },
};

const HAND = [
  {
    id: 'neon-horizon', title: 'Neon Horizon', genre: 'Synthwave', difficulty: 'Easy', level: 1,
    bpm: 104, root: 69, scale: 'minor', prog: [0, 5, 2, 6], theme: 'sunset', speed: 7.2, minGap: 0.27, reach: 1.7,
    lead: 'saw', bass: 'eighth',
    phrases: {
      A: '0 - - - 2 - 4 - | 5 - - - 4 - 2 - | 4 - - - 6 - 4 - | 3 - - - - - 1 -',
      B: '7 . 4 . 2 . 4 . | 7 . 5 . 2 . 5 . | 6 . 4 . 2 . 4 . | 6 . 3 . 1 . 3 .',
      H: '4 - 4 3 2 - 0 - | 2 - 2 3 2 - 0 - | 4 - 4 6 4 - 2 - | 3 - - 1 3 - 6 - | 7 - 7 6 4 - 2 - | 5 - 4 2 0 - 2 - | 4 - 3 2 -1 - 2 - | 3 - - - 1 - - .',
    },
    sections: [
      { n: 'Intro', bars: 4, drums: 'none', pad: 1, arp: 1, e: 0.2 },
      { n: 'Verse', bars: 8, drums: 'synth', bass: 1, pad: 1, lead: 'A', e: 0.5 },
      { n: 'Build', bars: 4, drums: 'build', bass: 1, pad: 1, lead: 'B', voice: 'pluck', riser: 1, e: 0.65 },
      { n: 'Drop', bars: 8, drums: 'synthFull', bass: 1, pad: 2, arp: 1, lead: 'H', duck: 1, impact: 1, e: 1 },
      { n: 'Break', bars: 4, drums: 'light', pad: 1, lead: 'B', voice: 'bell', riser: 1, e: 0.4 },
      { n: 'Final', bars: 8, drums: 'synthFull', bass: 1, pad: 2, arp: 1, lead: 'H', thick: 1, duck: 1, impact: 1, e: 1 },
      { n: 'Outro', bars: 4, drums: 'light', pad: 1, arp: 1, impact: 1, e: 0.25 },
    ],
  },
  {
    id: 'starlight-drift', title: 'Starlight Drift', genre: 'Chill Bass', difficulty: 'Easy', level: 1,
    bpm: 92, root: 65, scale: 'major', prog: [0, 4, 5, 3], seventh: 1, theme: 'cosmos', speed: 6.6, minGap: 0.3, reach: 1.6,
    lead: 'bell', bass: 'long',
    phrases: {
      A: '2 - - 4 - - 2 - | 1 - - 4 - - 6 - | 5 - - 4 - 2 - - | 3 - - 2 - 0 - -',
      B: '7 - - - 4 - - - | 6 - - - 4 - - - | 5 - - - 2 - - - | 3 - - - 5 - 7 -',
      H: '4 - 2 4 7 - 4 - | 6 - 4 6 8 - 6 - | 9 - 7 5 4 - 5 - | 7 - 5 3 2 - 0 - | 4 - 2 4 7 - 9 - | 8 - 6 4 6 - 4 - | 5 - 7 9 7 - 5 - | 3 - 5 - 4 - - .',
    },
    sections: [
      { n: 'Intro', bars: 4, drums: 'none', pad: 1, arp: 1, e: 0.2 },
      { n: 'Verse', bars: 8, drums: 'chill', bass: 1, pad: 1, lead: 'A', e: 0.45 },
      { n: 'Build', bars: 4, drums: 'build', bass: 1, pad: 1, lead: 'B', riser: 1, e: 0.6 },
      { n: 'Drop', bars: 8, drums: 'chillFull', bass: 1, pad: 2, arp: 1, lead: 'H', voice: 'saw', duck: 1, impact: 1, e: 1 },
      { n: 'Break', bars: 4, drums: 'none', pad: 1, arp: 1, lead: 'B', riser: 1, e: 0.35 },
      { n: 'Final', bars: 8, drums: 'chillFull', bass: 1, pad: 2, arp: 1, lead: 'H', voice: 'saw', thick: 1, duck: 1, impact: 1, e: 1 },
      { n: 'Outro', bars: 4, drums: 'none', pad: 1, arp: 1, impact: 1, e: 0.2 },
    ],
  },
  {
    id: 'pulse-runner', title: 'Pulse Runner', genre: 'House', difficulty: 'Medium', level: 2,
    bpm: 124, root: 66, scale: 'minor', prog: [0, 5, 3, 4], theme: 'city', speed: 8.2, minGap: 0.23, reach: 2.0,
    lead: 'pluck', bass: 'off',
    phrases: {
      A: '0 - - - . 2 4 - | 5 - - - . 4 2 - | 3 - - - . 5 7 - | 6 - - - 4 - - -',
      B: '7 - 4 - 2 - 4 - | 7 - 5 - 2 - 5 - | 7 - 5 - 3 - 5 - | 8 - 6 - 4 - 6 -',
      H: '0 . 0 2 . 4 . 2 | 0 . 0 2 . 5 . 4 | 3 . 3 5 . 7 . 5 | 4 . 4 6 . 8 . 6 | 7 . 7 4 . 2 . 4 | 7 . 7 5 . 2 . 5 | 7 . 5 3 . 5 . 7 | 8 . 6 4 . 6 - -',
    },
    sections: [
      { n: 'Intro', bars: 4, drums: 'light', pad: 1, arp: 1, e: 0.25 },
      { n: 'Verse', bars: 8, drums: 'four', bass: 1, pad: 1, lead: 'A', duck: 1, e: 0.55 },
      { n: 'Build', bars: 4, drums: 'build', pad: 1, lead: 'B', riser: 1, e: 0.7 },
      { n: 'Drop', bars: 8, drums: 'fourFull', bass: 1, pad: 2, lead: 'H', voice: 'super', duck: 1, impact: 1, e: 1 },
      { n: 'Break', bars: 8, drums: 'light', pad: 1, arp: 1, lead: 'A', voice: 'bell', e: 0.4 },
      { n: 'Build', bars: 4, drums: 'build', pad: 1, lead: 'B', riser: 1, e: 0.7 },
      { n: 'Final', bars: 8, drums: 'fourFull', bass: 1, pad: 2, arp: 1, lead: 'H', voice: 'super', thick: 1, duck: 1, impact: 1, e: 1 },
      { n: 'Outro', bars: 4, drums: 'light', pad: 1, arp: 1, impact: 1, e: 0.25 },
    ],
  },
  {
    id: 'aurora-bloom', title: 'Aurora Bloom', genre: 'Trance', difficulty: 'Hard', level: 3,
    bpm: 136, root: 64, scale: 'minor', prog: [0, 5, 2, 6], theme: 'aurora', speed: 9.0, minGap: 0.2, reach: 2.3,
    lead: 'super', bass: 'roll',
    phrases: {
      A: '0 . 4 . 7 . 4 . | 0 . 5 . 7 . 5 . | 2 . 4 . 9 . 4 . | 1 . 3 . 6 . 8 .',
      B: '11 - - - 9 - 7 - | 7 - - - 5 - 7 - | 9 - - - 6 - 4 - | 8 - - - - - 6 -',
      H: '4 - - 4 6 - 4 - | 4 - - 2 4 - 7 - | 6 - - 6 9 - 6 - | 8 - - 6 5 - 3 - | 4 - - 4 6 - 7 - | 9 - - 7 9 - 12 - | 9 - - 6 4 - 6 - | 8 - - - 6 - - -',
    },
    sections: [
      { n: 'Intro', bars: 4, drums: 'light', pad: 1, arp: 1, e: 0.25 },
      { n: 'Verse', bars: 8, drums: 'four', bass: 1, pad: 1, lead: 'A', voice: 'pluck', duck: 1, e: 0.55 },
      { n: 'Build', bars: 4, drums: 'build', pad: 1, arp: 1, lead: 'B', voice: 'pluck', riser: 1, e: 0.7 },
      { n: 'Drop', bars: 8, drums: 'fourFull', bass: 1, pad: 2, arp: 1, lead: 'H', duck: 1, impact: 1, e: 1 },
      { n: 'Break', bars: 8, drums: 'none', pad: 1, arp: 1, lead: 'B', voice: 'bell', e: 0.35 },
      { n: 'Build', bars: 4, drums: 'build', pad: 1, arp: 1, lead: 'A', voice: 'pluck', riser: 1, e: 0.7 },
      { n: 'Final', bars: 8, drums: 'fourFull', bass: 1, pad: 2, arp: 1, lead: 'H', thick: 1, duck: 1, impact: 1, e: 1 },
      { n: 'Outro', bars: 4, drums: 'light', pad: 1, arp: 1, impact: 1, e: 0.25 },
    ],
  },
  {
    id: 'midnight-phonk', title: 'Midnight Phonk', genre: 'Drift Phonk', difficulty: 'Hard', level: 3,
    bpm: 140, root: 62, scale: 'phrygian', prog: [0, 0, 5, 6], theme: 'inferno', speed: 9.4, minGap: 0.2, reach: 2.4,
    lead: 'cowbell', bass: '808',
    phrases: {
      A: '0 - - - . . 4 - | 1 - - - . . 0 - | 5 - - - . . 2 - | 6 - - - 3 - - -',
      B: '7 - - 4 - - 2 - | 8 - - 4 - - 1 - | 9 - - 5 - - 2 - | 8 - - 6 - - 3 -',
      H: '7 7 . 7 4 . 7 . | 8 7 . 4 5 . 4 . | 9 9 . 9 7 . 5 . | 6 6 . 8 6 . 3 . | 7 7 . 7 4 . 7 . | 8 7 . 4 2 . 0 . | 5 5 . 7 9 . 7 . | 8 . 8 . 6 - - .',
    },
    sections: [
      { n: 'Intro', bars: 4, drums: 'none', pad: 1, lead: 'A', voice: 'bell', e: 0.2 },
      { n: 'Verse', bars: 8, drums: 'phonk', bass: 1, pad: 1, lead: 'A', voice: 'bell', e: 0.55 },
      { n: 'Build', bars: 4, drums: 'build', pad: 1, lead: 'B', riser: 1, e: 0.7 },
      { n: 'Drop', bars: 8, drums: 'phonkFull', bass: 1, pad: 1, lead: 'H', duck: 1, impact: 1, e: 1 },
      { n: 'Break', bars: 4, drums: 'light', pad: 1, lead: 'B', voice: 'bell', riser: 1, e: 0.4 },
      { n: 'Drop', bars: 8, drums: 'phonkFull', bass: 1, pad: 1, lead: 'H', duck: 1, impact: 1, e: 1 },
      { n: 'Build', bars: 4, drums: 'build', pad: 1, lead: 'A', voice: 'bell', riser: 1, e: 0.7 },
      { n: 'Final', bars: 8, drums: 'phonkFull', bass: 1, pad: 2, lead: 'H', thick: 1, duck: 1, impact: 1, e: 1 },
      { n: 'Outro', bars: 4, drums: 'none', pad: 1, lead: 'A', voice: 'bell', impact: 1, e: 0.2 },
    ],
  },
];


// ---------------------------------------------------------------------------
// Genres. Each holds five tracks in rising difficulty. Five are hand-written
// above; the rest are composed here from a seed, a key and a chord loop, so each
// has its own tune. Chords and melodies are generated, then the same data drives
// the synthesiser and the tile chart like any other track.
// ---------------------------------------------------------------------------
function prng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const RHYTHM = {
  long: [[1, 0, 0, 0, 1, 0, 0, 0], [1, 0, 0, 0, 1, 0, 1, 0], [1, 0, 0, 1, 0, 0, 1, 0], [1, 0, 0, 0, 0, 0, 1, 0]],
  mid: [[1, 0, 1, 0, 1, 0, 0, 0], [1, 0, 0, 1, 0, 1, 0, 0], [1, 0, 1, 0, 0, 1, 0, 1], [1, 0, 1, 1, 0, 0, 1, 0]],
  drive: [[1, 0, 1, 1, 0, 1, 0, 1], [1, 1, 0, 1, 1, 0, 1, 0], [1, 0, 1, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 0, 1, 0]],
  sync: [[1, 1, 0, 1, 0, 0, 1, 0], [1, 0, 0, 1, 0, 1, 0, 0], [1, 1, 0, 0, 1, 0, 1, 0], [1, 0, 1, 0, 0, 1, 0, 0]],
  end: [[1, 0, 1, 0, 0, 0, 0, 0], [1, 0, 0, 1, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0]],
};
const chordTone = (r, chordDeg) => [0, 2, 4].includes((((r - chordDeg) % 7) + 7) % 7);
const pick = (rng, list) => list[Math.floor(rng() * list.length)];

/** One bar of eighth-note tokens. Strong beats lean on chord tones; motion stays mostly stepwise. */
function genBar(rng, rhythm, chordDeg, prev, lo, hi, finish = false) {
  const out = []; let cur = prev, sounding = false, last = -1;
  for (let p = 0; p < 8; p++) {
    if (!rhythm[p]) { out.push(sounding ? '-' : '.'); continue; }
    const weights = []; let total = 0;
    for (let r = lo; r <= hi; r++) {
      let w = Math.exp(-Math.abs(r - cur) / 1.6) * (p % 4 === 0 ? (chordTone(r, chordDeg) ? 3.2 : 0.6) : (chordTone(r, chordDeg) ? 1.6 : 1));
      if (r === cur) w *= 0.45;
      weights.push(w); total += w;
    }
    let x = rng() * total, choice = hi;
    for (let i = 0; i < weights.length; i++) { x -= weights[i]; if (x <= 0) { choice = lo + i; break; } }
    out.push(choice); cur = choice; sounding = true; last = out.length - 1;
  }
  if (finish && last >= 0) { // cadence: land on the chord root nearest where the line was heading
    let best = cur, dist = 99;
    for (let r = lo; r <= hi; r++) if ((((r - chordDeg) % 7) + 7) % 7 === 0 && Math.abs(r - cur) < dist) { dist = Math.abs(r - cur); best = r; }
    out[last] = best; cur = best;
  }
  return { tokens: out, end: cur };
}
/** Moves a whole bar by a number of scale degrees, folding the bar (not single notes) back into range. */
function shiftBar(tokens, by, lo, hi) {
  const nums = tokens.filter((t) => typeof t === 'number');
  let top = Math.max(...nums) + by, bottom = Math.min(...nums) + by;
  while (top > hi) { by -= 7; top -= 7; bottom -= 7; }
  while (bottom < lo) { by += 7; bottom += 7; }
  return tokens.map((t) => (typeof t === 'number' ? t + by : t));
}
function genPhrase(rng, prof, kind, prog, slot) {
  const bars = kind === 'H' ? 8 : 4, [lo, hi] = prof.range[kind], names = kind === 'H' ? prof.hook : prof.body;
  const pool = RHYTHM[names].slice(0, slot <= 1 ? Math.max(2, RHYTHM[names].length - 2) : undefined);
  const out = []; let prev = Math.round((lo + hi) / 2);
  const motif = genBar(rng, pick(rng, pool), 0, 2, 0, 6).tokens;
  for (let i = 0; i < bars; i++) {
    const chord = prog[i % prog.length];
    let result;
    if (i === bars - 1) result = genBar(rng, pick(rng, RHYTHM.end), chord, prev, lo, hi, true);
    else if (kind === 'H' && ![3, 6].includes(i)) { const tokens = shiftBar(motif, chord, lo, hi); result = { tokens, end: [...tokens].reverse().find((t) => typeof t === 'number') }; }
    else result = genBar(rng, pick(rng, pool), chord, prev, lo, hi);
    out.push(result.tokens.join(' ')); prev = result.end;
  }
  return out.join(' | ');
}

const SLOT = {
  label: ['Easy', 'Easy', 'Medium', 'Hard', 'Expert'], level: [1, 1, 2, 3, 3],
  gap: [0.3, 0.28, 0.25, 0.22, 0.2], reach: [1.6, 1.75, 1.95, 2.2, 2.45],
};
function compose(prof, spec, slot) {
  const rng = prng(spec.seed), phrases = {}, drums = spec.drums || {};
  const local = { ...prof, hook: spec.hook || prof.hook };
  for (const kind of ['A', 'B', 'H']) phrases[kind] = genPhrase(rng, local, kind, spec.prog, slot);
  return {
    id: spec.id, title: spec.title, difficulty: SLOT.label[slot], level: SLOT.level[slot], bpm: spec.bpm, root: spec.root,
    scale: spec.scale || prof.scale, prog: spec.prog, seventh: prof.seventh, theme: prof.theme,
    speed: Math.min(10, Math.round((0.86 + 0.061 * spec.bpm + slot * 0.15) * 10) / 10), minGap: SLOT.gap[slot], reach: SLOT.reach[slot],
    lead: spec.lead || prof.lead, bass: prof.bass, phrases, shift: spec.shift || 0,
    sections: prof.sections.map((sec) => ({ ...sec, drums: drums[sec.drums] || sec.drums })),
  };
}
const hand = (id) => HAND.find((t) => t.id === id);
const GENRE_DEFS = [
  {
    id: 'synthwave', name: 'Synthwave', tagline: 'Retro synths on a sunset highway',
    prof: { base: 'neon-horizon', theme: 'sunset', lead: 'saw', bass: 'eighth', scale: 'minor', body: 'long', hook: 'mid', range: { A: [-1, 6], B: [2, 8], H: [0, 9] } },
    slots: ['neon-horizon',
      { id: 'chrome-highway', title: 'Chrome Highway', bpm: 108, root: 64, prog: [0, 6, 5, 6], seed: 11, shift: 30, drums: { synth: 'synthAlt', synthFull: 'synthAltFull' } },
      { id: 'laser-palms', title: 'Laser Palms', bpm: 112, root: 62, prog: [0, 3, 5, 4], seed: 23, shift: -35, lead: 'pluck' },
      { id: 'midnight-arcade', title: 'Midnight Arcade', bpm: 118, root: 67, prog: [0, 5, 3, 6], seed: 37, shift: 60, lead: 'super', hook: 'drive', drums: { synth: 'synthAlt', synthFull: 'synthAltFull' } },
      { id: 'turbo-sunset', title: 'Turbo Sunset', bpm: 124, root: 65, prog: [0, 2, 5, 6], seed: 41, shift: -70, lead: 'super', hook: 'drive' }],
  },
  {
    id: 'chill', name: 'Chill', tagline: 'Soft bass, slow orbits',
    prof: { base: 'starlight-drift', theme: 'cosmos', lead: 'bell', bass: 'long', scale: 'major', seventh: 1, body: 'long', hook: 'mid', range: { A: [0, 6], B: [3, 9], H: [2, 10] } },
    slots: ['starlight-drift',
      { id: 'moon-garden', title: 'Moon Garden', bpm: 84, root: 60, prog: [0, 5, 3, 4], seed: 52, shift: 25 },
      { id: 'paper-lanterns', title: 'Paper Lanterns', bpm: 90, root: 62, scale: 'mixolydian', prog: [0, 6, 3, 4], seed: 67, shift: -30, lead: 'pluck', drums: { chill: 'chillAlt', chillFull: 'chillAltFull' } },
      { id: 'slow-orbit', title: 'Slow Orbit', bpm: 96, root: 64, prog: [5, 3, 0, 4], seed: 71, shift: 55, drums: { chill: 'chillAlt', chillFull: 'chillAltFull' } },
      { id: 'deep-blue-lullaby', title: 'Deep Blue Lullaby', bpm: 100, root: 59, scale: 'dorian', prog: [0, 3, 6, 5], seed: 83, shift: -60, hook: 'drive' }],
  },
  {
    id: 'house', name: 'House', tagline: 'Four-on-the-floor city nights',
    prof: { base: 'pulse-runner', theme: 'city', lead: 'pluck', bass: 'off', scale: 'minor', body: 'mid', hook: 'drive', range: { A: [0, 7], B: [2, 9], H: [0, 9] } },
    slots: [
      { id: 'rooftop-3am', title: 'Rooftop 3AM', bpm: 118, root: 62, prog: [0, 5, 3, 4], seed: 97, shift: 25 },
      { id: 'velvet-elevator', title: 'Velvet Elevator', bpm: 121, root: 57, scale: 'dorian', prog: [0, 3, 0, 6], seed: 101, shift: -40, lead: 'saw' },
      'pulse-runner',
      { id: 'warehouse-glow', title: 'Warehouse Glow', bpm: 126, root: 64, prog: [0, 2, 3, 6], seed: 113, shift: 70, lead: 'super' },
      { id: 'skyline-social', title: 'Skyline Social', bpm: 130, root: 59, scale: 'dorian', prog: [0, 5, 3, 6], seed: 127, shift: -75, lead: 'super' }],
  },
  {
    id: 'trance', name: 'Trance', tagline: 'Soaring leads and huge drops',
    prof: { base: 'aurora-bloom', theme: 'aurora', lead: 'super', bass: 'roll', scale: 'minor', body: 'mid', hook: 'mid', range: { A: [0, 8], B: [4, 11], H: [2, 12] } },
    slots: [
      { id: 'skyward', title: 'Skyward', bpm: 130, root: 62, prog: [0, 5, 2, 6], seed: 131, shift: 20 },
      { id: 'infinite-dawn', title: 'Infinite Dawn', bpm: 132, root: 60, prog: [0, 2, 5, 6], seed: 149, shift: -30 },
      { id: 'crystal-ascent', title: 'Crystal Ascent', bpm: 134, root: 57, prog: [0, 6, 5, 4], seed: 151, shift: 55, hook: 'drive' },
      'aurora-bloom',
      { id: 'polar-rave', title: 'Polar Rave', bpm: 140, root: 66, prog: [0, 5, 3, 6], seed: 163, shift: -55, hook: 'drive' }],
  },
  {
    id: 'phonk', name: 'Phonk', tagline: 'Cowbells, 808s and drift',
    prof: { base: 'midnight-phonk', theme: 'inferno', lead: 'cowbell', bass: '808', scale: 'phrygian', body: 'sync', hook: 'sync', range: { A: [0, 7], B: [4, 10], H: [2, 10] } },
    slots: [
      { id: 'ghost-mode', title: 'Ghost Mode', bpm: 132, root: 60, prog: [0, 0, 5, 6], seed: 173, shift: 15, drums: { phonk: 'drift', phonkFull: 'driftFull' } },
      { id: 'red-line', title: 'Red Line', bpm: 136, root: 59, prog: [0, 1, 0, 6], seed: 181, shift: -25 },
      { id: 'cowbell-cartel', title: 'Cowbell Cartel', bpm: 138, root: 61, prog: [0, 5, 6, 0], seed: 191, shift: 30, drums: { phonk: 'drift', phonkFull: 'driftFull' } },
      'midnight-phonk',
      { id: 'drift-king', title: 'Drift King', bpm: 146, root: 62, prog: [0, 0, 1, 6], seed: 199, shift: -45, drums: { phonk: 'drift', phonkFull: 'driftFull' } }],
  },
];

const ELECTRONIC_GENRES = GENRE_DEFS.map((def) => {
  const prof = { ...def.prof, sections: hand(def.prof.base).sections };
  const tracks = def.slots.map((entry, slot) => {
    const track = typeof entry === 'string' ? { ...hand(entry), shift: 0 } : compose(prof, entry, slot);
    return { ...track, genre: def.id, no: slot + 1, difficulty: SLOT.label[slot] };
  });
  return { id: def.id, name: def.name, tagline: def.tagline, tracks };
});
export const GENRES = [{ id: 'piano', name: 'Piano Sessions', tagline: 'Real performances. Natural touch.', tracks: PIANO_TRACKS }, ...ELECTRONIC_GENRES];
export const TRACKS = GENRES.flatMap((g) => g.tracks);

/** MIDI note for a scale degree of the track's key. */
export function degree(track, d) {
  const scale = SCALES[track.scale];
  return track.root + Math.floor(d / 7) * 12 + scale[((d % 7) + 7) % 7];
}

/** Chord tones (MIDI) for the bar's chord, voiced around the octave below the lead. */
export function chord(track, bar) {
  const d = track.prog[bar % track.prog.length];
  const steps = track.seventh ? [0, 2, 4, 6] : [0, 2, 4];
  return steps.map((s) => {
    let m = degree(track, d + s) - 12;
    while (m > track.root + 2) m -= 12;
    while (m < track.root - 12) m += 12;
    return m;
  });
}

function parsePhrase(text) {
  // Returns notes as { step (16ths from phrase start), len (16ths), d (degree) }.
  const notes = [];
  let step = 0, last = null;
  for (const bar of text.split('|')) {
    const tokens = bar.trim().split(/\s+/);
    if (tokens.length !== 8) throw new Error(`Phrase bar needs 8 tokens: "${bar}"`);
    for (const token of tokens) {
      if (token === '-') { if (last) last.len += 2; }
      else if (token === '.') last = null;
      else if (token.includes(',')) {
        const [a, b] = token.split(',').map(Number);
        notes.push({ step, len: 1, d: a });
        last = { step: step + 1, len: 1, d: b };
        notes.push(last);
      } else { last = { step, len: 2, d: Number(token) }; notes.push(last); }
      step += 2;
    }
  }
  return { notes, steps: step };
}

const cache = new Map();
/** Expands a track into a timeline: sections with start bars and every lead note. */
export function compile(track) {
  if (cache.has(track.id)) return cache.get(track.id);
  const s16 = 60 / track.bpm / 4;
  if (track.recording) {
    const duration = track.recording.duration, bars = Math.ceil(duration / (s16 * 16));
    const sections = ['Opening', 'Flow', 'Expression', 'Resolution'].map((n, index) => ({
      n, index, time: index * 12, start: index * 12 / (s16 * 16), bars: 12 / (s16 * 16), e: [.22, .35, .5, .25][index],
    }));
    const barSection = Array.from({ length: bars }, (_, b) => sections[Math.min(3, Math.floor(b * s16 * 16 / 12))]);
    const song = { track, s16, beat: s16 * 4, bars, steps: bars * 16, duration, sections, barSection, lead: [], leadAt: new Map() };
    cache.set(track.id, song); return song;
  }
  const phrases = Object.fromEntries(Object.entries(track.phrases).map(([k, v]) => [k, parsePhrase(v)]));
  const sections = [], barSection = [], lead = [], leadAt = new Map();
  let bar = 0;
  track.sections.forEach((spec, index) => {
    const section = { ...spec, index, start: bar, time: bar * 16 * s16 };
    sections.push(section);
    for (let b = 0; b < spec.bars; b++) barSection.push(section);
    if (spec.lead) {
      const phrase = phrases[spec.lead], total = spec.bars * 16;
      for (let offset = 0; offset < total; offset += phrase.steps) {
        for (const note of phrase.notes) {
          const step = bar * 16 + offset + note.step;
          if (offset + note.step >= total) continue;
          const event = { step, time: step * s16, dur: note.len * s16, midi: degree(track, note.d), d: note.d, section: index };
          lead.push(event);
          if (!leadAt.has(step)) leadAt.set(step, []);
          leadAt.get(step).push(event);
        }
      }
    }
    bar += spec.bars;
  });
  const song = { track, s16, beat: s16 * 4, bars: bar, steps: bar * 16, duration: bar * 16 * s16, sections, barSection, lead, leadAt };
  cache.set(track.id, song);
  return song;
}

/** Section playing at a given song time (clamped to the first/last section). */
export function sectionAt(song, time) {
  if (song.track.recording) return song.sections[Math.max(0, Math.min(song.sections.length - 1, Math.floor(time / 12)))];
  const bar = Math.max(0, Math.min(song.bars - 1, Math.floor(time / (song.s16 * 16))));
  return song.barSection[bar];
}
