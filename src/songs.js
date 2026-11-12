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
  harmonic: [0, 2, 3, 5, 7, 8, 11],
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

  // --- Pop and rock. Letters: k kick, s snare, c clap, h hat, o open hat, t tambourine/shaker,
  // n finger snap, r rim, g conga (x low, o high), b cowbell. 'x' is a full hit, 'o' a soft one. ---
  kicks: { k: 'x...x...x...x...' },
  popFour: { k: 'x...x...x...x...', c: '....x.......x...', h: '..o...o...o...o.' },
  popFourFull: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.xox.xox.xox.xo', o: '..x...x...x...x.', t: '.x.x.x.x.x.x.x.x' },
  disco: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..x...x...x...x.' },
  discoFull: { k: 'x...x...x...x...', c: '....x.......x...', h: 'xoxoxoxoxoxoxoxo', o: '..x...x...x...x.', t: 'x.x.x.x.x.x.x.x.' },
  kpop: { k: 'x.....x.x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  kpopFull: { k: 'x.....x.x.x.x...', s: '....x.......x...', c: '....x.......x...', h: 'xoxoxoxoxoxoxoxo', o: '..x...x...x...x.' },
  afro: { k: 'x.....x.x.......', r: '...x..x....x..x.', t: 'xoxoxoxoxoxoxoxo', g: 'x..x...x..x.x...' },
  afroFull: { k: 'x.....x.x...x...', n: '....x.......x...', r: '...x..x....x..x.', t: 'xoxoxoxoxoxoxoxo', g: 'x..x.ox.x..x.ox.', h: '..o...o...o...o.' },
  dembow: { k: 'x...x...x...x...', s: '...x..x....x..x.', h: '..o...o...o...o.' },
  dembowFull: { k: 'x...x...x...x...', s: '...x..x....x..x.', r: 'x.......x.......', h: 'x.xox.xox.xox.xo', g: '..o...o...o...o.' },
  funk: { k: 'x.....x.x..x....', s: '....x.......x...', h: 'x.xxx.xxx.xxx.xx', o: '..x.......x.....' },
  funkFull: { k: 'x..x..x.x..x..x.', s: '....x.......x..x', h: 'xxxoxxxoxxxoxxxo', o: '..x.......x.....', t: '.x.x.x.x.x.x.x.x' },
  electro: { k: 'x...x...x...x...', n: '....x.......x...', c: '....x.......x...', h: '..o...o...o...o.' },
  electroFull: { k: 'x...x...x...x...', c: '....x.......x...', n: '.......x.......x', h: 'x.xox.xox.xox.xo', o: '..x...x...x...x.', t: '.x.x.x.x.x.x.x.x' },
  synthRun: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  synthRunFull: { k: 'x...x...x...x...', s: '....x.......x...', h: 'xoxoxoxoxoxoxoxo', o: '..x...x...x...x.' },
  houseT: { k: 'x...x...x...x...', c: '....x.......x...', h: '..x...x...x...x.' },
  houseTFull: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.xox.xox.xox.xo', o: '..x...x...x...x.', t: 'xoxoxoxoxoxoxoxo' },
  mega: { k: 'x...x...x...x...', s: '....x.......x...', c: '....x.......x.x.', h: '..o...o...o...o.' },
  megaFull: { k: 'x...x...x...x...', s: '....x.......x...', c: '....x.......x.x.', h: 'x.xox.xox.xox.xo', o: '..x...x...x...x.', t: 'xoxoxoxoxoxoxoxo' },
  rockEasy: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  rockEasyFull: { k: 'x.......x.x.x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..............x.' },
  classic: { k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  classicFull: { k: 'x.....x.x.....x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..x.......x.....' },
  boogie: { k: 'x.....x.x.......', s: '....x.......x...', h: 'x.xox.xox.xox.xo' },
  boogieFull: { k: 'x.....x.x...x...', s: '....x.......x...', h: 'x.xox.xox.xox.xo', o: '..x.......x.....', t: '....x.......x...' },
  stomp: { k: 'x.x.....x.x...x.', c: '....x.......x...' },
  stompFull: { k: 'x.x.....x.x...x.', c: '....x.......x...', s: '....x.......x...', t: 'x.x.x.x.x.x.x.x.', h: 'x.x.x.x.x.x.x.x.' },
  punkPop: { k: 'x.....x.x.....x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  punkPopFull: { k: 'x...x...x...x...', s: '..x...x...x...x.', h: 'x.x.x.x.x.x.x.x.', o: '..............x.' },
  danceRock: { k: 'x...x...x...x...', c: '....x.......x...', h: '..x...x...x...x.' },
  danceRockFull: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.xox.xox.xox.xo', o: '..x...x...x...x.', b: 'x...x...x...x...' },
  altRock: { k: 'x..x....x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  altRockFull: { k: 'x..x..x.x.x.x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..x.......x.....' },
  hard: { k: 'x.x...x.x.x...x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  hardFull: { k: 'x.x.x.x.x.x.x.x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..............x.' },
  punk: { k: 'x...x...x...x...', s: '..x...x...x...x.', h: 'x.x.x.x.x.x.x.x.' },
  punkFull: { k: 'x.x.x.x.x.x.x.x.', s: '..x...x...x...x.', h: 'x.x.x.x.x.x.x.x.', o: '..............x.' },
  epic: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  epicFull: { k: 'x.xxx.xxx.xxx.xx', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..x.......x.....' },

  // --- Drum & bass (two-step and rolling breaks) and Punjabi (dhol: d = bass 'dha', e = treble 'tin') ---
  dnbHalf: { k: 'x...............', s: '........x.......', h: 'x.x.x.x.x.x.x.x.' },
  dnbSparse: { k: 'x.........x.....', s: '............x...', h: 'x.x.x.x.x.x.x.x.' },
  liquidFull: { k: 'x.........x.....', s: '....x.......x...', h: 'x.xox.xox.xox.xo', o: '..x.......x.....', t: 'xoxoxoxoxoxoxoxo' },
  rollerFull: { k: 'x.........x...x.', s: '....x.......x...', h: 'xoxoxoxoxoxoxoxo', o: '..x.......x.....' },
  jungleFull: { k: 'x.x.......xx....', s: '....x..x.x..x...', h: 'x.x.x.x.x.x.x.x.', o: '..x.......x.....' },
  techFull: { k: 'x.........x.....', s: '....x.......x...', c: '....x.......x...', h: 'x...x...x...x...', o: '..x...x...x...x.' },
  neuroFull: { k: 'x.........x..x..', s: '....x.......x...', h: 'x.x.x.x.x.x.x.xx', o: '..x.......x.....' },
  jumpFull: { k: 'x.........x.....', s: '....x.......x...', c: '....x.......x...', h: 'xoxoxoxoxoxoxoxo', o: '..x...x...x...x.' },
  darkFull: { k: 'x.........x.x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..x...x...x...x.' },
  raveFull: { k: 'x.x.......x.x...', s: '....x.......x...', c: '....x.......x...', h: 'xxxoxxxoxxxoxxxo', o: '..x.......x.....', t: 'xoxoxoxoxoxoxoxo' },
  dholki: { g: 'x..x..x.x..x..x.', e: '..x...x...x...x.', t: 'x.x.x.x.x.x.x.x.' },
  dholkiFull: { g: 'x.ox..xox.ox..xo', d: 'x.......x.......', e: '..x.x.x...x.x.x.', t: 'xoxoxoxoxoxoxoxo', c: '....x.......x...' },
  bhangraL: { d: 'x.......x.......', e: '..x...x...x.....', t: 'x.x.x.x.x.x.x.x.' },
  bhangraF: { d: 'x..x..x.x..x..x.', e: '..x.x.x...x.x.x.', k: 'x...x...x...x...', c: '....x.......x...', t: 'xoxoxoxoxoxoxoxo' },
  bhangraFast: { d: 'x.xx.xx.x.xx.xx.', e: '..x.x.x.x.x.x.x.', k: 'x...x...x...x...', c: '....x.......x...', t: 'xoxoxoxoxoxoxoxo', h: '..o...o...o...o.' },
  pbPopL: { k: 'x.......x.......', d: 'x.....x.........', e: '....x.......x...', h: '..o...o...o...o.' },
  pbPopF: { k: 'x...x...x...x...', c: '....x.......x...', d: 'x..x..x.x..x..x.', e: '..x...x...x...x.', h: 'x.xox.xox.xox.xo', t: '.x.x.x.x.x.x.x.x' },
  pbTrapL: { k: 'x.....x.x.......', s: '........x.......', h: 'x.xxx.xxx.x.xxxx', d: '..x.......x.....' },
  pbTrapF: { k: 'x.....x.x.....x.', s: '........x.......', c: '........x.......', h: 'xxxxxxxxxxxxxxxx', d: '..x..x....x.x...', e: '....x.......x...' },
};

/** Bass lines for the pop and rock genres: a pattern of sixteenths, a timbre, and which hits jump an octave. */
export const BASS = {
  disco: { t: 'round', p: 'x.x.x.x.x.x.x.x.', up: '..x...x...x...x.', len: 2 },
  bounce: { t: 'eighth', p: 'x..x..x...x.x...', len: 2 },
  dembow: { t: 'round', p: 'x..x..x.x..x..x.', len: 3 },
  afro: { t: 'round', p: 'x.....x.x...x...', len: 3 },
  funk: { t: 'slap', p: 'x..xx.x.x..x.xx.', up: '....x.......x...', len: 1.4 },
  pump: { t: 'eighth', p: 'x.x.x.x.x.x.x.x.', len: 2 },
  pick: { t: 'pick', p: 'x.x.x.x.x.x.x.x.', len: 2 },
  pickSync: { t: 'pick', p: 'x.x...x.x.x...x.', len: 2 },
  gallop: { t: 'pick', p: 'x.xxx.xxx.xxx.xx', len: 1.2 },
  // drum & bass: low reese / wub / sub lines (cap = highest note before dropping an octave)
  reese: { t: 'reese', p: 'x.......x.......', len: 8, cap: 40 },
  reeseStep: { t: 'reese', p: 'x.....x.x.......', len: 3, cap: 40 },
  neuro: { t: 'reese', p: 'x..x..x...x.x...', len: 2, cap: 40 },
  wub: { t: 'wub', p: 'x.......x.......', len: 7, cap: 40 },
  sub: { t: 'sub', p: 'x.........x.....', len: 8, cap: 40 },
  rollSub: { t: 'sub', p: 'x.x...x.x.x...x.', len: 2, cap: 40 },
  // punjabi
  bhangra: { t: 'round', p: 'x..x..x.x..x..x.', len: 3 },
  bhangraSlow: { t: 'round', p: 'x.....x.x.......', len: 4 },
  pbPop: { t: 'eighth', p: 'x..x..x...x.x...', len: 2 },
};

/** Rhythm guitar and keyboard comping patterns (one bar of sixteenths). */
export const COMPS = {
  hold: 'x...............', half: 'x.......x.......', quarter: 'x...x...x...x...', eighth: 'x.x.x.x.x.x.x.x.',
  off: '..x...x...x...x.', sync: 'x..x..x...x.x...', two: 'x..x....x..x....', tres: 'x..x..x.x..x..x.',
  chug: 'x.xxx.xxx.xxx.xx', gallop: 'x.xx.xx.x.xx.xx.', punch: 'x.x...x.x.x...x.',
};

/** Where the crowd shouts. Hits fall on sixteenths of the bar. */
export const GANGS = {
  snare: '....x.......x...', off: '..x...x...x...x.', one: 'x.......x.......', sync: 'x..x..x...x.....', run: 'x...x...x...x...',
};

/** Syllables the synthesised singers use: `v` for verses, `h` for the hook (one per eighth, cycled), `g` for shouts. */
export const SYLSETS = {
  ohoh: { v: ['ooh', 'ah'], h: ['oh', 'oh', 'oh', 'ah'], g: ['hey', 'oh'] },
  lala: { v: ['na', 'ah'], h: ['la', 'la', 'la', 'la', 'da', 'da', 'la', 'la'], g: ['hey', 'hey'] },
  yeah: { v: ['ooh', 'ah'], h: ['yeah', 'ah', 'yeah', 'oh'], g: ['hey', 'yeah'] },
  hey: { v: ['ah', 'oh'], h: ['hey', 'oh', 'hey', 'ah'], g: ['hey', 'hey', 'oh'] },
  whoa: { v: ['ooh', 'oh'], h: ['whoa', 'oh', 'whoa', 'oh'], g: ['whoa', 'hey'] },
  nana: { v: ['ooh', 'ah'], h: ['na', 'na', 'na', 'na', 'ay', 'na', 'na', 'ah'], g: ['hey', 'oh'] },
  dada: { v: ['ah', 'ooh'], h: ['da', 'da', 'ah', 'da'], g: ['hey', 'hey', 'oh', 'hey'] },
  oooh: { v: ['ooh', 'oh'], h: ['ooh', 'ah', 'ooh', 'oh'], g: ['oh', 'ay'] },
  rock: { v: ['ah', 'oh'], h: ['oh', 'ah', 'oh', 'ay'], g: ['hey', 'hey', 'oh', 'hey'] },
  // drum & bass: airy sung hooks, and MC shouts
  mc: { v: ['ah', 'oh'], h: ['yo', 'oh', 'yo', 'ah'], g: ['oi', 'yo', 'hey'] },
  // punjabi exclamations
  bhangra: { v: ['aa', 'oh'], h: ['ho', 'ho', 've', 'ho', 'ba', 'le', 'ba', 'le'], g: ['hoi', 'oye', 'ho'] },
  oye: { v: ['aa', 'oh'], h: ['oye', 'oye', 'hoi', 'ho'], g: ['oye', 'hoi'] },
  gidha: { v: ['aa', 'ooh'], h: ['ni', 'ni', 've', 'ni'], g: ['hoi', 'ho'] },
  tappe: { v: ['aa', 'oh'], h: ['ja', 'ni', 'ja', 've', 'ho', 'ho', 'oye', 'ho'], g: ['hoi', 'oye', 'ba'] },
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
  bounce: [[1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 0, 1, 1, 0, 1, 0], [1, 1, 0, 1, 0, 1, 0, 0], [1, 0, 1, 0, 1, 1, 0, 1]],
  eights: [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 1, 1, 1, 0, 1], [1, 1, 1, 0, 1, 1, 1, 0], [1, 0, 1, 1, 1, 0, 1, 1]],
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
function genPhrase(rng, prof, kind, prog, slot, handMotif) {
  const bars = kind === 'H' ? 8 : 4, [lo, hi] = prof.range[kind], names = kind === 'H' ? prof.hook : prof.body;
  const pool = RHYTHM[names].slice(0, slot <= 1 ? Math.max(2, RHYTHM[names].length - 2) : undefined);
  const out = []; let prev = Math.round((lo + hi) / 2);
  const generated = genBar(rng, pick(rng, pool), 0, 2, 0, 6).tokens;
  const motif = handMotif ? handMotif.trim().split(/\s+/).map((t) => (/^-?\d+$/.test(t) ? Number(t) : t)) : generated;
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
// Genres of ten tracks climb in ten steps; the curve below stays inside the range the five-track genres use.
const SLOT10 = {
  label: ['Easy', 'Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Hard', 'Expert', 'Expert'], level: [1, 1, 1, 2, 2, 2, 3, 3, 3, 3],
  gap: [0.3, 0.29, 0.28, 0.26, 0.25, 0.24, 0.22, 0.21, 0.2, 0.19], reach: [1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.25, 2.35, 2.45, 2.55],
};
const slotTable = (count) => (count === 10 ? SLOT10 : SLOT);
/** "kind:pattern" becomes the comping instrument and its rhythm for a section. */
const parseComp = (text) => { if (!text) return null; const [kind, name] = text.split(':'); return { kind, pat: COMPS[name] }; };
/** Pop and rock songs run 40 bars below 140 BPM and 60 above it, so every track lands between 70 and 105 seconds. */
const template = (prof, bpm) => (prof.templates ? (bpm >= 140 ? prof.templates.long : prof.templates.std) : prof.sections);

function compose(prof, spec, slot, count = 5) {
  const S = slotTable(count), level = count === 5 ? slot : Math.round((slot * 4) / (count - 1));
  const rng = prng(spec.seed), phrases = {}, drums = { ...prof.kits, ...spec.drums }, voices = { ...prof.voices, ...spec.voices }, comps = { ...prof.comps, ...spec.comps };
  const local = { ...prof, hook: spec.hook || prof.hook };
  for (const kind of ['A', 'B', 'H']) phrases[kind] = genPhrase(rng, local, kind, spec.prog, level, kind === 'H' ? spec.motif : undefined);
  const gangs = GANGS[spec.gang || prof.gang], dbl = spec.dbl || prof.dbl;
  return {
    id: spec.id, title: spec.title, difficulty: S.label[slot], level: S.level[slot], bpm: spec.bpm, root: spec.root,
    scale: spec.scale || prof.scale, prog: spec.prog, seventh: prof.seventh, theme: prof.theme,
    speed: Math.min(10, Math.round((0.86 + 0.061 * spec.bpm + level * 0.15) * 10) / 10), minGap: S.gap[slot], reach: S.reach[slot],
    lead: spec.lead || prof.lead, bass: spec.bass || prof.bass, phrases, shift: spec.shift || 0,
    // Singers: syllable sets, voice type and grit (rock). Acoustic-style kick and big snare are per genre or track.
    ...(prof.syl ? { syl: SYLSETS[spec.syl || prof.syl], female: spec.female ?? prof.female ?? true, grit: spec.grit ?? prof.grit ?? false, voxGain: 10 ** ((spec.voxTrim || 0) / 20) } : {}),
    acoustic: spec.acoustic ?? prof.acoustic ?? false, bigSnare: spec.bigSnare ?? prof.bigSnare ?? false,
    sections: template(prof, spec.bpm).map((sec) => ({
      ...sec, drums: drums[sec.drums] || sec.drums,
      ...(sec.voice && voices[sec.voice] ? { voice: voices[sec.voice] } : {}),
      ...(sec.comp ? { comp: parseComp(comps[sec.comp]) } : {}),
      ...(sec.gang ? { gang: gangs } : {}),
      ...(sec.dbl ? { dbl } : {}),
    })),
  };
}
const hand = (id) => HAND.find((t) => t.id === id);

// Pop and rock arrangements. Section roles (drums 'intro' / 'verse' / 'full' / 'brk', voice 'v' / 'p' / 'h' / 'b',
// comp 'riff' / 'lo' / 'hi') are mapped to real kits, singers and instruments by each genre and track.
const POP_STD = [
  { n: 'Intro', bars: 4, drums: 'intro', pad: 1, comp: 'lo', e: 0.3 },
  { n: 'Verse', bars: 8, drums: 'verse', bass: 1, comp: 'lo', lead: 'A', voice: 'v', e: 0.5 },
  { n: 'Pre-chorus', bars: 4, drums: 'build', bass: 1, pad: 1, comp: 'lo', lead: 'B', voice: 'p', riser: 1, harm: 1, e: 0.68 },
  { n: 'Chorus', bars: 8, drums: 'full', bass: 1, pad: 2, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, gang: 1, duck: 1, impact: 1, e: 1 },
  { n: 'Break', bars: 4, drums: 'brk', pad: 1, comp: 'lo', lead: 'B', voice: 'b', riser: 1, harm: 1, e: 0.4 },
  { n: 'Final chorus', bars: 8, drums: 'full', bass: 1, pad: 2, arp: 1, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, thick: 1, gang: 1, harm: 1, duck: 1, impact: 1, e: 1 },
  { n: 'Outro', bars: 4, drums: 'intro', pad: 1, comp: 'lo', impact: 1, e: 0.25 },
];
const POP_LONG = [
  { n: 'Intro', bars: 4, drums: 'intro', pad: 1, comp: 'lo', e: 0.3 },
  { n: 'Verse', bars: 8, drums: 'verse', bass: 1, comp: 'lo', lead: 'A', voice: 'v', e: 0.5 },
  { n: 'Pre-chorus', bars: 4, drums: 'build', bass: 1, pad: 1, comp: 'lo', lead: 'B', voice: 'p', riser: 1, harm: 1, e: 0.68 },
  { n: 'Chorus', bars: 8, drums: 'full', bass: 1, pad: 2, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, gang: 1, duck: 1, impact: 1, e: 1 },
  { n: 'Verse 2', bars: 8, drums: 'verse', bass: 1, arp: 1, comp: 'hi', lead: 'A', voice: 'v', e: 0.6 },
  { n: 'Pre-chorus', bars: 4, drums: 'build', bass: 1, pad: 1, comp: 'lo', lead: 'B', voice: 'p', riser: 1, harm: 1, e: 0.72 },
  { n: 'Chorus', bars: 8, drums: 'full', bass: 1, pad: 2, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, gang: 1, duck: 1, impact: 1, e: 1 },
  { n: 'Break', bars: 4, drums: 'brk', pad: 1, comp: 'lo', lead: 'B', voice: 'b', riser: 1, harm: 1, e: 0.4 },
  { n: 'Final chorus', bars: 8, drums: 'full', bass: 1, pad: 2, arp: 1, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, thick: 1, gang: 1, harm: 1, duck: 1, impact: 1, e: 1 },
  { n: 'Outro', bars: 4, drums: 'intro', pad: 1, comp: 'lo', impact: 1, e: 0.25 },
];
const ROCK_STD = [
  { n: 'Intro', bars: 4, drums: 'intro', comp: 'riff', e: 0.35 },
  { n: 'Verse', bars: 8, drums: 'verse', bass: 1, comp: 'lo', lead: 'A', voice: 'v', fill: 1, e: 0.55 },
  { n: 'Pre-chorus', bars: 4, drums: 'build', bass: 1, comp: 'lo', lead: 'B', voice: 'p', e: 0.74 },
  { n: 'Chorus', bars: 8, drums: 'full', bass: 1, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, gang: 1, crash: 1, e: 1 },
  { n: 'Solo', bars: 4, drums: 'verse', bass: 1, comp: 'lo', lead: 'B', voice: 'b', fill: 1, e: 0.8 },
  { n: 'Final chorus', bars: 8, drums: 'full', bass: 1, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, thick: 1, gang: 1, harm: 1, crash: 1, e: 1 },
  { n: 'Outro', bars: 4, drums: 'intro', comp: 'riff', crash: 1, e: 0.3 },
];
const ROCK_LONG = [
  { n: 'Intro', bars: 4, drums: 'intro', comp: 'riff', e: 0.35 },
  { n: 'Verse', bars: 8, drums: 'verse', bass: 1, comp: 'lo', lead: 'A', voice: 'v', fill: 1, e: 0.55 },
  { n: 'Pre-chorus', bars: 4, drums: 'build', bass: 1, comp: 'lo', lead: 'B', voice: 'p', e: 0.74 },
  { n: 'Chorus', bars: 8, drums: 'full', bass: 1, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, gang: 1, crash: 1, e: 1 },
  { n: 'Verse 2', bars: 8, drums: 'verse', bass: 1, comp: 'hi', lead: 'A', voice: 'v', fill: 1, e: 0.65 },
  { n: 'Pre-chorus', bars: 4, drums: 'build', bass: 1, comp: 'lo', lead: 'B', voice: 'p', e: 0.76 },
  { n: 'Chorus', bars: 8, drums: 'full', bass: 1, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, gang: 1, crash: 1, e: 1 },
  { n: 'Solo', bars: 4, drums: 'verse', bass: 1, comp: 'lo', lead: 'B', voice: 'b', fill: 1, e: 0.8 },
  { n: 'Final chorus', bars: 8, drums: 'full', bass: 1, comp: 'hi', lead: 'H', voice: 'h', dbl: 1, thick: 1, gang: 1, harm: 1, crash: 1, e: 1 },
  { n: 'Outro', bars: 4, drums: 'intro', comp: 'riff', crash: 1, e: 0.3 },
];
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
  {
    id: 'pop', name: 'Pop', tagline: 'Hooks, handclaps and dance-floor drops',
    prof: {
      theme: 'disco', lead: 'vox', bass: 'bounce', scale: 'major', body: 'mid', hook: 'bounce', range: { A: [0, 7], B: [2, 9], H: [2, 10] },
      templates: { std: POP_STD, long: POP_LONG }, kits: { intro: 'kicks', verse: 'popFour', full: 'popFourFull', brk: 'none' },
      comps: { lo: 'synth:half', hi: 'synth:off' }, voices: { v: 'voxv', p: 'voxv', h: 'vox', b: 'epiano' },
      syl: 'ohoh', dbl: 'pluck', gang: 'snare', female: true,
    },
    slots: [
      { id: 'glitter-pulse', title: 'Glitter Pulse', bpm: 118, root: 60, prog: [0, 4, 5, 3], seed: 211, shift: 0, motif: '4 - 4 5 . 4 2 -' },
      { id: 'disco-heartbeat', title: 'Disco Heartbeat', bpm: 116, root: 62, voxTrim: 3.5, scale: 'dorian', prog: [0, 3, 0, 4], seed: 223, shift: -25, motif: '4 . 4 . 6 - 4 2', syl: 'hey',
        bass: 'disco', drums: { verse: 'disco', full: 'discoFull' }, comps: { lo: 'brass:half', hi: 'brass:off' }, voices: { b: 'bell' }, dbl: 'brass' },
      { id: 'sugar-rush', title: 'Sugar Rush', bpm: 126, root: 62, voxTrim: -2, prog: [5, 3, 0, 4], seed: 227, shift: 40, motif: '4 4 . 4 5 . 7 -', syl: 'lala',
        drums: { verse: 'kpop', full: 'kpopFull' }, comps: { lo: 'piano:sync', hi: 'synth:sync' } },
      { id: 'palm-romance', title: 'Palm Romance', bpm: 102, root: 59, prog: [0, 5, 3, 4], seed: 233, shift: 70, motif: '2 - 4 . 2 - 0 .', syl: 'yeah',
        bass: 'afro', drums: { intro: 'light', verse: 'afro', full: 'afroFull' }, comps: { lo: 'epiano:two', hi: 'epiano:tres' }, voices: { b: 'bell' } },
      { id: 'hola-sunset', title: 'Hola Sunset', bpm: 96, root: 57, voxTrim: 3, scale: 'minor', prog: [0, 5, 2, 6], seed: 239, shift: -50, motif: '2 . 4 5 . 4 2 .', syl: 'whoa',
        bass: 'dembow', drums: { intro: 'light', verse: 'dembow', full: 'dembowFull' }, comps: { lo: 'clean:tres', hi: 'clean:sync' } },
      { id: 'velvet-funk', title: 'Velvet Funk', bpm: 112, root: 58, voxTrim: -4, scale: 'dorian', prog: [0, 3, 0, 3], seed: 241, shift: 100, motif: '0 . 2 . 4 5 . 4', syl: 'hey',
        bass: 'funk', drums: { verse: 'funk', full: 'funkFull' }, comps: { lo: 'piano:sync', hi: 'brass:sync' }, dbl: 'brass' },
      { id: 'neon-confetti', title: 'Neon Confetti', bpm: 124, root: 62, voxTrim: 2, scale: 'minor', prog: [0, 6, 5, 6], seed: 251, shift: -85, motif: '7 - 7 6 4 - 6 -', syl: 'nana',
        bass: 'pump', drums: { verse: 'electro', full: 'electroFull' }, comps: { lo: 'synth:half', hi: 'synth:eighth' }, dbl: 'super' },
      { id: 'highway-heart', title: 'Highway Heart', bpm: 156, root: 60, scale: 'minor', prog: [2, 6, 0, 5], seed: 257, shift: 150, motif: '4 4 5 4 2 4 5 -', syl: 'whoa',
        bass: 'pump', drums: { verse: 'synthRun', full: 'synthRunFull' }, comps: { lo: 'synth:quarter', hi: 'synth:eighth' }, dbl: 'super' },
      { id: 'starlit-showdown', title: 'Starlit Showdown', bpm: 128, root: 59, prog: [0, 2, 5, 4], seed: 263, shift: -120, motif: '4 . 4 5 . 7 . 5', syl: 'yeah',
        bass: 'pump', drums: { verse: 'houseT', full: 'houseTFull' }, comps: { lo: 'piano:off', hi: 'piano:sync' }, dbl: 'super' },
      { id: 'main-character', title: 'Main Character', bpm: 132, root: 60, prog: [0, 4, 3, 4], seed: 269, shift: 180, motif: '7 - 5 - 4 5 7 -', syl: 'whoa',
        drums: { verse: 'mega', full: 'megaFull' }, dbl: 'super' }],
  },
  {
    id: 'rock', name: 'Rock', tagline: 'Big riffs, gang vocals and stage lights',
    prof: {
      theme: 'stage', lead: 'gtr', bass: 'pick', scale: 'mixolydian', body: 'mid', hook: 'drive', range: { A: [0, 7], B: [2, 9], H: [2, 10] },
      templates: { std: ROCK_STD, long: ROCK_LONG }, kits: { intro: 'none', verse: 'rockEasy', full: 'rockEasyFull', brk: 'none' },
      comps: { riff: 'chug:chug', lo: 'chug:eighth', hi: 'power:half' }, voices: { v: 'voxv', p: 'voxv', h: 'vox', b: 'gtr' },
      syl: 'rock', dbl: 'gtr', gang: 'snare', female: false, grit: true, acoustic: true,
    },
    slots: [
      { id: 'garage-sunrise', title: 'Garage Sunrise', bpm: 118, root: 52, prog: [0, 6, 3, 0], seed: 301, shift: 0, motif: '4 - 4 . 5 - 4 2', syl: 'ohoh',
        comps: { riff: 'clean:eighth', lo: 'clean:half', hi: 'power:half' } },
      { id: 'back-seat-anthem', title: 'Back Seat Anthem', bpm: 104, root: 55, scale: 'major', prog: [0, 3, 4, 3], seed: 307, shift: -40, motif: '2 - 4 - 5 4 2 -',
        drums: { verse: 'classic', full: 'classicFull' }, comps: { riff: 'power:half', lo: 'power:half', hi: 'power:quarter' } },
      { id: 'jukebox-lightning', title: 'Jukebox Lightning', bpm: 132, root: 50, prog: [0, 0, 3, 4], seed: 311, shift: 50, motif: '4 4 . 4 5 . 4 2', syl: 'hey',
        bass: 'pickSync', drums: { verse: 'boogie', full: 'boogieFull' }, comps: { lo: 'chug:eighth', hi: 'power:eighth' } },
      { id: 'stadium-lights', title: 'Stadium Lights', bpm: 120, root: 53, scale: 'major', prog: [0, 4, 5, 3], seed: 313, shift: 95, motif: '4 - 4 - 5 - 7 -', syl: 'whoa', bigSnare: true,
        drums: { verse: 'stomp', full: 'stompFull' }, comps: { riff: 'power:half', lo: 'power:half', hi: 'power:quarter' } },
      { id: 'sunday-riot', title: 'Sunday Riot', bpm: 168, root: 52, scale: 'major', prog: [5, 3, 0, 4], seed: 317, shift: -80, motif: '4 4 5 4 2 - 4 -', syl: 'ohoh', hook: 'eights',
        drums: { verse: 'punkPop', full: 'punkPopFull' }, comps: { riff: 'power:eighth', lo: 'chug:eighth', hi: 'power:eighth' }, gang: 'run' },
      { id: 'dance-floor-fuzz', title: 'Dance Floor Fuzz', bpm: 124, root: 53, scale: 'minor', prog: [0, 2, 6, 5], seed: 331, shift: 140, motif: '0 . 2 . 4 . 2 .', syl: 'hey',
        bass: 'pickSync', drums: { verse: 'danceRock', full: 'danceRockFull' }, comps: { riff: 'chug:sync', lo: 'chug:sync', hi: 'power:off' }, gang: 'off' },
      { id: 'gasoline-heart', title: 'Gasoline Heart', bpm: 160, root: 50, scale: 'minor', prog: [0, 5, 2, 6], seed: 337, shift: -130, motif: '4 - 4 5 4 - 2 -', syl: 'nana',
        drums: { verse: 'altRock', full: 'altRockFull' }, comps: { riff: 'clean:eighth', lo: 'clean:eighth', hi: 'power:eighth' } },
      { id: 'voltage-kid', title: 'Voltage Kid', bpm: 138, root: 52, scale: 'minor', prog: [0, 6, 5, 4], seed: 347, shift: 190, motif: '0 0 . 2 . 4 . 3', syl: 'hey',
        bass: 'gallop', drums: { verse: 'hard', full: 'hardFull' }, comps: { riff: 'chug:gallop', lo: 'chug:chug', hi: 'power:chug' } },
      { id: 'riot-parade', title: 'Riot Parade', bpm: 184, root: 55, voxTrim: -2, scale: 'major', prog: [0, 3, 4, 0], seed: 353, shift: -170, motif: '4 4 4 5 4 2 4 -', syl: 'ohoh', hook: 'eights',
        drums: { verse: 'punk', full: 'punkFull' }, comps: { riff: 'power:eighth', lo: 'power:eighth', hi: 'power:eighth' }, gang: 'run' },
      { id: 'final-encore', title: 'Final Encore', bpm: 150, root: 51, scale: 'minor', prog: [0, 5, 2, 6], seed: 359, shift: 25, motif: '7 - 6 - 4 - 6 7', syl: 'whoa', bigSnare: true,
        bass: 'gallop', drums: { verse: 'epic', full: 'epicFull' }, comps: { riff: 'chug:gallop', lo: 'chug:chug', hi: 'power:half' } }],
  },
  {
    id: 'dnb', name: 'Drum & Bass', tagline: 'Breakbeats, reese basslines and rave shouts',
    prof: {
      theme: 'rave', lead: 'vox', bass: 'reese', scale: 'minor', body: 'mid', hook: 'bounce', range: { A: [0, 7], B: [2, 9], H: [2, 10] },
      templates: { std: POP_LONG, long: POP_LONG }, kits: { intro: 'none', verse: 'dnbHalf', full: 'rollerFull', brk: 'none' },
      comps: { lo: 'synth:half', hi: 'synth:off' }, voices: { v: 'voxv', p: 'voxv', h: 'vox', b: 'epiano' },
      syl: 'oooh', dbl: 'super', gang: 'off', female: true, grit: false, acoustic: false,
    },
    slots: [
      { id: 'liquid-skyline', title: 'Liquid Skyline', bpm: 170, root: 60, prog: [0, 5, 2, 6], seed: 401, shift: 0, motif: '4 - 4 5 . 4 2 -', syl: 'oooh',
        bass: 'rollSub', drums: { verse: 'dnbSparse', full: 'liquidFull' }, comps: { lo: 'epiano:half', hi: 'epiano:off' }, dbl: 'bell', voices: { b: 'bell' } },
      { id: 'sunrise-roller', title: 'Sunrise Roller', bpm: 172, root: 59, scale: 'dorian', prog: [0, 3, 0, 4], seed: 409, shift: 45, motif: '4 . 4 5 . 7 5 .', syl: 'yeah',
        drums: { verse: 'dnbHalf', full: 'rollerFull' }, comps: { lo: 'synth:half', hi: 'synth:sync' }, dbl: 'pluck' },
      { id: 'neon-jungle', title: 'Neon Jungle', bpm: 168, root: 58, prog: [0, 6, 5, 6], seed: 419, shift: -60, motif: '4 4 . 4 5 . 2 -', syl: 'hey', gang: 'sync',
        bass: 'reeseStep', drums: { verse: 'dnbSparse', full: 'jungleFull' }, comps: { lo: 'brass:two', hi: 'brass:sync' }, dbl: 'brass' },
      { id: 'sub-zero', title: 'Sub Zero', bpm: 174, root: 52, prog: [0, 0, 5, 6], seed: 421, shift: 100, motif: '2 . 4 . 5 - 4 2', syl: 'mc', female: false, grit: true,
        bass: 'sub', drums: { verse: 'dnbHalf', full: 'techFull' }, comps: { lo: 'synth:half', hi: 'synth:quarter' } },
      { id: 'rewind-riot', title: 'Rewind Riot', bpm: 174, root: 53, prog: [0, 3, 5, 4], seed: 431, shift: -100, motif: '4 4 5 4 . 2 4 -', syl: 'mc', female: false, grit: true, gang: 'sync',
        bass: 'wub', drums: { verse: 'dnbSparse', full: 'jumpFull' }, comps: { lo: 'brass:half', hi: 'brass:sync' }, dbl: 'brass' },
      { id: 'midnight-roller', title: 'Midnight Roller', bpm: 172, root: 55, prog: [0, 5, 6, 0], seed: 433, shift: 140, motif: '4 - 5 - 4 . 2 .', syl: 'nana',
        drums: { verse: 'dnbHalf', full: 'rollerFull' }, comps: { lo: 'epiano:half', hi: 'synth:eighth' }, dbl: 'bell' },
      { id: 'techstep-temple', title: 'Techstep Temple', bpm: 176, root: 50, voxTrim: -2, scale: 'phrygian', prog: [0, 1, 0, 6], seed: 439, shift: -140, motif: '0 . 2 . 4 . 3 2', syl: 'whoa', female: false, grit: true,
        bass: 'neuro', drums: { verse: 'dnbSparse', full: 'techFull' }, comps: { lo: 'synth:quarter', hi: 'synth:eighth' } },
      { id: 'neurofunk-lab', title: 'Neurofunk Lab', bpm: 174, root: 51, prog: [0, 6, 4, 5], seed: 443, shift: 175, motif: '4 4 . 5 4 . 7 5', syl: 'mc', female: false, grit: true,
        bass: 'neuro', drums: { verse: 'dnbSparse', full: 'neuroFull' }, comps: { lo: 'synth:half', hi: 'synth:sync' } },
      { id: 'darkside-drop', title: 'Darkside Drop', bpm: 178, root: 49, scale: 'phrygian', prog: [0, 1, 5, 0], seed: 449, shift: -175, motif: '0 0 . 2 . 4 . 3', syl: 'hey', female: false, grit: true,
        bass: 'wub', drums: { verse: 'dnbHalf', full: 'darkFull' }, comps: { lo: 'synth:quarter', hi: 'synth:eighth' }, gang: 'run' },
      { id: 'rave-rewind', title: 'Rave Rewind', bpm: 180, root: 57, prog: [0, 5, 2, 6], seed: 457, shift: 60, motif: '7 - 6 - 4 5 7 -', syl: 'whoa', voxTrim: 0,
        bass: 'neuro', drums: { verse: 'dnbSparse', full: 'raveFull' }, comps: { lo: 'synth:half', hi: 'synth:eighth' }, gang: 'sync' }],
  },
  {
    id: 'punjabi', name: 'Punjabi', tagline: 'Dhol, tumbi and bhangra on the dance floor',
    prof: {
      theme: 'fields', lead: 'vox', bass: 'bhangra', scale: 'mixolydian', body: 'mid', hook: 'bounce', range: { A: [0, 7], B: [2, 9], H: [2, 10] },
      templates: { std: POP_STD, long: POP_LONG }, kits: { intro: 'dholki', verse: 'bhangraL', full: 'bhangraF', brk: 'none' },
      comps: { lo: 'harmonium:hold', hi: 'tumbi:sync' }, voices: { v: 'voxv', p: 'voxv', h: 'vox', b: 'tumbi' },
      syl: 'bhangra', dbl: 'tumbi', gang: 'sync', female: false, grit: true, acoustic: false, bigSnare: false,
    },
    slots: [
      { id: 'gidha-night', title: 'Gidha Night', bpm: 96, root: 60, prog: [0, 6, 3, 0], seed: 501, shift: 0, motif: '4 - 4 5 . 4 2 -', syl: 'gidha', female: true, grit: false,
        bass: 'bhangraSlow', drums: { intro: 'dholki', verse: 'dholki', full: 'dholkiFull' }, comps: { lo: 'harmonium:hold', hi: 'harmonium:half' } },
      { id: 'pind-party', title: 'Pind Party', bpm: 100, root: 52, prog: [0, 6, 0, 3], seed: 509, shift: 14, motif: '4 4 . 5 4 . 2 .', syl: 'oye',
        bass: 'bhangraSlow', drums: { verse: 'bhangraL', full: 'bhangraF' } },
      { id: 'sarson-sunrise', title: 'Sarson Sunrise', bpm: 104, root: 53, scale: 'major', prog: [0, 4, 5, 3], seed: 521, shift: -12, motif: '2 - 4 . 5 - 4 2', syl: 'bhangra',
        drums: { verse: 'bhangraL', full: 'bhangraF' }, comps: { lo: 'harmonium:half', hi: 'tumbi:eighth' } },
      { id: 'dhol-dhamaka', title: 'Dhol Dhamaka', bpm: 108, root: 52, scale: 'harmonic', prog: [0, 3, 0, 4], seed: 523, shift: 22, motif: '4 4 . 4 5 . 7 5', syl: 'tappe',
        drums: { verse: 'bhangraL', full: 'bhangraF' }, comps: { lo: 'harmonium:hold', hi: 'tumbi:sync' } },
      { id: 'tumbi-tarang', title: 'Tumbi Tarang', bpm: 110, root: 50, voxTrim: -2.5, scale: 'harmonic', prog: [0, 5, 3, 4], seed: 541, shift: -18, motif: '4 . 5 . 4 2 . 4', syl: 'oye',
        bass: 'pbPop', drums: { intro: 'light', verse: 'pbPopL', full: 'pbPopF' }, comps: { lo: 'tumbi:half', hi: 'tumbi:eighth' }, dbl: 'pluck' },
      { id: 'chandigarh-cruise', title: 'Chandigarh Cruise', bpm: 98, root: 53, voxTrim: -2.5, prog: [0, 6, 3, 6], seed: 547, shift: 28, motif: '2 . 4 5 . 4 2 .', syl: 'bhangra',
        bass: 'pbPop', drums: { intro: 'kicks', verse: 'pbPopL', full: 'pbPopF' }, comps: { lo: 'harmonium:half', hi: 'tumbi:sync' } },
      { id: 'desi-swagger', title: 'Desi Swagger', bpm: 142, root: 48, scale: 'minor', prog: [0, 5, 2, 6], seed: 557, shift: -24, motif: '4 - 4 . 5 . 4 2', syl: 'tappe',
        bass: '808', drums: { intro: 'none', verse: 'pbTrapL', full: 'pbTrapF' }, comps: { lo: 'harmonium:hold', hi: 'tumbi:sync' } },
      { id: 'vaisakhi-vibes', title: 'Vaisakhi Vibes', bpm: 112, root: 53, scale: 'dorian', prog: [0, 3, 4, 3], seed: 563, shift: 34, motif: '4 4 5 4 2 4 5 -', syl: 'oye',
        drums: { verse: 'bhangraL', full: 'bhangraFast' }, comps: { lo: 'harmonium:half', hi: 'tumbi:eighth' } },
      { id: 'bhangra-blast', title: 'Bhangra Blast', bpm: 124, root: 51, scale: 'harmonic', prog: [0, 4, 5, 3], seed: 569, shift: -30, motif: '4 . 4 5 . 7 . 5', syl: 'tappe', gang: 'off',
        drums: { verse: 'bhangraL', full: 'bhangraFast' }, comps: { lo: 'tumbi:half', hi: 'tumbi:eighth' } },
      { id: 'desi-drop', title: 'Desi Drop', bpm: 128, root: 50, voxTrim: -2.5, scale: 'phrygian', prog: [0, 1, 0, 6], seed: 571, shift: 10, motif: '7 - 5 - 4 5 7 -', syl: 'bhangra', gang: 'off',
        bass: 'pbPop', drums: { intro: 'kicks', verse: 'pbPopL', full: 'pbPopF' }, comps: { lo: 'harmonium:half', hi: 'tumbi:eighth' } }],
  },
];

export const GENRES = GENRE_DEFS.map((def) => {
  const prof = { ...def.prof, ...(def.prof.base ? { sections: hand(def.prof.base).sections } : {}) };
  const count = def.slots.length;
  const tracks = def.slots.map((entry, slot) => {
    const track = typeof entry === 'string' ? { ...hand(entry), shift: 0 } : compose(prof, entry, slot, count);
    return { ...track, genre: def.id, no: slot + 1, difficulty: slotTable(count).label[slot] };
  });
  return { id: def.id, name: def.name, tagline: def.tagline, tracks };
});
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
  const bar = Math.max(0, Math.min(song.bars - 1, Math.floor(time / (song.s16 * 16))));
  return song.barSection[bar];
}
