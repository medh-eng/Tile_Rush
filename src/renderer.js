// Canvas 2D renderer: a one-point-perspective neon runway drawn from song time.
// Nothing here integrates motion per frame except decorative particles, so the
// picture always matches the music clock.
import { TILE_HALF, clamp } from './model.js';
import { sectionAt } from './songs.js';

const THEMES = {
  sunset: { deco: 'crystal', palettes: [{ a: 322, b: 268 }, { a: 24, b: 338 }, { a: 186, b: 232 }, { a: 285, b: 212 }] },
  cosmos: { deco: 'ring', palettes: [{ a: 198, b: 252 }, { a: 276, b: 232 }, { a: 164, b: 214 }, { a: 322, b: 262 }] },
  city: { deco: 'tower', palettes: [{ a: 188, b: 228 }, { a: 314, b: 256 }, { a: 46, b: 14 }, { a: 152, b: 204 }] },
  aurora: { deco: 'pine', palettes: [{ a: 152, b: 204 }, { a: 178, b: 262 }, { a: 96, b: 172 }, { a: 292, b: 204 }] },
  inferno: { deco: 'spike', palettes: [{ a: 356, b: 338 }, { a: 22, b: 2 }, { a: 288, b: 332 }, { a: 42, b: 12 }] },
};
export const themeColours = (theme) => THEMES[theme].palettes[0];

