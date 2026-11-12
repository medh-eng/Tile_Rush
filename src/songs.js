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
};

export const TRACKS = [
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
