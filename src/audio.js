// Web Audio soundtrack. `Synth` turns song steps into sound on any BaseAudioContext
// (live or offline); `Soundtrack` owns the clock the whole game runs on.
import { DRUMS, BASS, compile, chord, degree } from './songs.js';

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const LOOKAHEAD = 0.2, TICK_MS = 25;

// The synthesised singer. Vowel formants in Hz as [F1, F2, F3]; a syllable is an optional consonant onset plus one
// or two vowels the voice glides through. 'x' is the vowel of "yeah". The same voice sings verses, hooks and shouts.
const FORMANTS = { a: [800, 1150, 2900], e: [550, 1800, 2600], i: [310, 2250, 3050], o: [450, 850, 2800], u: [330, 750, 2600], x: [690, 1660, 2490] };
const ONSETS = { l: [360, 1100, 2700], n: [260, 1250, 2500], d: [320, 1700, 2600], y: [300, 2200, 3000], b: [220, 1000, 2300], v: [250, 1300, 2400] };
const SYLLABLES = {
  oh: { v: 'o' }, ah: { v: 'a' }, ooh: { v: 'u' }, ee: { v: 'i' }, ay: { v: 'ei' }, wo: { v: 'uo' },
  la: { v: 'a', on: 'l' }, na: { v: 'a', on: 'n' }, da: { v: 'a', on: 'd' },
  yeah: { v: 'ix', on: 'y' }, hey: { v: 'ei', on: 'h' }, whoa: { v: 'uo', on: 'h' },
  aa: { v: 'a' }, yo: { v: 'o', on: 'y' }, oi: { v: 'oi' }, oye: { v: 'oe' }, hoi: { v: 'oi', on: 'h' }, ho: { v: 'o', on: 'h' },
  ba: { v: 'a', on: 'b' }, le: { v: 'e', on: 'l' }, ni: { v: 'i', on: 'n' }, ve: { v: 'e', on: 'v' }, ja: { v: 'a', on: 'd' },
};
const FILL = { 10: 190, 12: 160, 13: 160, 14: 125, 15: 100 }; // tom fill on the last bar of a section: step -> pitch