const hsl = (h, s, l, a = 1) => `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;
const mixHue = (from, to, t) => from + ((((to - from) % 360) + 540) % 360 - 180) * t;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const D = 6, CAM_Y = 3.1, BALL_R = 0.36, TILE_DEPTH = 0.66, FAR = 58;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
    this.quality = 2; this.slow = 0; this.frames = 0;
    this.particles = []; this.rings = []; this.beams = []; this.trail = [];
    this.pal = { a: 320, b: 268 }; this.camX = 0; this.flash = 0; this.shake = 0; this.squash = 0; this.section = -1;
    const r = rng(7); this.stars = Array.from({ length: 70 }, () => ({ x: r(), y: r() * 0.95, s: 0.6 + r() * 1.4, f: 0.6 + r() * 2.4, p: r() * 6.3 }));
    this.ridgeA = Array.from({ length: 40 }, () => r()); this.ridgeB = Array.from({ length: 40 }, () => r());
    this.skyline = Array.from({ length: 34 }, () => ({ h: 0.25 + r() * 0.75, w: 0.6 + r() * 0.8, lit: Math.floor(r() * 255), bounce: r() }));
    this.resize();
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect(); this.w = rect.width || 1; this.h = rect.height || 1;
    const cap = [1, 1.5, 2][this.quality], dpr = Math.min(globalThis.devicePixelRatio || 1, cap);
    this.canvas.width = Math.round(this.w * dpr); this.canvas.height = Math.round(this.h * dpr); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setRun(run) {
    this.run = run; this.theme = THEMES[run.track.theme]; this.particles = []; this.rings = []; this.beams = []; this.trail = [];
    this.section = -1; this.flash = 0; this.shake = 0; this.camX = 0; this.pal = { ...this.theme.palettes[0] };
  }
  palette(sectionIndex) { const list = this.theme.palettes; return list[((sectionIndex % list.length) + list.length) % list.length]; }

  // --- events from the game ---
  hit(note, result, streak) {
    const hue = this.palette(note.section).a, z = note.time * this.run.track.speed, x = note.x * this.lane;
    this.squash = 1; this.rings.push({ x, z, t: 0, hue, big: result === 'perfect' });
    if (result === 'perfect') { this.beams.push({ x, z, t: 0, hue, w: note.w }); if (!this.reduced) this.shake = Math.min(1, 0.25 + streak * 0.03); }
    const count = (result === 'perfect' ? 12 : 6) * (this.quality ? 1 : 0.5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 6.283, speed = 1.5 + Math.random() * 3.5;
      this.particles.push({ x, y: 0.1, z, vx: Math.cos(angle) * speed, vy: 2.5 + Math.random() * 4.5, vz: Math.sin(angle) * speed + 3, life: 1, decay: 1.5 + Math.random(), size: 0.04 + Math.random() * 0.08, hue: hue + (Math.random() * 40 - 20), light: result === 'perfect' ? 80 : 68, rot: Math.random() * 6.3, spin: (Math.random() - 0.5) * 12 });
    }
  }
  celebrate(time) {
    const z = time * this.run.track.speed;
    for (let i = 0; i < 90; i++) this.particles.push({ x: (Math.random() - 0.5) * this.lane * 3, y: 2 + Math.random() * 5, z: z + 2 + Math.random() * 14, vx: (Math.random() - 0.5) * 3, vy: 1 + Math.random() * 4, vz: Math.random() * 3, life: 1, decay: 0.35 + Math.random() * 0.4, size: 0.1 + Math.random() * 0.14, hue: Math.random() * 360, light: 70, rot: Math.random() * 6.3, spin: (Math.random() - 0.5) * 14, drag: 1 });
    this.flash = 1;
  }

  /** state: { run, time, x, dt, fall } — `fall` is seconds since a miss (ball drops away). */
  draw({ run, time, x, dt = 0, fall = -1 }) {
    if (run !== this.run) this.setRun(run);
    const c = this.ctx, w = this.w, h = this.h, { song, track, chart } = run, beat = song.beat, speed = track.speed;
    this.adapt(dt);
    // camera and projection
    const F = h * 0.8, hy = h * 0.34, k0 = F / D, lane = this.lane = (0.42 * w) / k0;
    const rail = lane * 1.2, bz = time * speed, camZ = bz - D, bx = x * lane;
    this.camX += (bx * 0.3 - this.camX) * Math.min(1, dt * 7 + (dt ? 0 : 1));
    const shake = this.shake * 5; this.shake = Math.max(0, this.shake - dt * 5);
    const ox = w / 2 + (shake ? (Math.random() - 0.5) * shake : 0), oy = hy + (shake ? (Math.random() - 0.5) * shake : 0), camX = this.camX;
    const P = (wx, wy, wz) => { const dz = wz - camZ; if (dz < 0.45) return null; const k = F / dz; return [ox + (wx - camX) * k, oy + (CAM_Y - wy) * k, k]; };
    // music-driven values
    const section = sectionAt(song, time), energy = section.e, phase = (((time / beat) % 1) + 1) % 1;
    const pulse = this.reduced ? 0 : (1 - phase) ** 2 * (0.25 + 0.75 * energy);
    if (section.index !== this.section) { if (this.section >= 0 && !this.reduced) this.flash = 1; this.section = section.index; }
    const target = this.palette(section.index), blend = dt ? Math.min(1, dt * 3) : 1;
    this.pal.a = mixHue(this.pal.a, target.a, blend); this.pal.b = mixHue(this.pal.b, target.b, blend);
    const { a, b } = this.pal;

    // sky
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const sky = c.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, hsl(b, 70, 4)); sky.addColorStop(0.55, hsl(b, 72, 11)); sky.addColorStop(1, hsl(a, 82, 24 + pulse * 8));
    c.fillStyle = sky; c.fillRect(0, 0, w, hy + 1);
    for (const s of this.stars) { c.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(time * s.f + s.p)); c.fillStyle = '#fff'; c.fillRect(s.x * w, s.y * hy * 0.92, s.s, s.s); }
    c.globalAlpha = 1;
    this[track.theme](c, w, hy, a, b, time, pulse, camX * k0 * 0.04);

    // floor
    const floor = c.createLinearGradient(0, hy, 0, h);
    floor.addColorStop(0, hsl(a, 80, 16 + pulse * 6)); floor.addColorStop(0.16, hsl(b, 70, 7)); floor.addColorStop(1, hsl(b, 60, 3));
    c.fillStyle = floor; c.fillRect(0, hy, w, h - hy);
    c.globalCompositeOperation = 'lighter';
    const glow = c.createLinearGradient(0, hy - h * 0.05, 0, hy + h * 0.06);
    glow.addColorStop(0, hsl(a, 100, 60, 0)); glow.addColorStop(0.45, hsl(a, 100, 66, 0.3 + pulse * 0.3)); glow.addColorStop(1, hsl(a, 100, 60, 0));
    c.fillStyle = glow; c.fillRect(0, hy - h * 0.05, w, h * 0.11);
    // grid: lateral lines sit on half-beats, so the floor itself keeps time
    const gap = speed * beat / 2; c.lineWidth = 1;
    for (let z = Math.ceil((camZ + 0.8) / gap) * gap; z < camZ + FAR; z += gap) {
      const dz = z - camZ, y = oy + CAM_Y * F / dz, strong = Math.round(z / gap) % 2 === 0;
      c.strokeStyle = hsl(a, 100, 62, Math.min(1, 9 / dz) * (strong ? 0.22 + pulse * 0.3 : 0.09)); c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    }
    for (let i = -7; i <= 7; i++) {
      if (i === 0) continue; const near = P(i * rail * 0.5, 0, camZ + 0.7); if (!near) continue;
      const isRail = Math.abs(i) === 2;
      c.strokeStyle = hsl(isRail ? a : b, 100, isRail ? 70 : 62, isRail ? 0.55 + pulse * 0.3 : 0.1); c.lineWidth = isRail ? 2 : 1;
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(near[0], near[1]); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';

    // roadside scenery and section gates, far to near
    const step = speed * beat * 2, sideX = rail + lane * 0.9;
    for (let n = Math.floor((camZ + FAR) / step); n * step > camZ + 1.4; n--) {
      const z = n * step, dz = z - camZ, alpha = clamp((FAR - dz) / 16, 0, 1);
      for (const side of [-1, 1]) {
        const p = P(side * (sideX + ((n * 3 + (side > 0 ? 1 : 0)) % 3) * lane * 0.45), 0, z); if (!p) continue;
        if (p[0] < -200 || p[0] > w + 200) continue;
        this.deco(c, this.theme.deco, p[0], p[1], p[2], side, a, b, alpha, n, time, pulse);
      }
    }
    for (const sec of song.sections) {
      if (!sec.index) continue; const z = sec.time * speed, dz = z - camZ; if (dz < 0.6 || dz > FAR) continue;
      this.gate(c, P, rail, z, this.palette(sec.index).a, clamp((FAR - dz) / 16, 0, 1), pulse);
    }

    // start runway and finish pad
    const first = chart[0], last = chart[chart.length - 1];
    this.slab(c, P, camZ, 0, (first.time - beat * 5) * speed, (first.time - beat * 0.45) * speed, lane * 0.6, this.palette(0).a, 1, false);
    this.slab(c, P, camZ, last.x * lane, last.time * speed + speed * beat * 0.6, last.time * speed + 40, lane * 0.8, this.palette(last.section).a, 1, false);

    // tiles, far to near
    const from = Math.max(0, run.next - 4); let to = run.next;
    while (to < chart.length && (chart[to].time - time) * speed < FAR - D) to++;
    for (let i = to - 1; i >= from; i--) {
      const note = chart[i], z = note.time * speed, dz = z - camZ; if (dz < 0.5) continue;
      const passed = i < run.next, age = passed ? (time >= note.time ? time - note.time : 0.3) : 0;
      let alpha = clamp((FAR - dz) / 14, 0, 1) * (passed ? Math.max(0, 1 - age * 1.7) : 1); if (alpha <= 0) continue;
      let nx = note.x;
      if (note.kind === 'move' && !passed) nx += (note.x > 0 ? -1 : 1) * 0.3 * (1 - Math.cos((note.time - time) * Math.PI / beat));
      const hue = this.palette(note.section).a, isNext = i === run.next && run.status === 'playing';
      this.slab(c, P, camZ, nx * lane, z - TILE_DEPTH, z + TILE_DEPTH, TILE_HALF * lane * note.w, hue, alpha, true, passed ? age : -1, isNext ? 0.5 + 0.5 * Math.sin(time * 9) : 0, note.kind, note.w, passed ? Math.min(0.45, age * 2.5) : 0);
    }

    // world effects
    c.globalCompositeOperation = 'lighter';
    for (const beam of this.beams) {
      beam.t += dt; const base = P(beam.x, 0, beam.z), top = P(beam.x, 3.2, beam.z); if (!base || !top || beam.t > 0.4) continue;
      const half = TILE_HALF * lane * beam.w * base[2] * 0.85, fade = 1 - beam.t / 0.4, g = c.createLinearGradient(0, base[1], 0, top[1]);
      g.addColorStop(0, hsl(beam.hue, 100, 75, 0.32 * fade)); g.addColorStop(1, hsl(beam.hue, 100, 70, 0)); c.fillStyle = g; c.fillRect(base[0] - half, top[1], half * 2, base[1] - top[1]);
    }
    this.beams = this.beams.filter((e) => e.t <= 0.4);
    for (const ring of this.rings) {
      ring.t += dt; const p = P(ring.x, 0, ring.z); if (!p || ring.t > 0.5) continue;
      const q = ring.t / 0.5, radius = (0.5 + q * (ring.big ? 3.4 : 2.2)) * p[2];
      c.strokeStyle = hsl(ring.hue, 100, 78, (1 - q) * 0.9); c.lineWidth = Math.max(1, (1 - q) * 0.07 * p[2]);
      c.beginPath(); c.ellipse(p[0], p[1], radius, radius * clamp(CAM_Y / (ring.z - camZ), 0.1, 0.9), 0, 0, 6.283); c.stroke();
    }
    this.rings = this.rings.filter((e) => e.t <= 0.5);

    // ball
    const next = chart[run.next], prev = chart[run.next - 1];
    let from0, to0;
    if (run.hopStart != null && next) { from0 = run.hopStart; to0 = next.time; }
    else if (prev && next) { from0 = prev.time; to0 = next.time; }
    else { const anchor = next ? next.time : prev.time; from0 = anchor + Math.floor((time - anchor) / beat) * beat; to0 = from0 + beat; }
    const p = clamp((time - from0) / Math.max(0.01, to0 - from0), 0, 1), height = Math.min(2.5, 0.8 + 2 * (to0 - from0));
    let by = BALL_R + (run.hopStart != null && next ? 5 * (1 - p) ** 2 : 4 * height * p * (1 - p));
    let ballAlpha = 1;
    if (fall >= 0) { by = BALL_R - 14 * fall * fall; ballAlpha = clamp(1 - fall * 1.6, 0, 1); }
    this.squash = Math.max(0, this.squash - dt * 6);
    const fever = run.fever && run.status === 'playing', ballHue = fever ? 44 : a;
    if (dt) { this.trail.push({ x: bx, y: by, z: bz, t: time }); while (this.trail.length && (time - this.trail[0].t > 0.2 || this.trail[0].t > time)) this.trail.shift(); }
    const shadow = P(bx, 0, bz);
    if (shadow && fall < 0) { c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(0,0,0,${0.4 * (1 - p * (1 - p) * 2)})`; c.beginPath(); c.ellipse(shadow[0], shadow[1], BALL_R * shadow[2] * (1 - p * (1 - p)), BALL_R * shadow[2] * 0.4, 0, 0, 6.283); c.fill(); c.globalCompositeOperation = 'lighter'; }
    this.trail.forEach((t, i) => {
      const q = P(t.x, t.y, t.z); if (!q) return; const f = (i + 1) / this.trail.length;
      c.fillStyle = hsl(ballHue, 100, 70, 0.22 * f * ballAlpha); c.beginPath(); c.arc(q[0], q[1], BALL_R * q[2] * (0.35 + 0.6 * f), 0, 6.283); c.fill();
    });
    const ball = P(bx, by, bz);
    if (ball && ballAlpha > 0) {
      const r = BALL_R * ball[2], halo = c.createRadialGradient(ball[0], ball[1], r * 0.4, ball[0], ball[1], r * (fever ? 4 : 3));
      halo.addColorStop(0, hsl(ballHue, 100, 72, 0.6 * ballAlpha)); halo.addColorStop(1, hsl(ballHue, 100, 60, 0)); c.fillStyle = halo; c.fillRect(ball[0] - r * 4, ball[1] - r * 4, r * 8, r * 8);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = ballAlpha;
      const stretch = this.reduced ? 0 : (0.5 - Math.abs(p - 0.5)) * 0.12, core = c.createRadialGradient(ball[0] - r * 0.3, ball[1] - r * 0.35, r * 0.1, ball[0], ball[1], r);
      core.addColorStop(0, '#fff'); core.addColorStop(0.7, hsl(ballHue, 100, 94)); core.addColorStop(1, hsl(ballHue, 100, 78)); c.fillStyle = core;
      c.beginPath(); c.ellipse(ball[0], ball[1] + r * this.squash * 0.2, r * (1 + this.squash * 0.22 - stretch), r * (1 - this.squash * 0.25 + stretch), 0, 0, 6.283); c.fill();
      c.globalAlpha = 1; c.globalCompositeOperation = 'lighter';
      if (fever && dt && this.quality) this.particles.push({ x: bx + (Math.random() - 0.5) * 0.4, y: by, z: bz, vx: (Math.random() - 0.5) * 1.5, vy: 1 + Math.random() * 2, vz: -2, life: 1, decay: 3.5, size: 0.06, hue: 30 + Math.random() * 25, light: 62, rot: Math.random() * 6, spin: 6 });
    }
    // particles
    const limit = this.quality ? 260 : 120; if (this.particles.length > limit) this.particles.splice(0, this.particles.length - limit);
    for (const s of this.particles) {
      s.life -= dt * s.decay; if (s.life <= 0) continue;
      s.vy -= (s.drag ? 5 : 13) * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.rot += s.spin * dt;
      const q = P(s.x, s.y, s.z); if (!q) continue; const size = s.size * q[2] * (0.5 + s.life * 0.5), cs = Math.cos(s.rot) * size, sn = Math.sin(s.rot) * size;
      c.fillStyle = hsl(s.hue, 100, s.light, Math.min(1, s.life * 1.4)); c.beginPath(); c.moveTo(q[0] + cs, q[1] + sn); c.lineTo(q[0] - sn, q[1] + cs); c.lineTo(q[0] - cs * 0.4, q[1] - sn * 0.4); c.fill();
    }
    this.particles = this.particles.filter((s) => s.life > 0);

    // screen overlays
    if (fever && !this.reduced) {
      c.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) { const ang = Math.random() * 6.283, r0 = h * (0.42 + Math.random() * 0.2), r1 = r0 + h * (0.08 + Math.random() * 0.14); c.strokeStyle = hsl(44, 100, 75, 0.2 + Math.random() * 0.2); c.beginPath(); c.moveTo(ox + Math.cos(ang) * r0, oy + h * 0.2 + Math.sin(ang) * r0); c.lineTo(ox + Math.cos(ang) * r1, oy + h * 0.2 + Math.sin(ang) * r1); c.stroke(); }
    }
    if (this.flash > 0) { c.fillStyle = hsl(a, 100, 78, this.flash * 0.32); c.fillRect(0, 0, w, h); this.flash = Math.max(0, this.flash - dt * 2.6); }
    c.globalCompositeOperation = 'source-over';
    if (this.quality) { const v = c.createRadialGradient(w / 2, h * 0.55, h * 0.3, w / 2, h * 0.55, h * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,6,0.62)'); c.fillStyle = v; c.fillRect(0, 0, w, h); }
  }
  /** Drops rendering resolution if the device cannot hold a steady frame rate. */
  adapt(dt) {
    if (!dt || dt > 0.2) return; this.frames++; if (dt > 0.024) this.slow++;
    if (this.frames >= 120) { if (this.slow > 55 && this.quality > 0) { this.quality--; this.resize(); } this.frames = 0; this.slow = 0; }
  }

  // --- world pieces ---
  slab(c, P, camZ, x, z0, z1, half, hue, alpha, isTile, age = -1, target = 0, kind = 'normal', wide = 1, sink = 0) {
    z0 = Math.max(z0, camZ + 0.5); if (z1 <= z0) return;
    const nl = P(x - half, -sink, z0), nr = P(x + half, -sink, z0), fl = P(x - half, -sink, z1), fr = P(x + half, -sink, z1); if (!nl || !fl) return;
    const k = nl[2], lit = age >= 0 ? Math.max(0, 1 - age * 5) : 0;
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = alpha;
    // glowing skirt below the near edge
    const skirt = k * (isTile ? 0.85 : 0.5), g = c.createLinearGradient(0, nl[1], 0, nl[1] + skirt);
    g.addColorStop(0, hsl(hue, 96, 38, 0.95)); g.addColorStop(1, hsl(hue, 96, 30, 0)); c.fillStyle = g;
    c.beginPath(); c.moveTo(nl[0], nl[1]); c.lineTo(nr[0], nr[1]); c.lineTo(nr[0], nr[1] + skirt); c.lineTo(nl[0], nl[1] + skirt); c.fill();
    // top face with rounded corners
    const pts = [fl, fr, nr, nl], round = isTile ? 0.16 : 0.04;
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      const cur = pts[i], before = pts[(i + 3) % 4], after = pts[(i + 1) % 4];
      const ax = cur[0] + (before[0] - cur[0]) * round, ay = cur[1] + (before[1] - cur[1]) * round, bx = cur[0] + (after[0] - cur[0]) * round, by = cur[1] + (after[1] - cur[1]) * round;
      if (i) c.lineTo(ax, ay); else c.moveTo(ax, ay); c.quadraticCurveTo(cur[0], cur[1], bx, by);
    }
    c.closePath();
    const face = c.createLinearGradient(0, fl[1], 0, nl[1]);
    face.addColorStop(0, hsl(hue, 96, (isTile ? 60 : 30) + lit * 30 + target * 6)); face.addColorStop(1, hsl(hue, 94, (isTile ? 46 : 20) + lit * 40 + target * 8));
    c.fillStyle = face; c.fill();
    c.strokeStyle = hsl(hue, 100, 88); c.lineWidth = Math.max(1, k * 0.045); c.stroke();
    if (this.quality && k > 14) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = hsl(hue, 100, 65, 0.22 + target * 0.2 + lit * 0.4); c.lineWidth = k * 0.2; c.stroke(); c.globalCompositeOperation = 'source-over'; }
    if (isTile) {
      // centre marks: one diamond, three on wide tiles, arrows on sliding tiles
      const zc = (z0 + z1) / 2, dz = (z1 - z0) / 2, marks = kind === 'wide' ? [-0.5, 0, 0.5] : [0], size = (kind === 'wide' ? 0.2 : 0.3) * (1 + target * 0.15);
      c.fillStyle = `rgba(255,255,255,${0.92 - lit * 0.3})`;
      for (const m of marks) {
        const cx = x + m * half, t = P(cx, -sink, zc + dz * size * 1.5), r = P(cx + half * size / wide, -sink, zc), bt = P(cx, -sink, zc - dz * size * 1.5), l = P(cx - half * size / wide, -sink, zc);
        if (!t || !bt) continue; c.beginPath(); c.moveTo(t[0], t[1]); c.lineTo(r[0], r[1]); c.lineTo(bt[0], bt[1]); c.lineTo(l[0], l[1]); c.fill();
      }
      if (kind === 'move') for (const s of [-1, 1]) {
        const tip = P(x + s * half * 0.78, -sink, zc), u = P(x + s * half * 0.55, -sink, zc + dz * 0.4), d = P(x + s * half * 0.55, -sink, zc - dz * 0.4);
        if (tip && d) { c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(u[0], u[1]); c.lineTo(d[0], d[1]); c.fill(); }
      }
    }
    c.globalAlpha = 1;
  }
  gate(c, P, rail, z, hue, alpha, pulse) {
    const x = rail * 1.12, top = 5.2, pts = [P(-x, 0, z), P(-x, top * 0.8, z), P(-x * 0.7, top, z), P(x * 0.7, top, z), P(x, top * 0.8, z), P(x, 0, z)];
    if (pts.some((p) => !p)) return; const k = pts[0][2];
    c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round';
    for (const [width, light, op] of [[0.34, 60, 0.18], [0.12, 70, 0.55], [0.04, 92, 0.95]]) {
      c.strokeStyle = hsl(hue, 100, light, op * alpha * (0.8 + pulse * 0.2)); c.lineWidth = Math.max(1, width * k);
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
  }
  deco(c, type, sx, sy, k, side, a, b, alpha, n, time, pulse) {
    const X = (u) => sx + u * k * side, Y = (v) => sy - v * k, tall = 1 + ((n * 7 + (side > 0 ? 3 : 0)) % 4) * 0.22;
    const poly = (pts, close = true) => { c.beginPath(); pts.forEach(([u, v], i) => (i ? c.lineTo(X(u), Y(v)) : c.moveTo(X(u), Y(v)))); if (close) c.closePath(); };
    c.globalAlpha = alpha; c.lineWidth = Math.max(1, k * 0.035); c.lineJoin = 'round';
    const line = hsl(a, 100, 66, 0.95), dim = hsl(b, 100, 66, 0.8), body = hsl(b, 70, 7, 0.92);
    if (type === 'crystal') {
      const hgt = 3.1 * tall;
      poly([[-0.75, 0], [0, hgt], [0.75, 0]]); c.fillStyle = body; c.fill(); c.strokeStyle = line; c.stroke();
      poly([[0, hgt], [0.22, 0]], false); c.strokeStyle = dim; c.stroke(); poly([[-0.38, hgt * 0.5], [0.11, hgt * 0.5]], false); c.stroke();
    } else if (type === 'ring') {
      const lift = 2.4 * tall + Math.sin(time * 1.4 + n) * 0.25;
      c.strokeStyle = line; c.beginPath(); c.ellipse(X(0), Y(lift), k * 0.45, k * 1.15, 0, 0, 6.283); c.stroke();
      c.strokeStyle = dim; c.beginPath(); c.ellipse(X(0), Y(lift), k * 0.22, k * 0.6, 0, 0, 6.283); c.stroke();
      poly([[0, lift + 0.22], [0.14, lift], [0, lift - 0.22], [-0.14, lift]]); c.fillStyle = hsl(a, 100, 80, 0.9); c.fill();
    } else if (type === 'tower') {
      const hgt = 3.4 * tall * (1 + pulse * 0.05), wd = 0.55;
      poly([[-wd, 0], [-wd, hgt], [wd, hgt], [wd, 0]]); c.fillStyle = body; c.fill(); c.strokeStyle = line; c.stroke();
      c.strokeStyle = dim; for (let v = 0.6; v < hgt - 0.2; v += 0.7) { poly([[-wd * 0.7, v], [wd * 0.7, v]], false); c.stroke(); }
      poly([[0, hgt], [0, hgt + 0.9]], false); c.strokeStyle = line; c.stroke();
    } else if (type === 'pine') {
      c.fillStyle = body; c.strokeStyle = line;
      for (let i = 0; i < 3; i++) { const base = 0.5 + i * 0.95 * tall, wd = 0.95 - i * 0.24; poly([[-wd, base], [0, base + 1.5 * tall], [wd, base]]); c.fill(); c.stroke(); }
      poly([[0, 0], [0, 0.5]], false); c.strokeStyle = dim; c.stroke();
    } else {
      const hgt = 3.6 * tall;
      poly([[-0.3, 0], [0.55, hgt], [0.3, 0]]); c.fillStyle = body; c.fill(); c.strokeStyle = line; c.stroke();
      poly([[0.35, 0], [-0.25, hgt * 0.55], [0.75, 0]]); c.fill(); c.strokeStyle = dim; c.stroke();
    }
    c.globalAlpha = 1;
  }

  // --- backdrops (screen space, behind the horizon) ---
  ridge(c, w, hy, heights, amp, shift, fill, stroke) {
    const n = heights.length - 1; c.beginPath(); c.moveTo(-40, hy + 1);
    for (let i = 0; i <= n; i++) c.lineTo(-40 + (w + 80) * i / n - shift, hy - heights[i] * amp * (0.35 + 0.65 * Math.abs(i / n - 0.5) * 2));
    c.lineTo(w + 40, hy + 1); c.closePath(); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); }
  }
  sunset(c, w, hy, a, b, time, pulse, shift) {
    const r = Math.min(w * 0.34, hy * 0.62) * (1 + pulse * 0.03), cx = w / 2, cy = hy - r * 0.42;
    c.globalCompositeOperation = 'lighter'; const halo = c.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.1);
    halo.addColorStop(0, hsl(a, 100, 60, 0.4 + pulse * 0.2)); halo.addColorStop(1, hsl(a, 100, 50, 0)); c.fillStyle = halo; c.fillRect(0, 0, w, hy);
    c.globalCompositeOperation = 'source-over'; c.save(); c.beginPath(); c.rect(0, 0, w, cy + r * 0.05);
    for (let i = 0; i < 6; i++) { const y = cy + r * (0.05 + i * 0.17) + ((time * 6) % (r * 0.17)); c.rect(0, y + 2 + i * 1.2, w, r * 0.17 - 2 - i * 2.2); }
    c.clip(); const sun = c.createLinearGradient(0, cy - r, 0, cy + r);
    sun.addColorStop(0, hsl(52, 100, 66)); sun.addColorStop(0.55, hsl(a + 30, 100, 60)); sun.addColorStop(1, hsl(a, 100, 52)); c.fillStyle = sun;
    c.beginPath(); c.arc(cx, cy, r, 0, 6.283); c.fill(); c.restore();
    this.ridge(c, w, hy, this.ridgeA, hy * 0.3, shift * 0.5, hsl(b, 60, 9), hsl(b, 100, 62, 0.55));
    this.ridge(c, w, hy, this.ridgeB, hy * 0.17, shift, hsl(b, 60, 5), hsl(a, 100, 64, 0.8));
  }
  cosmos(c, w, hy, a, b, time, pulse, shift) {
    c.globalCompositeOperation = 'lighter';
    for (const [px, py, hue, size] of [[0.22, 0.4, b, 0.7], [0.8, 0.62, a, 0.6]]) { const g = c.createRadialGradient(w * px, hy * py, 0, w * px, hy * py, w * size); g.addColorStop(0, hsl(hue, 100, 55, 0.24 + pulse * 0.1)); g.addColorStop(1, hsl(hue, 100, 50, 0)); c.fillStyle = g; c.fillRect(0, 0, w, hy); }
    const t = (time * 0.35) % 1; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - t)})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * (0.1 + t * 0.5), hy * (0.1 + t * 0.3)); c.lineTo(w * (0.1 + t * 0.5) - 26, hy * (0.1 + t * 0.3) - 12); c.stroke();
    c.globalCompositeOperation = 'source-over';
    const r = Math.min(w * 0.2, hy * 0.36) * (1 + pulse * 0.025), cx = w * 0.66 - shift, cy = hy * 0.5;
    const back = () => { c.beginPath(); c.ellipse(cx, cy, r * 1.9, r * 0.5, -0.38, 0, 6.283); };
    c.lineWidth = r * 0.12; c.strokeStyle = hsl(b, 100, 70, 0.55); back(); c.stroke();
    const body = c.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.1, cx, cy, r); body.addColorStop(0, hsl(a, 100, 80)); body.addColorStop(0.6, hsl(a + 30, 90, 48)); body.addColorStop(1, hsl(b, 90, 14));
    c.fillStyle = body; c.beginPath(); c.arc(cx, cy, r, 0, 6.283); c.fill();
    c.save(); c.beginPath(); c.rect(0, cy + r * 0.02 - (cx - 0) * 0, w, hy); c.clip(); c.strokeStyle = hsl(b, 100, 76, 0.9); back(); c.stroke(); c.lineWidth = r * 0.03; c.strokeStyle = hsl(a, 100, 86, 0.9); c.beginPath(); c.ellipse(cx, cy, r * 2.15, r * 0.58, -0.38, 0, 6.283); c.stroke(); c.restore();
    this.ridge(c, w, hy, this.ridgeB, hy * 0.1, shift, hsl(b, 60, 5), hsl(a, 100, 66, 0.7));
  }
  city(c, w, hy, a, b, time, pulse, shift) {
    const mr = Math.min(w * 0.13, hy * 0.24), mx = w * 0.26, my = hy * 0.34;
    c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 3.4); g.addColorStop(0, hsl(a, 100, 70, 0.4)); g.addColorStop(1, hsl(a, 100, 60, 0)); c.fillStyle = g; c.fillRect(0, 0, w, hy);
    c.globalCompositeOperation = 'source-over'; c.fillStyle = hsl(a, 60, 92); c.beginPath(); c.arc(mx, my, mr, 0, 6.283); c.fill();
    for (const [layer, scale, light] of [[0, 0.62, 10], [1, 0.4, 5]]) {
      let x = -30 - shift * (layer ? 1 : 0.5); const unit = w / 11;
      for (let i = layer * 17; x < w + 30; i++) {
        const bld = this.skyline[i % this.skyline.length], bw = unit * bld.w, bh = hy * scale * bld.h * (1 + pulse * 0.1 * bld.bounce);
        c.fillStyle = hsl(b, 55, light); c.fillRect(x, hy - bh, bw - 2, bh + 1);
        c.fillStyle = hsl(layer ? a : b, 100, 66, layer ? 0.95 : 0.6); c.fillRect(x, hy - bh, bw - 2, 1.5);
        if (layer) { c.fillStyle = hsl(a + 20, 100, 72, 0.55 + pulse * 0.35); for (let wy = 0; wy < 4; wy++) for (let wx = 0; wx < 2; wx++) if ((bld.lit >> (wy * 2 + wx)) & 1 && bh > 14 + wy * 10) c.fillRect(x + bw * (0.22 + wx * 0.36), hy - bh + 7 + wy * 10, bw * 0.16, 3); }
        x += bw;
      }
    }
  }
  aurora(c, w, hy, a, b, time, pulse, shift) {
    c.globalCompositeOperation = 'lighter';
    for (let band = 0; band < 3; band++) {
      const hue = [a, b, a + 40][band], top = hy * (0.08 + band * 0.1), tall = hy * (0.55 - band * 0.06), g = c.createLinearGradient(0, top - hy * 0.1, 0, top + tall);
      g.addColorStop(0, hsl(hue, 100, 60, 0)); g.addColorStop(0.35, hsl(hue, 100, 62, 0.3 + pulse * 0.14)); g.addColorStop(1, hsl(hue, 100, 55, 0)); c.fillStyle = g;
      const edge = (x, k) => Math.sin(x * 0.011 * (1 + band * 0.4) + time * (0.5 + band * 0.2) + band * 2 + k) * hy * 0.09;
      c.beginPath(); c.moveTo(0, top + edge(0, 0));
      for (let x = 12; x <= w + 12; x += 12) c.lineTo(x, top + edge(x, 0));
      for (let x = w + 12; x >= 0; x -= 12) c.lineTo(x, top + tall + edge(x, 1.7) * 1.6);
      c.closePath(); c.fill();
    }
    c.lineWidth = 2;
    for (let i = 0; i < 22; i++) { const x = ((i * 0.618 + time * 0.012) % 1) * w, y = hy * (0.1 + (i % 5) * 0.05); c.strokeStyle = hsl(a + i * 6, 100, 70, 0.07 + 0.06 * Math.sin(time * 2 + i)); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + hy * 0.5); c.stroke(); }
    c.globalCompositeOperation = 'source-over';
    this.ridge(c, w, hy, this.ridgeA, hy * 0.26, shift * 0.5, hsl(b, 50, 8), hsl(a, 100, 70, 0.5));
    this.ridge(c, w, hy, this.ridgeB, hy * 0.13, shift, hsl(b, 55, 4), hsl(a, 100, 66, 0.85));
  }
  inferno(c, w, hy, a, b, time, pulse, shift) {
    const r = Math.min(w * 0.27, hy * 0.5), cx = w / 2, cy = hy * 0.56;
    c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * (1.9 + pulse * 0.5));
    g.addColorStop(0, hsl(a + 20, 100, 62, 0.95)); g.addColorStop(0.2, hsl(a, 100, 50, 0.5)); g.addColorStop(1, hsl(a, 100, 40, 0)); c.fillStyle = g; c.fillRect(0, 0, w, hy);
    for (let i = 0; i < 28; i++) { const life = ((time * (0.08 + (i % 5) * 0.03) + i * 0.137) % 1), x = ((i * 0.381) % 1) * w + Math.sin(time + i) * 8; c.fillStyle = hsl(a + 25, 100, 65, (1 - life) * 0.8); c.fillRect(x, hy * (1 - life), 2, 2); }
    c.globalCompositeOperation = 'source-over'; c.fillStyle = hsl(b, 80, 3); c.beginPath(); c.arc(cx, cy, r, 0, 6.283); c.fill();
    c.strokeStyle = hsl(a + 25, 100, 72, 0.9); c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r, 0, 6.283); c.stroke();
    this.ridge(c, w, hy, this.ridgeA, hy * 0.36, shift * 0.5, hsl(b, 70, 6), hsl(a, 100, 50, 0.6));
    this.ridge(c, w, hy, this.ridgeB, hy * 0.2, shift, hsl(b, 70, 3), hsl(a + 20, 100, 60, 0.9));
  }
}
