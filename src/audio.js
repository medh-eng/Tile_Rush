// Web Audio soundtrack. `Synth` turns song steps into sound on any BaseAudioContext
// (live or offline); `Soundtrack` owns the clock the whole game runs on.
import { DRUMS, compile, chord, degree } from './songs.js';
import { RecordingBank } from './recordings.js';

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const LOOKAHEAD = 0.2, TICK_MS = 25;

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
    this.drive = this.curve(2.6);
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
  kick(at, vol = 1) {
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);
    const o = this.osc('sine', 150, at, at + 0.36, g);
    o.frequency.setValueAtTime(165, at); o.frequency.exponentialRampToValueAtTime(46, at + 0.11);
    const click = this.pluckAmp(at, 0.25 * vol, 0.02), hp = this.filter('highpass', 2500);
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

  // --- pitched instruments ---
  lead(voice, midi, at, dur, vol = 1, thick = false) {
    const f = hz(midi), ctx = this.ctx;
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
    const tones = chord(track, bar), final = bar === song.bars - 1;
    if (final) { if (s === 0) { this.pad(tones, at, s16 * 16, false); this.kick(at, 0.9); } return; }
    if (rel === 0 && s === 0 && sec.impact) this.impact(at);
    if (sec.riser && s === 0 && rel === Math.max(0, sec.bars - 2)) this.riser(at, (sec.bars - rel) * 16 * s16);
    // drums
    if (kit.k?.[s] === 'x') {
      this.kick(at, 0.55 + 0.3 * sec.e);
      if (sec.duck) { const g = this.bus.music.gain; g.setValueAtTime(0.32, at); g.linearRampToValueAtTime(1, at + Math.min(0.26, s16 * 3.2)); }
    }
    if (kit.s?.[s] === 'x') this.snare(at, 0.5, track.lead === 'saw');
    if (kit.c?.[s] === 'x') this.clap(at);
    if (kit.h && kit.h[s] !== '.') this.hat(at, kit.h[s] === 'x' ? 0.15 : 0.07);
    if (kit.o?.[s] === 'x') this.hat(at, 0.13, true);
    if (kit.roll) {
      const left = sec.bars - rel, every = left > 2 ? 4 : left > 1 ? 2 : s < 8 ? 2 : 1;
      if (s % every === 0) this.snare(at, 0.16 + 0.34 * ((rel * 16 + s) / (sec.bars * 16)));
    }
    // harmony
    if (sec.pad && s === 0) this.pad(tones, at, s16 * 16, sec.pad === 2);
    if (sec.arp) {
      const fast = track.bpm >= 120 && sec.e >= 0.7;
      if (fast || s % 2 === 0) { const i = fast ? s : s / 2, order = [0, 1, 2, 1, 2, 3, 2, 1]; const k = order[i % 8]; this.arp(tones[k % tones.length] + 12 * (1 + Math.floor(k / tones.length)), at, sec.e >= 0.7 ? 0.8 : 1); }
    }
    if (sec.bass) {
      let root = degree(track, track.prog[bar % track.prog.length]); while (root > 45) root -= 12;
      const style = track.bass;
      if (style === 'eighth' && s % 2 === 0) this.bass(style, root + (s === 14 ? 12 : 0), at, s16 * 2);
      else if (style === 'off' && s % 4 === 2) this.bass(style, root, at, s16 * 2);
      else if (style === 'roll' && s % 4 !== 0) this.bass(style, root, at, s16, 0.85);
      else if (style === 'long' && (s === 0 || s === 10)) this.bass(style, root, at, s16 * (s ? 6 : 10));
      else if (style === '808' && kit.k?.[s] === 'x') this.bass(style, root, at, s16 * 5);
    }
    // melody
    for (const note of song.leadAt.get(step) || []) this.lead(sec.voice || track.lead, note.midi, at, note.dur, 1.1 + 0.35 * sec.e, !!sec.thick);
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
    this.halt(); const id = ++this.session; this.error = null; this.recordingBuffer = null;
    const audible = !silent && (await this.unlock());
    if (id !== this.session) return false; // a newer start() or stop() took over while unlocking
    if (track.recording && audible) {
      this.recordings ||= new RecordingBank(this.ctx);
      try {
        const buffer = await this.recordings.load(track.recording);
        if (id !== this.session) return false;
        this.recordingBuffer = buffer;
      }
      catch (error) {
        if (id !== this.session) return false;
        this.error = error; await this.stop();
        if (this.ctx.state === 'running') { try { await this.ctx.suspend(); } catch { /* unavailable */ } }
        return false;
      }
      if (id !== this.session) return false;
    }
    this.track = track; this.song = compile(track); this.level = level; this.silent = !audible;
    if (!this.silent) {
      if (!track.recording) this.synth.setTrack(track); this.applyVolume();
      this.latency = Math.min(0.3, Math.max(0, this.ctx.outputLatency || this.ctx.baseLatency || 0));
    } else this.latency = 0;
    this.paused = false; this.seek(at ?? -this.song.beat * 4);
    if (!track.recording) { this.timer = setInterval(() => this.tick(), TICK_MS); this.tick(); }
    return true;
  }
  /** Moves the clock so that `time` is now, dropping anything already scheduled. */
  seek(time) {
    if (!this.track) return;
    if (!this.silent) { this.synth.cut(); this.origin = this.ctx.currentTime + 0.06 - time - this.latency; }
    else this.origin = performance.now() / 1000 - time;
    this.frozen = time; this.step = Math.ceil(time / this.song.s16 - 1e-6);
    if (this.track.recording && !this.silent) {
      // The decoded audio sample clock preserves the pianist's rubato and dynamics.
      const base = this.origin + this.latency;
      this.recordings.play(this.recordingBuffer, Math.max(this.ctx.currentTime, base + Math.max(0, time)), Math.max(0, time));
    }
  }
  tick() {
    if (this.silent || this.paused || !this.track || this.track.recording) return;
    const now = this.ctx.currentTime, { s16, steps } = this.song, base = this.origin + this.latency;
    while (this.step < steps && base + this.step * s16 < now + LOOKAHEAD) {
      const at = base + this.step * s16;
      if (at >= now - 0.02) this.synth.playStep(this.step, Math.max(at, now));
      this.step++;
    }
  }
  applyVolume() {
    if (this.synth) this.synth.master.gain.setTargetAtTime(this.muted ? 0 : 0.8 * this.level, this.ctx.currentTime, 0.03);
    this.recordings?.setVolume(this.muted ? 0 : this.level);
  }
  setMuted(value) { this.muted = value; this.applyVolume(); }
  setLevel(value) { this.level = value; this.applyVolume(); }
  chime(kind) { if (!this.track?.recording && !this.silent && this.ctx?.state === 'running' && !this.muted) this.synth.chime(kind); }
  /** Freezes the clock at `time` (the last frame the player saw). */
  async pause(time = this.time, { suspend = true } = {}) {
    if (this.paused || !this.track) return;
    this.paused = true; this.frozen = time;
    if (!this.silent) { this.recordings?.stop(); this.synth.cut(); if (suspend) { try { await this.ctx.suspend(); } catch { /* keep going silently */ } } }
  }
  /** While paused, choose where the song will pick up again. */
  rewind(time) { if (this.paused) this.frozen = time; }
  async resume() {
    if (!this.paused || !this.track) return;
    if (!this.silent) { try { await Promise.race([this.ctx.resume(), new Promise((r) => setTimeout(r, 500))]); } catch { /* fall through */ } }
    this.seek(this.frozen); this.paused = false; this.tick();
  }
  halt() { this.recordings?.stop(); this.session++; clearInterval(this.timer); this.timer = null; if (this.synth && !this.silent) this.synth.cut(); this.frozen = this.track ? this.time : 0; this.track = null; }
  /** Stops the song. The context is suspended so an idle page does no audio work. */
  async stop({ suspend = true } = {}) {
    const hadSound = !this.silent; this.halt();
    if (suspend && hadSound && this.ctx?.state === 'running') { try { await this.ctx.suspend(); } catch { /* ignore */ } }
  }
}
