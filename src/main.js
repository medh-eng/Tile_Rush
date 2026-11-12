// Screen flow, input and persistence. The soundtrack clock is the only source of game time.
import { TRACKS, Run, clamp, autoX } from './model.js';
import { compile } from './songs.js';
import { Soundtrack } from './audio.js';
import { Renderer, themeColours } from './renderer.js';

const $ = (id) => document.getElementById(id);
const demo = new URLSearchParams(location.search).has('demo'); // ?demo steers automatically (for capture and checks)
const SENSITIVITY = 1.15, STORE = 'tile-rush-records-v2';
const sound = new Soundtrack(), canvas = $('stage'), renderer = new Renderer(canvas);
const keys = new Set();
let selected = TRACKS[0], run = null, mode = 'home', x = 0, pointer = null, raf = 0, lastFrame = 0, lastTime = 0;
let fallAt = 0, endAt = 0, busy = false, unlocked = false, seq = 0, timers = [], previewFrom = 0, previewTo = 0, countShown = '', actions = {};

function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode still plays */ } }
let records = read(STORE, {});
if (!records || typeof records !== 'object' || Array.isArray(records)) records = {};
const record = (id) => { const r = records[id]; return r && typeof r === 'object' ? { score: Number(r.score) || 0, stars: clamp(Number(r.stars) || 0, 0, 3) } : { score: 0, stars: 0 }; };
sound.setMuted(read('tile-rush-muted', false) === true);

function syncSound() {
  for (const id of ['sound', 'sound-home']) { $(id).setAttribute('aria-pressed', String(sound.muted)); $(id).setAttribute('aria-label', sound.muted ? 'Unmute audio' : 'Mute audio'); }
}
function toggleSound() { sound.setMuted(!sound.muted); write('tile-rush-muted', sound.muted); syncSound(); }
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const loop = () => { if (!raf) raf = requestAnimationFrame(frame); };
const stopLoop = () => { cancelAnimationFrame(raf); raf = 0; };
const still = () => { if (run) renderer.draw({ run, time: lastTime, x, dt: 0 }); };
const buzz = (ms) => { try { navigator.vibrate?.(ms); } catch { /* unsupported */ } };
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
const starText = (n) => `<b>${'★'.repeat(n)}</b>${'★'.repeat(3 - n)}`;

// --- home ---
function renderTracks() {
  $('tracks').replaceChildren();
  let total = 0;
  for (const track of TRACKS) {
    const best = record(track.id), song = compile(track), button = document.createElement('button');
    total += best.stars;
    button.className = 'track'; button.dataset.id = track.id; button.style.setProperty('--th', themeColours(track.theme).a);
    button.setAttribute('aria-pressed', String(selected.id === track.id));
    button.innerHTML = `<span class="disc" aria-hidden="true"></span><span class="track-title">${track.title}</span><span class="track-info">${track.genre} · ${track.bpm} BPM · ${clock(song.duration)}</span><span class="track-foot"><span class="level">${track.difficulty.toUpperCase()}</span><span class="stars" aria-label="${best.stars} of 3 stars">${starText(best.stars)}</span><span class="best">${best.score ? `BEST ${best.score.toLocaleString()}` : ''}</span></span>`;
    button.addEventListener('click', () => select(track, true));
    $('tracks').append(button);
  }
  $('total-stars').textContent = `★ ${total} / ${TRACKS.length * 3}`;
}
function select(track, audible) {
  selected = track; unlocked ||= audible;
  document.documentElement.style.setProperty('--h', themeColours(track.theme).a);
  for (const card of $('tracks').children) {
    const on = card.dataset.id === track.id; card.setAttribute('aria-pressed', String(on));
    if (on) card.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }
  preview();
}
/** The menu backdrop: the selected track's drop, played by an autopilot. Audible once the player has tapped a track. */
async function preview() {
  const id = ++seq, song = compile(selected), drop = song.sections.find((s) => s.e >= 1) || song.sections[0];
  previewFrom = drop.time; previewTo = drop.time + drop.bars * 16 * song.s16;
  const ok = await sound.start(selected, { at: previewFrom, silent: !unlocked, level: 0.6 });
  if (!ok || id !== seq || mode !== 'home') return;
  run = new Run(selected); run.skipTo(previewFrom); renderer.setRun(run); x = autoX(run.chart, previewFrom); loop();
}
function home() {
  if (busy) return;
  seq++; clearTimers(); resetInput(); mode = 'home';
  $('modal').hidden = true; $('hud').hidden = true; $('home').hidden = false;
  renderTracks(); select(selected, false);
  $('tracks').querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
}

