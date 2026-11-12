import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS as ALL_TRACKS, GENRES as ALL_GENRES, Run, createChart, judge, autoX, clamp, TILE_HALF, GRACE, PERFECT } from '../src/model.js';
import { compile, chord, degree } from '../src/songs.js';

const TRACKS = ALL_TRACKS.filter(t => !t.recording), GENRES = ALL_GENRES.filter(g => g.id !== 'piano');

test('five genres each hold five tracks in rising difficulty, with unique ids and their own tunes', () => {
  assert.equal(GENRES.length, 5); assert.equal(TRACKS.length, 25);
  assert.equal(new Set(TRACKS.map((t) => t.id)).size, 25); assert.equal(new Set(TRACKS.map((t) => t.title)).size, 25);
  for (const genre of GENRES) {
    assert.equal(genre.tracks.length, 5);
    assert.deepEqual(genre.tracks.map((t) => t.difficulty), ['Easy', 'Easy', 'Medium', 'Hard', 'Expert']);
    assert.deepEqual(genre.tracks.map((t) => t.no), [1, 2, 3, 4, 5]);
    for (const t of genre.tracks) assert.equal(t.genre, genre.id);
    assert.ok(genre.tracks[4].minGap <= genre.tracks[0].minGap && genre.tracks[4].reach >= genre.tracks[0].reach, `${genre.id} ends harder than it starts`);
    assert.equal(new Set(genre.tracks.map((t) => t.phrases.H)).size, 5, `${genre.id} hooks differ`);
  }
});

test('every track compiles into whole bars with lead notes inside the song', () => {
  for (const track of TRACKS) {
    const song = compile(track);
    assert.equal(song.bars, track.sections.reduce((n, s) => n + s.bars, 0));
    assert.ok(song.duration > 60 && song.duration < 120, `${track.id} length`);
    for (const note of song.lead) { assert.ok(note.step >= 0 && note.step < song.steps); assert.ok(note.midi > 40 && note.midi < 100); }
    for (let bar = 0; bar < song.bars; bar++) assert.ok(chord(track, bar).every((m) => m >= track.root - 12 && m <= track.root + 2));
    assert.equal(degree(track, 7), track.root + 12);
  }
});

test('charts are deterministic, on the sixteenth grid, gentle at the start and always reachable', () => {
  for (const track of TRACKS) {
    const song = compile(track), chart = createChart(track);
    assert.deepEqual(chart, createChart(track));
    assert.ok(chart.length > 120);
    assert.equal(chart[0].time, 0);
    for (let i = 0; i < 4; i++) assert.equal(chart[i].x, 0);
    for (let i = 0; i < chart.length; i++) {
      const note = chart[i];
      assert.equal(note.index, i); assert.ok(Math.abs(note.x) <= 0.7);
      assert.ok(Math.abs(note.time / song.s16 - Math.round(note.time / song.s16)) < 1e-6);
      if (!i) continue;
      const gap = note.time - chart[i - 1].time;
      assert.ok(gap >= track.minGap - 1e-6 && gap <= song.beat * 2 + 1e-6, `${track.id} gap ${gap}`);
      assert.ok(Math.abs(note.x - chart[i - 1].x) <= Math.min(0.8, track.reach * gap) + 1e-3, `${track.id} jump at ${i}`);
    }
    assert.ok(chart.filter((n) => n.gate).length === song.sections.length);
    assert.ok(chart.at(-1).time < song.duration);
  }
});

test('judgement has a centre window and forgiving edges that scale with tile width', () => {
  assert.equal(judge(PERFECT), 'perfect'); assert.equal(judge(-(TILE_HALF + GRACE)), 'good');
  assert.equal(judge(TILE_HALF + GRACE + 0.001), 'miss'); assert.equal(judge(0.6, 1.5), 'good');
});

test('a flawless run completes with three stars and scores each tile once', () => {
  for (const track of TRACKS) {
    const run = new Run(track); let stars = 0;
    for (const note of run.chart) {
      run.advance(note.time, autoX(run.chart, note.time), (_r, _n, gained) => { if (gained) stars++; });
      run.advance(note.time, 0);
    }
    assert.equal(run.status, 'complete'); assert.equal(run.perfect, run.chart.length); assert.equal(run.stars, 3); assert.equal(stars, 3);
    assert.equal(run.progress, 1); assert.equal(run.multiplier, 5); assert.ok(run.fever);
    let expected = 0; for (let i = 1; i <= run.chart.length; i++) expected += 20 * (1 + Math.min(4, Math.floor(i / 5)));
    assert.equal(run.score, expected);
  }
});

test('edge landings score less and reset the perfect streak', () => {
  const run = new Run(TRACKS[0]);
  run.advance(0, 0); assert.equal(run.streak, 1); assert.equal(run.score, 20);
  run.advance(run.chart[1].time, 0.3); assert.equal(run.good, 1); assert.equal(run.streak, 0); assert.equal(run.score, 30);
});

test('a miss ends the run without consuming the tile; one revive is allowed', () => {
  const run = new Run(TRACKS[0]);
  run.advance(-0.01, 1); assert.equal(run.status, 'playing');
  run.advance(0, 1); assert.equal(run.status, 'failed'); assert.equal(run.score, 0); assert.equal(run.next, 0);
  run.advance(20, 0); assert.equal(run.score, 0);
  const spot = run.revive(); assert.equal(run.status, 'playing'); assert.equal(spot.x, 0); assert.ok(spot.time < 0);
  run.advance(0, spot.x); assert.equal(run.next, 1); assert.equal(run.hopStart, null);
  run.advance(run.chart[1].time, 1); assert.equal(run.status, 'failed'); assert.equal(run.revive(), null);
});

test('skipTo positions the preview and clamp keeps input on stage', () => {
  const run = new Run(TRACKS[2]), drop = run.song.sections.find((s) => s.e >= 1);
  run.skipTo(drop.time); assert.ok(run.chart[run.next].time >= drop.time); assert.ok(run.chart[run.next - 1].time < drop.time);
  assert.equal(clamp(10), 1); assert.equal(clamp(-10), -1);
});
