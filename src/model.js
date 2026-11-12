// Game rules. Pure logic: no DOM, canvas or audio dependencies.
import { TRACKS, compile } from './songs.js';
export { TRACKS };

export const clamp = (x, a = -1, b = 1) => Math.max(a, Math.min(b, x));
export const TILE_HALF = 0.4;    // half tile width, in lane units (the stage spans -1..1)
export const GRACE = 0.09;       // the ball's own width forgives near edges
export const PERFECT = 0.15;     // centre window for a perfect landing
export const STREAK_STEP = 5;    // perfect landings per multiplier level
export const FEVER_AT = 10;      // perfect streak that ignites fever

const tri = (v) => Math.abs(((((v - 1) % 4) + 4) % 4) - 2) - 1;

/** Builds the tile chart from the song: lead-note onsets plus beat fills in the gaps. */
export function createChart(track) {
  const song = compile(track), { s16 } = song;
  const leadAt = new Map();
  for (const note of song.lead) if (!leadAt.has(note.step)) leadAt.set(note.step, note);
  const lastStep = (song.bars - 1) * 16;
  const steps = new Set([...leadAt.keys()].filter((s) => s <= lastStep));
  for (let s = 0; s <= lastStep; s += 4) {
    let near = false;
    for (let k = s - 3; k <= s + 3; k++) if (steps.has(k)) { near = true; break; }
    if (!near) steps.add(s);
  }
  const chart = [];
  let prevX = 0, prevT = -Infinity, prevSection = -1;
  for (const step of [...steps].sort((a, b) => a - b)) {
    const time = step * s16;
    if (time - prevT < track.minGap - 1e-6) continue;
    const index = chart.length, section = song.barSection[Math.floor(step / 16)];
    const gap = index ? time - prevT : song.beat, lead = leadAt.get(step);
    let x = 0;
    if (index >= 4) {
      const target = lead ? tri((lead.d - 4) * 0.25) * 0.72 : tri(index * 0.37) * 0.55;
      const reach = Math.min(0.8, track.reach * gap * (gap < 0.34 ? 0.75 : 1));
      x = clamp(clamp(target, prevX - reach, prevX + reach), -0.7, 0.7);
      x = Math.round(x * 1000) / 1000;
    }
    const gate = section.index !== prevSection;
    let kind = 'normal', w = 1;
    if (gate) { kind = 'wide'; w = 1.5; }
    else if (track.level >= 2 && section.e >= 0.5 && gap >= song.beat * 0.9 && (index * 7 + section.index) % 6 === 0) kind = 'move';
    chart.push({ index, step, time, x, w, kind, gap, section: section.index, gate });
    prevX = x; prevT = time; prevSection = section.index;
  }
  return chart;
}

export function judge(distance, width = 1) {
  const d = Math.abs(distance);
  if (d <= PERFECT * width) return 'perfect';
  return d <= TILE_HALF * width + GRACE ? 'good' : 'miss';
}

/** Where a flawless player would be at `time`: eases between neighbouring tiles. */
export function autoX(chart, time) {
  let lo = 0, hi = chart.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (chart[mid].time < time) lo = mid + 1; else hi = mid; }
  const next = chart[Math.min(lo, chart.length - 1)], prev = chart[lo - 1];
  if (!prev || lo >= chart.length) return next.x;
  const p = clamp((time - prev.time) / (next.time - prev.time) * 1.3, 0, 1);
  return prev.x + (next.x - prev.x) * p * p * (3 - 2 * p);
}

export class Run {
  constructor(track) {
    this.track = track; this.song = compile(track); this.chart = createChart(track);
    this.next = 0; this.score = 0; this.combo = 0; this.maxCombo = 0; this.streak = 0; this.bestStreak = 0;
    this.perfect = 0; this.good = 0; this.stars = 0; this.revived = false; this.hopStart = null;
    this.status = 'playing'; this.lastJudgement = null;
  }
  get progress() { return this.next / this.chart.length; }
  get multiplier() { return 1 + Math.min(4, Math.floor(this.streak / STREAK_STEP)); }
  get fever() { return this.streak >= FEVER_AT; }
  /** Resolves every tile whose landing time has passed. Each tile is judged exactly once. */
  advance(time, x, onHit = () => {}) {
    while (this.status === 'playing' && this.next < this.chart.length && time >= this.chart[this.next].time) {
      const note = this.chart[this.next], result = judge(x - note.x, note.w);
      this.lastJudgement = result;
      if (result === 'miss') { this.status = 'failed'; this.streak = 0; onHit(result, note); break; }
      this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
      if (result === 'perfect') { this.streak++; this.perfect++; this.bestStreak = Math.max(this.bestStreak, this.streak); this.score += 20 * this.multiplier; }
      else { this.streak = 0; this.good++; this.score += 10; }
      this.next++; this.hopStart = null;
      const stars = Math.floor(this.next * 3 / this.chart.length);
      const gained = stars > this.stars; this.stars = stars;
      if (this.next === this.chart.length) this.status = 'complete';
      onHit(result, note, gained);
    }
    return this.status;
  }
  /** One second chance per run: play resumes shortly before the missed tile. */
  revive() {
    if (this.status !== 'failed' || this.revived) return null;
    const note = this.chart[this.next];
    this.revived = true; this.status = 'playing'; this.combo = 0; this.streak = 0;
    this.hopStart = Math.max(note.time - this.song.beat * 2, -this.song.beat * 4);
    return { time: this.hopStart, x: note.x };
  }
  /** Jumps the run to a point in the song (used by the menu preview). */
  skipTo(time) {
    this.next = this.chart.findIndex((n) => n.time >= time);
    if (this.next < 0) this.next = this.chart.length;
    this.status = 'playing'; this.hopStart = time;
  }
}