// --- play ---
function resetInput() { pointer = null; keys.clear(); }
function resetHud() {
  $('score').textContent = '0'; $('progress-fill').style.width = '0%'; $('hud-track').textContent = selected.title;
  $('feedback').className = 'feedback'; $('feedback').textContent = ''; $('multiplier').hidden = true; setCount('');
  document.querySelectorAll('.star-mark').forEach((el) => el.classList.remove('on'));
}
function setCount(text) {
  if (text === countShown) return; countShown = text;
  const el = $('count'); el.textContent = text; el.className = `count${text.length > 1 ? ' word' : ''}`;
  if (text) { void el.offsetWidth; el.classList.add('tick'); }
}
function say(kind, html) {
  const el = $('feedback'); el.className = `feedback ${kind}`; el.innerHTML = html; void el.offsetWidth; el.classList.add('pop');
}
function updateHud() {
  const text = run.score.toLocaleString(), score = $('score');
  if (score.textContent !== text) { score.textContent = text; score.classList.remove('bump'); void score.offsetWidth; score.classList.add('bump'); }
  $('progress-fill').style.width = `${run.progress * 100}%`;
  document.querySelectorAll('.star-mark').forEach((el, i) => el.classList.toggle('on', run.stars > i));
  const badge = $('multiplier'); badge.hidden = run.multiplier < 2;
  if (!badge.hidden) { badge.textContent = run.fever ? `FEVER ×${run.multiplier}` : `×${run.multiplier}`; badge.classList.toggle('fever', run.fever); }
}
async function start() {
  if (busy) return; busy = true; unlocked = true;
  const id = ++seq;
  try {
    stopLoop(); clearTimers(); resetInput(); mode = 'starting';
    document.documentElement.style.setProperty('--h', themeColours(selected.theme).a);
    run = new Run(selected); x = 0; renderer.setRun(run); lastTime = -run.song.beat * 4;
    $('home').hidden = true; $('modal').hidden = true; $('hud').hidden = false; resetHud();
    $('tutorial').hidden = Object.keys(records).length > 0;
    renderer.resize(); still();
    await sound.start(selected);
  } finally { busy = false; }
  if (id !== seq) return;
  mode = 'playing'; lastFrame = performance.now(); loop(); canvas.focus({ preventScroll: true });
  if (document.hidden) pause();
}
function onHit(result, note, gainedStar) {
  if (result === 'miss') return;
  renderer.hit(note, result, run.streak);
  if (gainedStar && run.status !== 'complete') { sound.chime('star'); say('star', `★ STAR ${run.stars}`); }
  else if (result === 'perfect') { say('perfect', `PERFECT${run.streak > 1 ? `<small>×${run.streak}</small>` : ''}`); }
  else say('good', 'GOOD');
  if (result === 'perfect') buzz(6);
}
function frame(stamp) {
  raf = 0;
  const elapsed = stamp - lastFrame, dt = Math.min(0.1, Math.max(0, elapsed / 1000)); lastFrame = stamp;
  if (mode === 'home') {
    if (sound.track && run) {
      let time = sound.time;
      if (time > previewTo) { sound.seek(previewFrom); time = previewFrom; run.skipTo(time); }
      x = autoX(run.chart, time);
      run.advance(time, x, (result, note) => { if (result !== 'miss') renderer.hit(note, result, 0); });
      if (run.status !== 'playing') run.skipTo(time);
      lastTime = time; renderer.draw({ run, time, x, dt });
    }
  } else if (mode === 'playing') {
    // A stalled frame or a suspended audio clock must never judge tiles against stale input.
    if (elapsed > 300 || (!sound.silent && sound.ctx.state !== 'running')) { pause(); return; }
    const direction = (keys.has('ArrowRight') || keys.has('d') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('a') ? 1 : 0);
    x = clamp(x + direction * dt * 2.4);
    const time = sound.time, beat = run.song.beat;
    if (demo) x = autoX(run.chart, time);
    if (time < 0) { const n = Math.ceil(-time / beat); setCount(n > 3 ? 'READY' : String(n)); } else setCount('');
    run.advance(time, x, onHit);
    if (time > 7) $('tutorial').hidden = true;
    lastTime = time; updateHud(); renderer.draw({ run, time, x, dt });
    if (run.status === 'failed') { fail(stamp); }
    else if (run.status === 'complete') { complete(time); }
  } else if (mode === 'failed') {
    const fall = (stamp - fallAt) / 1000; renderer.draw({ run, time: lastTime, x, dt, fall });
    if (fall > 0.85) { showFail(); return; }
  } else if (mode === 'complete' || mode === 'result') {
    const time = sound.time; lastTime = time; renderer.draw({ run, time, x, dt });
    if (time > endAt) { sound.stop(); return; }
  } else return;
  loop();
}
function dialog({ kicker, title, copy = '', stars = -1, stats = '', primary, secondary }) {
  $('modal-kicker').textContent = kicker; $('modal-title').textContent = title; $('modal-copy').textContent = copy;
  $('modal-stars').hidden = stars < 0;
  [...$('modal-stars').children].forEach((el, i) => { el.classList.remove('on'); if (i < stars) { void el.offsetWidth; el.classList.add('on'); } });
  $('result-stats').hidden = !stats; $('result-stats').innerHTML = stats;
  $('modal-primary').textContent = primary[0]; $('modal-secondary').hidden = !secondary; if (secondary) $('modal-secondary').textContent = secondary[0];
  actions = { primary: primary[1], secondary: secondary?.[1] };
  $('modal').hidden = false; $('modal-primary').focus({ preventScroll: true });
}
const stat = (value, label) => `<div><strong>${value}</strong><small>${label}</small></div>`;
function save() {
  const best = record(selected.id), better = run.score > best.score;
  if (demo) return false; // autopilot runs never count
  records[selected.id] = { score: Math.max(best.score, run.score), stars: Math.max(best.stars, run.stars) }; write(STORE, records);
  return better;
}
async function pause() {
  if (mode !== 'playing' && mode !== 'countdown') return;
  mode = 'paused'; stopLoop(); clearTimers(); resetInput(); setCount('');
  dialog({ kicker: selected.title, title: 'Paused', copy: 'The beat waits for you.', primary: ['RESUME', () => countdown(resume)], secondary: ['RESTART', start] });
  await sound.pause(lastTime);
}
/** 3-2-1 before play continues, so the player can find the ball again. */
function countdown(done) {
  $('modal').hidden = true; mode = 'countdown'; still();
  ['3', '2', '1'].forEach((n, i) => later(() => setCount(n), i * 550));
  later(() => { setCount(''); done(); }, 1650);
}
async function resume() {
  if (busy) return; busy = true;
  try { await sound.resume(); } finally { busy = false; }
  if (mode !== 'countdown') return;
  mode = 'playing'; lastFrame = performance.now(); loop(); canvas.focus({ preventScroll: true });
  if (document.hidden) pause();
}
function fail(stamp) {
  mode = 'failed'; fallAt = stamp; resetInput(); buzz(70);
  sound.pause(lastTime, { suspend: false }); sound.chime('fail');
}
function showFail() {
  const better = save(), canContinue = !run.revived;
  dialog({
    kicker: better ? 'New personal best' : `${Math.round(run.progress * 100)}% of ${selected.title}`, title: 'Missed!',
    stats: stat(run.score.toLocaleString(), 'SCORE') + stat(`${Math.round(run.progress * 100)}%`, 'PROGRESS') + stat(run.bestStreak, 'BEST STREAK'),
    copy: canContinue ? 'One second chance per run. Pick up right where you fell.' : 'Slide towards the next tile before the ball comes down.',
    primary: canContinue ? ['CONTINUE', revive] : ['TRY AGAIN', start], secondary: canContinue ? ['RESTART', start] : null,
  });
}
function revive() {
  const spot = run.revive(); if (!spot) return start();
  x = spot.x; lastTime = spot.time; sound.rewind(spot.time); renderer.trail = []; updateHud(); countdown(resume);
}
function complete(time) {
  mode = 'complete'; endAt = time + 8; resetInput(); setCount('');
  renderer.celebrate(time); sound.chime('win'); buzz(40);
  later(() => {
    const better = save(), index = TRACKS.indexOf(selected), next = TRACKS[index + 1];
    mode = 'result';
    dialog({
      kicker: better ? 'New personal best' : 'Track complete', title: selected.title, stars: run.stars,
      stats: stat(run.score.toLocaleString(), 'SCORE') + stat(`${Math.round(run.perfect / run.chart.length * 100)}%`, 'PERFECT') + stat(run.bestStreak, 'BEST STREAK'),
      primary: next ? ['NEXT TRACK', () => { selected = next; start(); }] : ['PLAY AGAIN', start], secondary: next ? ['PLAY AGAIN', start] : null,
    });
  }, 1500);
}