export class Synth {
  constructor(ctx, destination = ctx.destination) {
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.18;
    this.master = ctx.createGain(); this.master.gain.value = 0.8;
    comp.connect(this.master); this.master.connect(destination);
    this.mix = comp;
    // Shared effects: a generated plate-style reverb and a dotted-eighth echo.
    this.reverb = ctx.createConvolver(); this.reverb.buffer = this.impulse(2.4);
    const wet = ctx.createGain(); wet.gain.value = 0.55; this.reverb.connect(wet); wet.connect(comp);
    this.delay = ctx.createDelay(1.5); this.feedback = ctx.createGain(); this.feedback.gain.value = 0.34;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3200;
    this.delay.connect(tone); tone.connect(this.feedback); this.feedback.connect(this.delay);
    const echo = ctx.createGain(); echo.gain.value = 0.5; this.delay.connect(echo); echo.connect(comp);
    this.noise = this.noiseBuffer(2);
    this.drive = this.curve(2.6); this.grit = this.curve(1.5); this.edge = this.curve(5); this.crunch = this.curve(9);
    this.open();
  }
  impulse(seconds) {
    const { ctx } = this, length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) { const t = i / length; data[i] = (Math.random() * 2 - 1) * (1 - t) ** 3.2 * (i < 400 ? i / 400 : 1); }
    }
    return buffer;
  }
  noiseBuffer(seconds) {
    const { ctx } = this, length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }
  curve(amount) {
    const curve = new Float32Array(257);
    for (let i = 0; i < 257; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * amount); }
    return curve;
  }
  /** Voices play into a disposable bus so a seek or pause can silence them at once. */
  open() {
    const { ctx } = this;
    this.bus = { drums: ctx.createGain(), music: ctx.createGain(), rev: ctx.createGain(), dly: ctx.createGain() };
    this.bus.drums.connect(this.mix); this.bus.music.connect(this.mix);
    this.bus.rev.connect(this.reverb); this.bus.dly.connect(this.delay);
  }
  cut() { for (const node of Object.values(this.bus)) { try { node.disconnect(); } catch { /* already gone */ } } this.open(); }
  setTrack(track) { this.track = track; this.song = compile(track); this.delay.delayTime.value = Math.min(1.4, this.song.s16 * 3); }

  // --- building blocks ---
  out(node, send = {}) {
    node.connect(send.drum ? this.bus.drums : this.bus.music);
    if (send.rev) { const g = this.ctx.createGain(); g.gain.value = send.rev; node.connect(g); g.connect(this.bus.rev); }
    if (send.dly) { const g = this.ctx.createGain(); g.gain.value = send.dly; node.connect(g); g.connect(this.bus.dly); }
  }
  osc(type, freq, at, stop, dest, detune = 0) {
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = detune;
    o.connect(dest); o.start(at); o.stop(stop); return o;
  }
  amp(at, attack, peak, hold, release) {
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak, at + attack);
    g.gain.setValueAtTime(peak, at + Math.max(attack, hold));
    g.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(attack, hold) + release);
    return g;
  }
  pluckAmp(at, peak, decay) {
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    return g;
  }
  filter(type, freq, q = 0.7) { const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; }
  burst(at, duration, dest, offset = 0) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noise; src.connect(dest);
    src.start(at, offset % 1.5, duration + 0.05); return src;
  }

  // --- drums ---
  kick(at, vol = 1, acoustic = false) {
    const decay = acoustic ? 0.24 : 0.34, g = this.ctx.createGain(); g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    const o = this.osc('sine', 150, at, at + decay + 0.02, g);
    o.frequency.setValueAtTime(acoustic ? 118 : 165, at); o.frequency.exponentialRampToValueAtTime(acoustic ? 54 : 46, at + (acoustic ? 0.07 : 0.11));
    const click = this.pluckAmp(at, (acoustic ? 0.5 : 0.25) * vol, 0.02), hp = this.filter('highpass', acoustic ? 3200 : 2500);
    this.burst(at, 0.03, hp); hp.connect(click); click.connect(this.bus.drums);
    this.out(g, { drum: 1 });
  }
  snare(at, vol = 0.5, big = false) {
    const g = this.pluckAmp(at, vol, big ? 0.3 : 0.17), bp = this.filter('bandpass', 1900, 0.6);
    this.burst(at, 0.35, bp, 0.3); bp.connect(g);
    const body = this.pluckAmp(at, vol * 0.7, 0.09), o = this.osc('triangle', 200, at, at + 0.12, body);
    o.frequency.exponentialRampToValueAtTime(140, at + 0.09);
    this.out(g, { drum: 1, rev: big ? 0.5 : 0.18 }); this.out(body, { drum: 1 });
  }
  clap(at, vol = 0.45) {
    const g = this.ctx.createGain(), bp = this.filter('bandpass', 1300, 0.9);
    g.gain.setValueAtTime(0.0001, at);
    for (const d of [0, 0.011, 0.023]) { g.gain.setValueAtTime(vol, at + d); g.gain.exponentialRampToValueAtTime(vol * 0.2, at + d + 0.009); }
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    this.burst(at, 0.25, bp, 0.7); bp.connect(g); this.out(g, { drum: 1, rev: 0.3 });
  }
  hat(at, vol = 0.16, open = false) {
    const g = this.pluckAmp(at, vol, open ? 0.24 : 0.045), hp = this.filter('highpass', open ? 7000 : 8500);
    this.burst(at, open ? 0.26 : 0.06, hp, (at * 7.3) % 1); hp.connect(g); this.out(g, { drum: 1 });
  }
  riser(at, duration) {
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.22, at + duration); g.gain.linearRampToValueAtTime(0.0001, at + duration + 0.04);
    const bp = this.filter('bandpass', 400, 1.4); bp.frequency.setValueAtTime(400, at); bp.frequency.exponentialRampToValueAtTime(9000, at + duration);
    const src = this.ctx.createBufferSource(); src.buffer = this.noise; src.loop = true; src.connect(bp); bp.connect(g);
    src.start(at); src.stop(at + duration + 0.06); this.out(g, { rev: 0.4 });
  }
  impact(at) {
    const g = this.pluckAmp(at, 0.3, 1.6), lp = this.filter('lowpass', 6000);
    lp.frequency.setValueAtTime(9000, at); lp.frequency.exponentialRampToValueAtTime(600, at + 1.4);
    this.burst(at, 1.6, lp, 0.1); lp.connect(g); this.out(g, { drum: 1, rev: 0.7 });
    const boom = this.pluckAmp(at, 0.7, 0.9), o = this.osc('sine', 80, at, at + 1, boom);
    o.frequency.exponentialRampToValueAtTime(36, at + 0.5); this.out(boom, { drum: 1 });
  }

  // --- rock and pop percussion ---
  crash(at, vol = 0.5) {
    const g = this.pluckAmp(at, vol * 0.55, 1.5), hp = this.filter('highpass', 4200);
    this.burst(at, 1.5, hp, (at * 3.7) % 0.4); hp.connect(g); this.out(g, { drum: 1, rev: 0.35 });
  }
  tom(at, vol = 0.5, pitch = 120) {
    const g = this.pluckAmp(at, vol, 0.3), o = this.osc('sine', pitch * 1.7, at, at + 0.32, g);
    o.frequency.exponentialRampToValueAtTime(pitch, at + 0.1);
    const click = this.pluckAmp(at, vol * 0.3, 0.02), hp = this.filter('highpass', 2200);
    this.burst(at, 0.03, hp, (at * 5.1) % 1); hp.connect(click); this.out(g, { drum: 1, rev: 0.15 }); this.out(click, { drum: 1 });
  }
  tamb(at, vol = 0.1) {
    const g = this.pluckAmp(at, vol, 0.07), bp = this.filter('bandpass', 8500, 1.2);
    this.burst(at, 0.09, bp, (at * 11.3) % 1); bp.connect(g); this.out(g, { drum: 1, rev: 0.1 });
  }
  snap(at, vol = 0.32) {
    const g = this.pluckAmp(at, vol, 0.07), bp = this.filter('bandpass', 2400, 2.5);
    this.burst(at, 0.09, bp, (at * 6.7) % 1); bp.connect(g);
    const pop = this.pluckAmp(at, vol * 0.5, 0.035), o = this.osc('sine', 1900, at, at + 0.05, pop); o.frequency.exponentialRampToValueAtTime(950, at + 0.03);
    this.out(g, { drum: 1, rev: 0.25 }); this.out(pop, { drum: 1 });
  }
  rim(at, vol = 0.28) {
    const g = this.pluckAmp(at, vol, 0.04), o = this.osc('sine', 1650, at, at + 0.05, g); o.frequency.exponentialRampToValueAtTime(1300, at + 0.03);
    const tick = this.pluckAmp(at, vol * 0.5, 0.02), bp = this.filter('bandpass', 3000, 1.5);
    this.burst(at, 0.03, bp, (at * 9.1) % 1); bp.connect(tick); this.out(g, { drum: 1 }); this.out(tick, { drum: 1 });
  }
  conga(at, vol = 0.3, high = false) {
    const [from, to] = high ? [340, 280] : [225, 175], g = this.pluckAmp(at, vol, 0.2), o = this.osc('sine', from, at, at + 0.22, g);
    o.frequency.exponentialRampToValueAtTime(to, at + 0.06);
    const slap = this.pluckAmp(at, vol * 0.3, 0.02), bp = this.filter('bandpass', 1800, 1);
    this.burst(at, 0.03, bp, (at * 4.3) % 1); bp.connect(slap); this.out(g, { drum: 1, rev: 0.12 }); this.out(slap, { drum: 1 });
  }
  /** Dhol: the bass head ('dha', deep and round) or the treble head ('tin', sharp stick crack). */
  dhol(at, vol = 0.8, treble = false) {
    if (!treble) {
      const g = this.pluckAmp(at, 0.9 * vol, 0.32), o = this.osc('sine', 125, at, at + 0.34, g); o.frequency.exponentialRampToValueAtTime(70, at + 0.14);
      const skin = this.pluckAmp(at, 0.35 * vol, 0.05), bp = this.filter('bandpass', 900, 1); this.burst(at, 0.06, bp, (at * 7.7) % 1); bp.connect(skin);
      this.out(g, { drum: 1, rev: 0.12 }); this.out(skin, { drum: 1 }); return;
    }
    const g = this.pluckAmp(at, 0.5 * vol, 0.09), o = this.osc('sine', 420, at, at + 0.1, g); o.frequency.exponentialRampToValueAtTime(300, at + 0.05);
    const tick = this.pluckAmp(at, 0.5 * vol, 0.05), bp = this.filter('bandpass', 3500, 1); this.burst(at, 0.06, bp, (at * 5.9) % 1); bp.connect(tick);
    this.out(g, { drum: 1, rev: 0.1 }); this.out(tick, { drum: 1 });
  }

  // --- pitched instruments ---
  lead(voice, midi, at, dur, vol = 1, thick = false) {
    const f = hz(midi), ctx = this.ctx;
    if (voice === 'epiano') return this.epiano(f, at, dur, vol);
    if (voice === 'piano') return this.piano(f, at, vol, Math.max(0.6, dur * 1.2));
    if (voice === 'brass') return this.brass(f, at, dur, vol);
    if (voice === 'gtr') return this.leadGuitar(f, at, dur, vol);
    if (voice === 'tumbi') return this.tumbi(f, at, dur, vol);
    if (voice === 'bell') {
      const g = this.pluckAmp(at, 0.2 * vol, Math.max(0.5, dur * 1.6)), end = at + Math.max(0.5, dur * 1.6) + 0.05;
      const carrier = this.osc('sine', f, at, end, g), index = ctx.createGain();
      index.gain.setValueAtTime(f * 2.2, at); index.gain.exponentialRampToValueAtTime(f * 0.05, at + 0.35);
      this.osc('sine', f * 3.01, at, end, index); index.connect(carrier.frequency);
      this.osc('sine', f * 2, at, end, g).detune.value = 4;
      return this.out(g, { rev: 0.45, dly: 0.3 });
    }
    if (voice === 'cowbell') {
      const decay = Math.min(0.42, Math.max(0.2, dur * 1.2)), g = this.pluckAmp(at, 0.42 * vol, decay), bp = this.filter('bandpass', f * 2, 2.2);
      this.osc('square', f, at, at + decay + 0.05, bp); this.osc('square', f * 1.504, at, at + decay + 0.05, bp);
      const shaper = ctx.createWaveShaper(); shaper.curve = this.drive; bp.connect(shaper); shaper.connect(g);
      if (thick) this.osc('square', f / 2, at, at + decay + 0.05, bp);
      return this.out(g, { rev: 0.22, dly: 0.12 });
    }
    if (voice === 'pluck') {
      const g = this.pluckAmp(at, 0.2 * vol, 0.32), lp = this.filter('lowpass', 5000, 3);
      lp.frequency.setValueAtTime(Math.min(9000, f * 7), at); lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.2), at + 0.22);
      this.osc('sawtooth', f, at, at + 0.4, lp, -7); this.osc('sawtooth', f, at, at + 0.4, lp, 7); this.osc('square', f / 2, at, at + 0.4, lp);
      lp.connect(g); return this.out(g, { rev: 0.3, dly: 0.34 });
    }
    // 'saw' and 'super': detuned saw stack through a moving low-pass.
    const hold = Math.max(0.08, dur * 0.92), end = at + hold + 0.22, sup = voice === 'super';
    const g = this.amp(at, 0.012, (sup ? 0.11 : 0.14) * vol, hold, 0.18), lp = this.filter('lowpass', 3000, sup ? 0.8 : 2);
    lp.frequency.setValueAtTime(900, at); lp.frequency.linearRampToValueAtTime(sup ? 7500 : 5200, at + 0.03); lp.frequency.exponentialRampToValueAtTime(sup ? 3400 : 2100, at + hold + 0.1);
    for (const cents of sup ? [-19, -7, 7, 19] : [-9, 9]) this.osc('sawtooth', f, at, end, lp, cents);
    if (sup) { const top = ctx.createGain(); top.gain.value = 0.4; top.connect(lp); this.osc('sawtooth', f * 2, at, end, top, 5); }
    const sub = ctx.createGain(); sub.gain.value = thick ? 0.8 : 0.35; sub.connect(lp); this.osc(thick ? 'sawtooth' : 'square', f / 2, at, end, sub, thick ? -5 : 0);
    lp.connect(g); this.out(g, { rev: 0.3, dly: 0.26 });
  }
  // --- keys, brass and guitars (pop and rock) ---
  epiano(f, at, dur, vol = 1) {
    const decay = Math.max(0.7, dur * 1.5), end = at + decay + 0.05, g = this.pluckAmp(at, 0.2 * vol, decay), mod = this.ctx.createGain();
    const carrier = this.osc('sine', f, at, end, g);
    mod.gain.setValueAtTime(f * 1.4, at); mod.gain.exponentialRampToValueAtTime(f * 0.12, at + 0.5);
    this.osc('sine', f, at, end, mod); mod.connect(carrier.frequency);
    const tine = this.ctx.createGain(); tine.gain.setValueAtTime(0.5, at); tine.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
    this.osc('sine', f * 7, at, at + 0.15, tine); tine.connect(g);
    this.out(g, { rev: 0.35, dly: 0.14 });
  }
  piano(f, at, vol = 1, decay = 0.9) {
    const end = at + decay + 0.05, g = this.pluckAmp(at, 0.17 * vol, decay), lp = this.filter('lowpass', 4200, 0.7);
    lp.frequency.setValueAtTime(Math.min(8000, f * 9), at); lp.frequency.exponentialRampToValueAtTime(Math.max(500, f * 2), at + decay * 0.7);
    this.osc('triangle', f, at, end, lp); this.osc('sine', f * 2, at, end, lp, 3);
    const hammer = this.ctx.createGain(); hammer.gain.value = 0.35; hammer.connect(lp); this.osc('sawtooth', f, at, at + 0.12, hammer);
    lp.connect(g); this.out(g, { rev: 0.3, dly: 0.1 });
  }
  brass(f, at, dur, vol = 1) {
    const hold = Math.max(0.1, dur * 0.85), end = at + hold + 0.16, g = this.amp(at, 0.025, 0.12 * vol, hold, 0.12), lp = this.filter('lowpass', 2600, 1.1);
    lp.frequency.setValueAtTime(600, at); lp.frequency.linearRampToValueAtTime(3600, at + 0.07); lp.frequency.exponentialRampToValueAtTime(1800, at + hold + 0.1);
    this.osc('sawtooth', f, at, end, lp, -6); this.osc('sawtooth', f, at, end, lp, 6);
    lp.connect(g); this.out(g, { rev: 0.22, dly: 0.12 });
  }
  /** Vibrato that grows in after the note starts, applied to every oscillator of a voice. */
  vibrato(oscs, f, at, hold, depth = 0.011) {
    if (hold < 0.22) return;
    const amount = this.ctx.createGain(); amount.gain.setValueAtTime(0, at); amount.gain.linearRampToValueAtTime(f * depth, at + Math.min(0.35, hold * 0.8));
    this.osc('sine', 5.4, at, at + hold + 0.3, amount); for (const o of oscs) amount.connect(o.frequency);
  }
  /** Distorted lead guitar: scoops up to the note, then sings with vibrato. */
  leadGuitar(f, at, dur, vol = 1) {
    const hold = Math.max(0.1, dur * 0.95), end = at + hold + 0.2, g = this.amp(at, 0.01, 0.15 * vol, hold, 0.16);
    const shaper = this.ctx.createWaveShaper(); shaper.curve = this.edge; const lp = this.filter('lowpass', 4600, 0.9);
    const oscs = [this.osc('sawtooth', f, at, end, shaper, -5), this.osc('square', f, at, end, shaper, 5)];
    for (const o of oscs) { o.frequency.setValueAtTime(f * 0.95, at); o.frequency.exponentialRampToValueAtTime(f, at + 0.06); }
    this.vibrato(oscs, f, at, hold, 0.01);
    shaper.connect(lp); lp.connect(g); this.out(g, { rev: 0.25, dly: 0.22 });
  }
  /** Tumbi: a one-string folk instrument, a bright twangy pluck with a quick scoop and a buzz of string noise. */
  tumbi(f, at, dur, vol = 1) {
    const decay = Math.max(0.22, Math.min(dur * 1.1, 0.55)), end = at + decay + 0.05, g = this.pluckAmp(at, 0.17 * vol, decay), lp = this.filter('lowpass', 4000, 2.5);
    lp.frequency.setValueAtTime(Math.min(9000, f * 12), at); lp.frequency.exponentialRampToValueAtTime(Math.max(900, f * 3), at + 0.25);
    const a = this.osc('sawtooth', f, at, end, lp), b = this.ctx.createGain(); b.gain.value = 0.5; b.connect(lp); const c = this.osc('square', f * 1.004, at, end, b);
    for (const o of [a, c]) { o.frequency.setValueAtTime(f * 0.96, at); o.frequency.exponentialRampToValueAtTime(f, at + 0.03); }
    const buzz = this.pluckAmp(at, 0.2 * vol, 0.04), hp = this.filter('highpass', 3000); this.burst(at, 0.05, hp, (at * 8.3) % 1); hp.connect(buzz);
    lp.connect(g); this.out(g, { rev: 0.22, dly: 0.12 }); this.out(buzz, { rev: 0.1 });
  }
  /** Harmonium: reedy sustained chords. */
  harmonium(tones, at, dur, vol = 1) {
    const hold = Math.max(0.2, dur * 0.95), end = at + hold + 0.25, g = this.amp(at, 0.04, 0.05 * vol, hold, 0.2), lp = this.filter('lowpass', 2600, 0.8);
    for (const m of tones) { const f = hz(m); this.osc('sawtooth', f, at, end, lp, -8); this.osc('sawtooth', f, at, end, lp, 8); this.osc('square', f * 2, at, end, lp); }
    lp.connect(g); this.out(g, { rev: 0.3 });
  }
  /** A power chord (root, fifth, octave). 'chug' is palm-muted and short; 'power' rings for the length of the hit. */
  guitar(kind, root, at, dur, vol = 1) {
    const mute = kind === 'chug', f = hz(root), hold = mute ? 0.08 : Math.max(0.1, dur * 0.95), end = at + hold + (mute ? 0.07 : 0.14);
    const shaper = this.ctx.createWaveShaper(); shaper.curve = this.crunch;
    const hp = this.filter('highpass', 90), cab = this.filter('lowpass', mute ? 2000 : 3500, 0.8);
    const g = mute ? this.pluckAmp(at, 0.15 * vol, 0.11) : this.amp(at, 0.006, 0.14 * vol, hold, 0.12);
    for (const [freq, cents] of [[f, -7], [f, 7], [f * 1.4983, 0], [f * 2, 3]]) this.osc('sawtooth', freq, at, end, hp, cents);
    hp.connect(shaper); shaper.connect(cab); cab.connect(g); this.out(g, { rev: mute ? 0.05 : 0.14 });
  }
  /** One clean plucked string. */
  pick(f, at, vol = 1) {
    const g = this.pluckAmp(at, 0.07 * vol, 0.5), lp = this.filter('lowpass', 3000, 1.5);
    lp.frequency.setValueAtTime(Math.min(9000, f * 10), at); lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 1.6), at + 0.25);
    this.osc('triangle', f, at, at + 0.55, lp); this.osc('sawtooth', f, at, at + 0.55, lp, 4);
    lp.connect(g); this.out(g, { rev: 0.2, dly: 0.12 });
  }
  /** Rhythm instrument for a section: stabs, keys or guitar chords on the chord of the bar. */
  comp(kind, tones, at, dur, vol = 1) {
    if (kind === 'power' || kind === 'chug') return this.guitar(kind, tones[0], at, dur, vol);
    if (kind === 'tumbi') { this.tumbi(hz(tones[2] + 12), at, dur, 0.75 * vol); return; }
    if (kind === 'harmonium') return this.harmonium(tones, at, dur, vol);
    if (kind === 'clean') { [...tones, tones[0] + 12].forEach((m, i) => this.pick(hz(m), at + i * 0.011, vol)); return; }
    if (kind === 'piano') { for (const m of tones) this.piano(hz(m), at, 0.7 * vol, Math.max(0.5, dur * 1.1)); return; }
    if (kind === 'epiano') { for (const m of tones) this.epiano(hz(m), at, dur, 0.7 * vol); return; }
    if (kind === 'brass') { for (const m of tones) this.brass(hz(m), at, dur * 0.7, 0.55 * vol); return; }
    const decay = Math.max(0.16, Math.min(0.45, dur)), g = this.pluckAmp(at, 0.06 * vol, decay), lp = this.filter('lowpass', 3600, 1.2);
    lp.frequency.setValueAtTime(5400, at); lp.frequency.exponentialRampToValueAtTime(1000, at + 0.2);
    for (const m of tones) for (const cents of [-6, 6]) this.osc('sawtooth', hz(m), at, at + decay + 0.05, lp, cents);
    lp.connect(g); this.out(g, { rev: 0.18, dly: 0.1 });
  }

  // --- the singer ---
  /**
   * Sings one syllable. A sawtooth "glottis" with scoop and vibrato goes through three formant filters; the
   * formants glide from a consonant onset to the vowel (and on to a second vowel for diphthongs like "hey").
   * Options: female (formants up), grit (rock edge), voices (stacked for crowds), shout (hard attack).
   */
  vocal(syl, midi, at, dur, vol = 1, o = {}) {
    const ctx = this.ctx, def = SYLLABLES[syl] || SYLLABLES.oh, f = hz(midi), k = o.female === false ? 0.93 : 1.1;
    const hold = Math.max(0.09, dur * 0.94), end = at + hold + 0.2, path = [...def.v].map((c) => FORMANTS[c]), onset = def.on ? ONSETS[def.on] : null;
    const g = this.amp(at, o.shout ? 0.006 : 0.02, 0.5 * vol * (o.level ?? 1), hold, o.shout ? 0.08 : 0.14);
    const input = ctx.createGain(), sum = ctx.createGain();
    [0, 1, 2].forEach((i) => {
      const bp = this.filter('bandpass', path[0][i] * k, [4.5, 6, 8][i]), target = path[0][i] * k, gain = ctx.createGain();
      if (onset) { bp.frequency.setValueAtTime(onset[i] * k, at); bp.frequency.linearRampToValueAtTime(target, at + 0.06); }
      if (path.length > 1) { const t1 = at + Math.max(0.07, hold * 0.4); bp.frequency.setValueAtTime(target, t1); bp.frequency.linearRampToValueAtTime(path[1][i] * k, t1 + Math.min(0.14, hold * 0.5)); }
      gain.gain.value = [1, 0.7, 0.35][i]; input.connect(bp); bp.connect(gain); gain.connect(sum);
    });
    const sources = (o.voices > 1 ? [-11, 0, 11] : [0]).map((cents) => this.osc('sawtooth', f, at, end, input, cents));
    for (const src of sources) { src.frequency.setValueAtTime(f * 0.975, at); src.frequency.exponentialRampToValueAtTime(f, at + 0.05); }
    if (!o.shout) this.vibrato(sources, f, at, hold, 0.011);
    // breath: a steady whisper, and a burst of air at the start of "h" sounds
    const air = ctx.createGain(); air.connect(input);
    if (def.on === 'h') { air.gain.setValueAtTime(0.9, at); air.gain.exponentialRampToValueAtTime(0.06, at + 0.09); } else air.gain.value = 0.05;
    this.burst(at, hold + 0.1, air, (at * 2.9) % 1);
    if (o.grit) { const shaper = ctx.createWaveShaper(); shaper.curve = this.grit; sum.connect(shaper); shaper.connect(g); } else sum.connect(g);
    this.out(g, { rev: o.rev ?? 0.32, dly: o.dly ?? 0.16 });
  }
  /** Backing "ooh / aah": the chord sung in three parts for a whole bar. */
  vpad(notes, at, dur, o = {}) { notes.forEach((m, i) => this.vocal(i % 2 ? 'ooh' : 'ah', m + 12, at, dur, 0.55, { ...o, level: 0.8 * (o.level ?? 1), rev: 0.45 })); }
  /** The crowd: a short stacked shout. */
  shout(syl, midi, at, o = {}) { this.vocal(syl, midi, at, 0.16, 1.1, { ...o, voices: 3, shout: true, rev: 0.4 }); }

  pad(notes, at, dur, bright) {
    const g = this.amp(at, bright ? 0.03 : 0.25, bright ? 0.05 : 0.04, dur * 0.96, 0.35), lp = this.filter('lowpass', bright ? 3600 : 1100, 0.6);
    if (bright) { lp.frequency.setValueAtTime(5200, at); lp.frequency.exponentialRampToValueAtTime(2000, at + dur); }
    for (const midi of notes) for (const cents of [-8, 8]) this.osc('sawtooth', hz(midi), at, at + dur + 0.4, lp, cents);
    lp.connect(g); this.out(g, { rev: 0.4 });
  }
  arp(midi, at, vol = 1) {
    const f = hz(midi), g = this.pluckAmp(at, 0.07 * vol, 0.16), lp = this.filter('lowpass', 2400, 4);
    lp.frequency.setValueAtTime(Math.min(8000, f * 6), at); lp.frequency.exponentialRampToValueAtTime(Math.max(400, f), at + 0.12);
    this.osc('square', f, at, at + 0.2, lp); this.osc('sawtooth', f, at, at + 0.2, lp, 6);
    lp.connect(g); this.out(g, { rev: 0.25, dly: 0.4 });
  }
  bass(style, midi, at, dur, vol = 1) {
    const f = hz(midi);
    if (style === '808') {
      const g = this.amp(at, 0.006, 0.42 * vol, dur * 0.5, dur * 0.7), shaper = this.ctx.createWaveShaper(); shaper.curve = this.drive;
      const o = this.osc('sine', f, at, at + dur * 1.3 + 0.1, shaper); o.frequency.setValueAtTime(f * 1.6, at); o.frequency.exponentialRampToValueAtTime(f, at + 0.05);
      shaper.connect(g); return this.out(g);
    }
    if (style === 'long') {
      const g = this.amp(at, 0.03, 0.25 * vol, dur * 0.9, 0.2), lp = this.filter('lowpass', 420, 1);
      this.osc('sine', f, at, at + dur + 0.25, g); this.osc('sawtooth', f, at, at + dur + 0.25, lp, 4); lp.connect(g); return this.out(g);
    }
    if (style === 'reese') {
      const g = this.amp(at, 0.015, 0.24 * vol, dur * 0.95, 0.1), lp = this.filter('lowpass', 650, 3);
      lp.frequency.setValueAtTime(380, at); lp.frequency.linearRampToValueAtTime(900, at + dur * 0.9);
      for (const cents of [-16, 0, 16]) this.osc('sawtooth', f, at, at + dur + 0.2, lp, cents);
      const sub = this.ctx.createGain(); sub.gain.value = 0.5; sub.connect(g); this.osc('sine', f, at, at + dur + 0.2, sub); lp.connect(g); return this.out(g);
    }
    if (style === 'wub') {
      const g = this.amp(at, 0.01, 0.26 * vol, dur * 0.95, 0.08), lp = this.filter('lowpass', 420, 6), depth = this.ctx.createGain(); depth.gain.value = 380;
      this.osc('sine', 5.5, at, at + dur + 0.2, depth); depth.connect(lp.frequency);
      this.osc('sawtooth', f, at, at + dur + 0.2, lp); this.osc('square', f, at, at + dur + 0.2, lp, 7);
      const sub = this.ctx.createGain(); sub.gain.value = 0.5; sub.connect(g); this.osc('sine', f, at, at + dur + 0.2, sub); lp.connect(g); return this.out(g);
    }
    if (style === 'sub') {
      const g = this.amp(at, 0.01, 0.38 * vol, dur * 0.9, 0.08), tri = this.ctx.createGain(); tri.gain.value = 0.18; tri.connect(g);
      this.osc('sine', f, at, at + dur + 0.2, g); this.osc('triangle', f * 2, at, at + dur + 0.2, tri); return this.out(g);
    }
    if (style === 'round') {
      const g = this.amp(at, 0.01, 0.3 * vol, dur * 0.8, 0.1), lp = this.filter('lowpass', 520, 1);
      this.osc('triangle', f, at, at + dur + 0.2, lp); this.osc('sine', f, at, at + dur + 0.2, g); lp.connect(g); return this.out(g);
    }
    if (style === 'pick') {
      const g = this.amp(at, 0.004, 0.26 * vol, dur * 0.6, 0.07), lp = this.filter('lowpass', 1100, 3);
      lp.frequency.setValueAtTime(2400, at); lp.frequency.exponentialRampToValueAtTime(500, at + 0.12);
      this.osc('sawtooth', f, at, at + dur + 0.1, lp); this.osc('square', f, at, at + dur + 0.1, lp, -4);
      const sub = this.ctx.createGain(); sub.gain.value = 0.5; sub.connect(g); this.osc('sine', f, at, at + dur + 0.1, sub); lp.connect(g); return this.out(g);
    }
    if (style === 'slap') {
      const g = this.pluckAmp(at, 0.3 * vol, Math.min(dur * 1.2, 0.22)), lp = this.filter('lowpass', 2800, 2);
      lp.frequency.setValueAtTime(2800, at); lp.frequency.exponentialRampToValueAtTime(400, at + 0.1);
      this.osc('sawtooth', f, at, at + 0.3, lp); const pop = this.ctx.createGain(); pop.gain.value = 0.3; pop.connect(lp); this.osc('square', f * 2, at, at + 0.15, pop);
      lp.connect(g); return this.out(g);
    }
    const g = this.amp(at, 0.005, 0.21 * vol, dur * 0.7, 0.08), lp = this.filter('lowpass', 700, 5);
    lp.frequency.setValueAtTime(1500, at); lp.frequency.exponentialRampToValueAtTime(260, at + Math.min(0.2, dur));
    this.osc('sawtooth', f, at, at + dur + 0.1, lp); this.osc('square', f, at, at + dur + 0.1, lp, -8);
    const sub = this.ctx.createGain(); sub.gain.value = 0.7; sub.connect(g); this.osc('sine', f, at, at + dur + 0.1, sub);
    lp.connect(g); this.out(g);
  }

  /** Schedules everything that starts on one sixteenth-note step. Negative steps are the count-in. */
  playStep(step, at) {
    const { track, song } = this, s16 = song.s16;
    if (step < 0) { if (((step % 4) + 4) % 4 === 0) this.hat(at, 0.2, step === -4); return; }
    if (step >= song.steps) return;
    const bar = Math.floor(step / 16), s = step % 16, sec = song.barSection[bar], rel = bar - sec.start, kit = DRUMS[sec.drums] || {};
    const tones = chord(track, bar), final = bar === song.bars - 1, vox = { female: track.female !== false, grit: !!track.grit, level: track.voxGain ?? 1 };
    if (final) {
      if (s === 0) {
        this.pad(tones, at, s16 * 16, false); this.kick(at, 0.9, track.acoustic);
        if (sec.crash) { this.crash(at, 0.6); this.guitar('power', tones[0], at, s16 * 14, 1.1); }
      }
      return;
    }
    if (rel === 0 && s === 0) { if (sec.impact) this.impact(at); if (sec.crash) this.crash(at, 0.55); }
    if (sec.riser && s === 0 && rel === Math.max(0, sec.bars - 2)) this.riser(at, (sec.bars - rel) * 16 * s16);
    // drums
    if (kit.k?.[s] === 'x') {
      this.kick(at, 0.55 + 0.3 * sec.e, track.acoustic);
      if (sec.duck) { const g = this.bus.music.gain; g.setValueAtTime(0.32, at); g.linearRampToValueAtTime(1, at + Math.min(0.26, s16 * 3.2)); }
    }
    if (kit.s?.[s] === 'x') this.snare(at, 0.5, track.lead === 'saw' || track.bigSnare);
    if (kit.c?.[s] === 'x') this.clap(at);
    if (kit.h && kit.h[s] !== '.') this.hat(at, kit.h[s] === 'x' ? 0.15 : 0.07);
    if (kit.o?.[s] === 'x') this.hat(at, 0.13, true);
    if (kit.t && kit.t[s] !== '.') this.tamb(at, kit.t[s] === 'x' ? 0.1 : 0.05);
    if (kit.n?.[s] === 'x') this.snap(at);
    if (kit.r?.[s] === 'x') this.rim(at);
    if (kit.g && kit.g[s] !== '.') this.conga(at, 0.3, kit.g[s] === 'o');
    if (kit.b?.[s] === 'x') this.lead('cowbell', 76, at, 0.1, 0.6);
    if (kit.d?.[s] === 'x') this.dhol(at, 0.85);
    if (kit.e?.[s] === 'x') this.dhol(at, 0.6, true);
    if (kit.roll) {
      const left = sec.bars - rel, every = left > 2 ? 4 : left > 1 ? 2 : s < 8 ? 2 : 1;
      if (s % every === 0) this.snare(at, 0.16 + 0.34 * ((rel * 16 + s) / (sec.bars * 16)));
    }
    if (sec.fill && rel === sec.bars - 1 && FILL[s]) this.tom(at, 0.5, FILL[s]);
    // harmony
    if (sec.pad && s === 0) this.pad(tones, at, s16 * 16, sec.pad === 2);
    if (sec.arp) {
      const fast = track.bpm >= 120 && sec.e >= 0.7;
      if (fast || s % 2 === 0) { const i = fast ? s : s / 2, order = [0, 1, 2, 1, 2, 3, 2, 1]; const k = order[i % 8]; this.arp(tones[k % tones.length] + 12 * (1 + Math.floor(k / tones.length)), at, sec.e >= 0.7 ? 0.8 : 1); }
    }
    if (sec.comp?.pat?.[s] === 'x') {
      let n = 1; while (n < 16 && sec.comp.pat[(s + n) % 16] !== 'x') n++;
      this.comp(sec.comp.kind, tones, at, s16 * n, (s % 4 === 0 ? 1 : 0.85) * (0.7 + 0.3 * sec.e));
    }
    if (sec.harm && s === 0) this.vpad(tones, at, s16 * 16, vox);
    if (sec.gang?.[s] === 'x') { const list = track.syl?.g || ['hey']; this.shout(list[(bar * 4 + (s >> 2)) % list.length], track.root + 12, at, vox); }
    if (sec.bass) {
      const style = track.bass, line = BASS[style];
      let root = degree(track, track.prog[bar % track.prog.length]); while (root > (line?.cap ?? 45)) root -= 12;
      if (line) { if (line.p[s] === 'x') this.bass(line.t, root + (line.up?.[s] === 'x' ? 12 : 0), at, s16 * line.len); }
      else if (style === 'eighth' && s % 2 === 0) this.bass(style, root + (s === 14 ? 12 : 0), at, s16 * 2);
      else if (style === 'off' && s % 4 === 2) this.bass(style, root, at, s16 * 2);
      else if (style === 'roll' && s % 4 !== 0) this.bass(style, root, at, s16, 0.85);
      else if (style === 'long' && (s === 0 || s === 10)) this.bass(style, root, at, s16 * (s ? 6 : 10));
      else if (style === '808' && kit.k?.[s] === 'x') this.bass(style, root, at, s16 * 5);
    }
    // melody: sung by the track's singer, or played by an instrument, optionally doubled
    const voice = sec.voice || track.lead, vol = 1.1 + 0.35 * sec.e;
    for (const note of song.leadAt.get(step) || []) {
      if (voice === 'vox' || voice === 'voxv') {
        const list = (voice === 'vox' ? track.syl?.h : track.syl?.v) || ['oh'];
        this.vocal(list[(step >> 1) % list.length], note.midi, at, note.dur, vol, vox);
      } else this.lead(voice, note.midi, at, note.dur, vol, !!sec.thick);
      if (sec.dbl) this.lead(sec.dbl, note.midi, at, note.dur, vol * 0.5, !!sec.thick);
    }
  }
  // Short interface sounds, played immediately and outside the song bus.
  chime(kind) {
    const at = this.ctx.currentTime + 0.01, notes = { star: [84, 91], win: [72, 76, 79, 84], fail: [58, 53, 46], tap: [88] }[kind] || [80];
    notes.forEach((midi, i) => {
      const t = at + i * (kind === 'fail' ? 0.11 : 0.085), g = this.pluckAmp(t, kind === 'tap' ? 0.06 : 0.16, kind === 'fail' ? 0.4 : 0.5);
      this.osc(kind === 'fail' ? 'sawtooth' : 'triangle', hz(midi), t, t + 0.6, g); this.osc('sine', hz(midi) * 2, t, t + 0.6, g);
      g.connect(this.mix); const wet = this.ctx.createGain(); wet.gain.value = 0.4; g.connect(wet); wet.connect(this.reverb);
    });
  }
}

