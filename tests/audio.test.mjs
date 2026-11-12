import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Soundtrack, Synth } from '../src/audio.js';
import { TRACKS, compile } from '../src/songs.js';

// A minimal stand-in for the Web Audio graph: every node accepts any parameter automation.
const param = () => new Proxy({ value: 0 }, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
let created = 0;
const node = () => { created++; return new Proxy({}, { get: (t, k) => (k in t ? t[k] : (['connect', 'disconnect', 'start', 'stop'].includes(k) ? () => {} : (t[k] = param()))), set: (t, k, v) => { t[k] = v; return true; } }); };
class FakeAudio {
  constructor() { this.currentTime = 0; this.state = 'suspended'; this.destination = {}; this.sampleRate = 8000; this.baseLatency = 0.01; }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
}
for (const kind of ['Gain', 'Oscillator', 'BiquadFilter', 'Convolver', 'Delay', 'DynamicsCompressor', 'WaveShaper', 'BufferSource']) FakeAudio.prototype[`create${kind}`] = node;

test('every step of every track schedules without error', () => {
  for (const track of TRACKS) {
    const synth = new Synth(new FakeAudio()), song = compile(track); synth.setTrack(track);
    const before = created;
    for (let step = -16; step < song.steps; step++) synth.playStep(step, step * song.s16 + 10);
    assert.ok(created - before > song.steps, `${track.id} produced voices`);
    for (const kind of ['star', 'win', 'fail']) synth.chime(kind);
  }
});

test('the singer, guitars, keys, brass and percussion all schedule on any context', () => {
  const synth = new Synth(new FakeAudio()), before = created;
  for (const syl of ['oh', 'ah', 'ooh', 'ee', 'ay', 'wo', 'la', 'na', 'da', 'yeah', 'hey', 'whoa']) {
    synth.vocal(syl, 64, 1, 0.5, 1, { female: true }); synth.vocal(syl, 52, 1, 0.1, 1, { female: false, grit: true }); synth.shout(syl, 60, 1, { grit: true });
  }
  synth.vpad([48, 52, 55], 1, 2, {});
  for (const voice of ['epiano', 'piano', 'brass', 'gtr', 'bell', 'pluck', 'super', 'saw', 'cowbell']) synth.lead(voice, 60, 1, 0.4);
  for (const kind of ['synth', 'brass', 'piano', 'epiano', 'clean', 'power', 'chug']) synth.comp(kind, [48, 52, 55], 1, 0.5);
  for (const style of ['round', 'pick', 'slap', 'eighth', 'long', '808']) synth.bass(style, 40, 1, 0.3);
  synth.crash(1); synth.tom(1); synth.tamb(1); synth.snap(1); synth.rim(1); synth.conga(1, 0.3, true); synth.kick(1, 1, true);
  assert.ok(created - before > 200);
});

test('clock: count-in, pause freezes, resume continues from the frozen time, seek rewinds', async () => {
  globalThis.AudioContext = FakeAudio;
  const sound = new Soundtrack(), track = TRACKS[0], beat = compile(track).beat;
  try {
    assert.equal(await sound.start(track), true);
    assert.equal(sound.silent, false); assert.ok(Math.abs(sound.time + beat * 4 + 0.06) < 1e-6);
    sound.ctx.currentTime += 3; const at = sound.time; assert.ok(at > 0);
    await sound.pause(at - 0.5); assert.equal(sound.ctx.state, 'suspended'); assert.equal(sound.time, at - 0.5);
    sound.ctx.currentTime += 9; assert.equal(sound.time, at - 0.5);
    await sound.resume(); assert.equal(sound.ctx.state, 'running'); assert.ok(Math.abs(sound.time - (at - 0.5) + 0.06) < 1e-6);
    await sound.pause(sound.time, { suspend: false }); assert.equal(sound.ctx.state, 'running'); sound.rewind(1); await sound.resume();
    assert.ok(Math.abs(sound.time - 1 + 0.06) < 1e-6);
    const context = sound.ctx; await sound.stop(); assert.equal(context.state, 'suspended');
    await sound.start(track, { at: 20 }); assert.equal(sound.ctx, context, 'context is reused'); assert.ok(sound.time > 19.9);
    sound.setMuted(true); assert.equal(sound.muted, true);
  } finally { await sound.stop(); delete globalThis.AudioContext; }
});

test('a newer start cancels an older one that is still unlocking', async () => {
  globalThis.AudioContext = FakeAudio;
  const sound = new Soundtrack();
  try {
    const first = sound.start(TRACKS[0]), second = sound.start(TRACKS[1]);
    assert.equal(await first, false); assert.equal(await second, true); assert.equal(sound.track, TRACKS[1]);
  } finally { await sound.stop(); delete globalThis.AudioContext; }
});

test('without Web Audio the game runs on a silent clock', async () => {
  const sound = new Soundtrack();
  try {
    assert.equal(await sound.start(TRACKS[0]), true); assert.equal(sound.silent, true); assert.ok(sound.time < 0);
    await sound.pause(2); const frozen = sound.time; await new Promise((r) => setTimeout(r, 15)); assert.equal(sound.time, frozen);
    await sound.resume(); assert.ok(sound.time >= 2 && sound.time < 2.2);
    await sound.start(TRACKS[0], { silent: true, at: 30 }); assert.ok(sound.time >= 30);
  } finally { await sound.stop(); }
});