// --- wiring ---
$('play').addEventListener('click', start); $('pause').addEventListener('click', pause);
$('sound').addEventListener('click', toggleSound); $('sound-home').addEventListener('click', toggleSound);
$('modal-primary').addEventListener('click', () => actions.primary?.()); $('modal-secondary').addEventListener('click', () => actions.secondary?.());
$('home-button').addEventListener('click', home);
canvas.addEventListener('pointerdown', (e) => {
  if (mode !== 'playing' || pointer || !e.isPrimary || e.button !== 0) return;
  pointer = { id: e.pointerId, last: e.clientX }; try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
});
canvas.addEventListener('pointermove', (e) => {
  if (mode !== 'playing' || pointer?.id !== e.pointerId) return;
  // Relative drag: the ball follows finger movement, never the finger's absolute position.
  x = clamp(x + (e.clientX - pointer.last) / (renderer.w * 0.42) * SENSITIVITY); pointer.last = e.clientX;
  if (!$('tutorial').hidden && lastTime > 1.5) $('tutorial').hidden = true;
});
canvas.addEventListener('pointerup', (e) => { if (pointer?.id === e.pointerId) pointer = null; });
canvas.addEventListener('pointercancel', (e) => { if (pointer?.id === e.pointerId) { pointer = null; pause(); } });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mode === 'playing') { pause(); return; }
  if (mode !== 'playing') return;
  if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) { e.preventDefault(); keys.add(e.key); }
});
window.addEventListener('keyup', (e) => keys.delete(e.key));
// Keep keyboard focus inside the open dialog.
$('modal').addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const items = [...$('modal').querySelectorAll('button:not([hidden])')], first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
function interrupt() {
  resetInput();
  if (mode === 'home') { seq++; stopLoop(); sound.stop(); }
  else pause();
}
document.addEventListener('visibilitychange', () => { if (document.hidden) interrupt(); else if (mode === 'home') preview(); });
window.addEventListener('blur', () => { if (mode === 'playing' || mode === 'countdown') pause(); });
window.addEventListener('pagehide', interrupt);
window.addEventListener('resize', () => { renderer.resize(); if (!raf) still(); });

// Read-only view of the clock and ball for automated browser checks.
globalThis.tileRush = { get time() { return sound.time; }, get x() { return x; }, get mode() { return mode; } };

syncSound(); renderTracks(); select(selected, false);