/** Renders a whole track without real-time playback (used for mix checks and export). */
export async function renderOffline(track, OfflineContext = globalThis.OfflineAudioContext, sampleRate = 44100) {
  const song = compile(track), lead = song.beat * 4, tail = 2, total = song.duration + lead + tail;
  const ctx = new OfflineContext(2, Math.ceil(total * sampleRate), sampleRate);
  const synth = new Synth(ctx); synth.setTrack(track);
  // Schedule in slices, as the live scheduler does, so the graph stays small.
  let step = -16;
  const fill = (until) => { while (step < song.steps && lead + step * song.s16 < until) { synth.playStep(step, lead + step * song.s16); step++; } };
  const slice = 0.5; fill(slice + LOOKAHEAD);
  for (let t = slice; t < total; t += slice) ctx.suspend(t).then(() => { fill(t + slice + LOOKAHEAD); ctx.resume(); });
  return ctx.startRendering();
}

/** One musical clock drives the soundtrack, the chart and the animation. */
export class Soundtrack {
  constructor() { this.ctx = null; this.synth = null; this.timer = null; this.muted = false; this.silent = true; this.paused = false; this.frozen = 0; this.origin = 0; this.latency = 0; this.level = 1; this.track = null; this.session = 0; }
  clock() { return this.silent ? performance.now() / 1000 : this.ctx.currentTime; }
  /** Song time in seconds as the player hears it; negative during the count-in. */
  get time() { return this.paused || !this.track ? this.frozen : this.clock() - this.origin - this.latency; }
  get fallback() { return this.silent; }
  async unlock() {
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    try {
      if (!Audio) return false;
      if (!this.ctx) { this.ctx = new Audio({ latencyHint: 'interactive' }); this.synth = new Synth(this.ctx); this.applyVolume(); }
      // resume() can stay pending until a user gesture; never wait on it forever.
      await Promise.race([this.ctx.resume(), new Promise((r) => setTimeout(r, 500))]);
      return this.ctx.state === 'running';
    } catch { return false; }
  }
  /** Starts a track. `silent` runs the clock without sound; `at` is the starting song time. */
  async start(track, { at, silent = false, level = 1 } = {}) {
    this.halt(); const id = ++this.session;
    const audible = !silent && (await this.unlock());
    if (id !== this.session) return false; // a newer start() or stop() took over while unlocking
    this.track = track; this.song = compile(track); this.level = level; this.silent = !audible;
    if (!this.silent) {
      this.synth.setTrack(track); this.applyVolume();
      this.latency = Math.min(0.3, Math.max(0, this.ctx.outputLatency || this.ctx.baseLatency || 0));
    } else this.latency = 0;
    this.paused = false; this.seek(at ?? -this.song.beat * 4);
    this.timer = setInterval(() => this.tick(), TICK_MS); this.tick();
    return true;
  }
  /** Moves the clock so that `time` is now, dropping anything already scheduled. */
  seek(time) {
    if (!this.track) return;
    if (!this.silent) { this.synth.cut(); this.origin = this.ctx.currentTime + 0.06 - time - this.latency; }
    else this.origin = performance.now() / 1000 - time;
    this.frozen = time; this.step = Math.ceil(time / this.song.s16 - 1e-6);
  }
  tick() {
    if (this.silent || this.paused || !this.track) return;
    const now = this.ctx.currentTime, { s16, steps } = this.song, base = this.origin + this.latency;
    while (this.step < steps && base + this.step * s16 < now + LOOKAHEAD) {
      const at = base + this.step * s16;
      if (at >= now - 0.02) this.synth.playStep(this.step, Math.max(at, now));
      this.step++;
    }
  }
  applyVolume() { if (this.synth) this.synth.master.gain.setTargetAtTime(this.muted ? 0 : 0.8 * this.level, this.ctx.currentTime, 0.03); }
  setMuted(value) { this.muted = value; this.applyVolume(); }
  setLevel(value) { this.level = value; this.applyVolume(); }
  chime(kind) { if (!this.silent && this.ctx?.state === 'running' && !this.muted) this.synth.chime(kind); }
  /** Freezes the clock at `time` (the last frame the player saw). */
  async pause(time = this.time, { suspend = true } = {}) {
    if (this.paused || !this.track) return;
    this.paused = true; this.frozen = time;
    if (!this.silent) { this.synth.cut(); if (suspend) { try { await this.ctx.suspend(); } catch { /* keep going silently */ } } }
  }
  /** While paused, choose where the song will pick up again. */
  rewind(time) { if (this.paused) this.frozen = time; }
  async resume() {
    if (!this.paused || !this.track) return;
    if (!this.silent) { try { await Promise.race([this.ctx.resume(), new Promise((r) => setTimeout(r, 500))]); } catch { /* fall through */ } }
    this.seek(this.frozen); this.paused = false; this.tick();
  }
  halt() { this.session++; clearInterval(this.timer); this.timer = null; if (this.synth && !this.silent) this.synth.cut(); this.frozen = this.track ? this.time : 0; this.track = null; }
  /** Stops the song. The context is suspended so an idle page does no audio work. */
  async stop({ suspend = true } = {}) {
    const hadSound = !this.silent; this.halt();
    if (suspend && hadSound && this.ctx?.state === 'running') { try { await this.ctx.suspend(); } catch { /* ignore */ } }
  }
}
