// End-to-end checks in mobile-emulated Chromium.
// Run with: npm install --no-save --package-lock=false playwright@1.62.1 && npm run test:browser
// The game itself has no runtime dependencies.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { TRACKS, GENRES, createChart, autoX } from '../src/model.js';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const port = process.env.PORT || '4173', url = `http://localhost:${port}`;
const server = spawn(process.execPath, ['server.mjs'], { stdio: 'pipe', env: { ...process.env, PORT: port } });
await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); server.once('exit', (code) => reject(new Error(`Server exited: ${code}`))); });
let browser; const errors = []; let tests = 0;
const check = (name) => { tests++; console.log(`PASS ${name}`); };
const tap = (locator) => locator.click({ force: true }); // buttons animate, so skip the stability wait
// Menus are two pages: genres, then that genre's tracks.
const openGenre = async (page, genre) => { await tap(page.locator(`.genre[data-id="${genre.id}"]`)); await page.locator('.track').first().waitFor(); };
const openTrack = async (page, track) => {
  if (await page.locator('#home').isVisible()) await openGenre(page, GENRES.find((g) => g.id === track.genre));
  await tap(page.locator(`.track[data-id="${track.id}"]`));
};
try {
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  await mkdir('test-results', { recursive: true });
  const options = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
  const context = await browser.newContext({ ...options, ...(process.env.NO_VIDEO ? {} : { recordVideo: { dir: 'test-results/video', size: { width: 390, height: 844 } } }) });
  const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
  // Test-only handle on the real audio context; the game exposes only a read-only clock.
  await page.addInitScript(() => { const Real = window.AudioContext; window.AudioContext = class extends Real { constructor(...args) { super(...args); window.testAudio = this; } }; });
  await page.goto(url);
  await page.locator('.genre').first().waitFor();
  assert.equal(await page.title(), 'Tile Rush');
  assert.equal(await page.locator('.genre').count(), GENRES.length);
  for (const size of [{ width: 320, height: 568 }, { width: 360, height: 740 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(size);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const logo = await page.locator('.logo h1').boundingBox(), list = await page.locator('#genres').boundingBox(), first = await page.locator('.genre').first().boundingBox();
    assert.ok(logo.y + logo.height <= list.y && first.height >= 44, `logo clears the genre list at ${size.width}x${size.height}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => window.tileRush.time > 1); // the silent menu preview is running
  await page.screenshot({ path: 'test-results/01-home.png' }); check('home lists all seven genres and fits four portrait sizes; live preview runs');

  for (const genre of GENRES) {
    await openGenre(page, genre);
    assert.equal(await page.locator('.track').count(), genre.tracks.length); assert.equal(await page.locator('#genre-name').textContent(), genre.name);
    assert.deepEqual(await page.locator('.track-title').allTextContents(), genre.tracks.map((t) => t.title));
    for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(size); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const play = await page.locator('#play').boundingBox(); assert.ok(play.height >= 44 && play.y + play.height <= size.height, `play is on screen at ${size.width}x${size.height}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    if (['trance', 'pop', 'rock'].includes(genre.id)) await page.screenshot({ path: genre.id === 'trance' ? 'test-results/02-genre.png' : `test-results/02-genre-${genre.id}.png` });
    await tap(page.locator('#back')); await page.locator('.genre').first().waitFor();
  }
  check('each genre opens a page with all of its tracks, and Play stays reachable');

  await openGenre(page, GENRES[0]);
  await tap(page.locator('.track').nth(1));
  assert.equal(await page.locator('.track').nth(1).getAttribute('aria-pressed'), 'true');
  await page.waitForFunction(() => window.testAudio?.state === 'running'); check('choosing a track starts its audible preview');
  await tap(page.locator('.track').first());
  await tap(page.locator('#play'));
  await page.waitForFunction(() => document.querySelector('#score').textContent !== '0');
  assert.equal(await page.evaluate(() => window.tileRush.mode), 'playing');
  await page.screenshot({ path: 'test-results/03-gameplay.png' }); check('play starts after a count-in and the first centred tiles score');

  await tap(page.locator('#pause'));
  await page.getByRole('heading', { name: 'Paused' }).waitFor();
  const paused = await page.locator('#score').textContent(), audioTime = await page.evaluate(() => window.testAudio.currentTime), songTime = await page.evaluate(() => window.tileRush.time);
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => window.testAudio.currentTime), audioTime);
  assert.equal(await page.evaluate(() => window.tileRush.time), songTime);
  assert.equal(await page.locator('#score').textContent(), paused);
  await tap(page.getByRole('button', { name: 'RESUME' }));
  await page.waitForFunction(() => window.tileRush.mode === 'countdown');
  await page.waitForFunction(() => window.tileRush.mode !== 'countdown', null, { timeout: 5000 });
  await tap(page.locator('#sound')); assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'true');
  await tap(page.locator('#sound')); check('pause freezes audio, clock and score; resume counts back in; mute toggles');

  // Without steering, the first off-centre tile ends the run. One continue is offered.
  await page.getByRole('heading', { name: 'Missed!' }).waitFor({ timeout: 15000 });
  await page.screenshot({ path: 'test-results/04-missed.png' });
  await tap(page.getByRole('button', { name: 'CONTINUE' }));
  await page.waitForFunction(() => window.tileRush.mode === 'playing', null, { timeout: 5000 });
  await page.getByRole('heading', { name: 'Missed!' }).waitFor({ timeout: 15000 });
  assert.equal(await page.getByRole('button', { name: 'CONTINUE' }).count(), 0);
  await page.getByRole('button', { name: 'TRY AGAIN' }).waitFor(); check('a miss ends the run; one continue, then try again');
  await tap(page.getByRole('button', { name: 'Back to tracks' }));
  assert.equal(await page.locator('#genre').isVisible(), true); assert.match(await page.locator('.track[data-id="neon-horizon"] .best').textContent(), /BEST/);
  await page.reload(); await openGenre(page, GENRES[0]); assert.match(await page.locator('.track[data-id="neon-horizon"] .best').textContent(), /BEST/); check('Back to tracks returns to the genre page; personal best survives reload');

  // Play a whole track with real touch input, steering from the read-only clock.
  const track = TRACKS.find((t) => t.id === (process.env.TRACK || 'neon-horizon')), chart = createChart(track), cdp = await context.newCDPSession(page);
  await page.locator('#genre').isVisible() ? await tap(page.locator('#back')) : null;
  await openTrack(page, track);
  await tap(page.locator('#play'));
  await page.waitForFunction(() => window.tileRush.mode === 'playing');
  let finger = 195; const pxPerLane = 390 * 0.42 / 1.15, touch = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: 640, id: 1 }] });
  await touch('touchStart', finger);
  const deadline = Date.now() + 150000; let last = null; // no screenshots inside this loop: capturing stalls steering long enough to miss a tile
  await page.waitForFunction(() => window.tileRush.x === 0);
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({ time: window.tileRush.time, x: window.tileRush.x, mode: window.tileRush.mode }));
    if (state.mode === 'countdown') continue;
    // A stalled frame on a busy CI machine pauses the game by design: resume and carry on.
    if (state.mode === 'paused') { await touch('touchEnd'); await tap(page.getByRole('button', { name: 'RESUME' })); await page.waitForFunction(() => window.tileRush.mode === 'playing', null, { timeout: 8000 }); finger = 195 + (await page.evaluate(() => window.tileRush.x)) * pxPerLane; await touch('touchStart', finger); continue; }
    if (state.mode !== 'playing') break;
    const target = autoX(chart, state.time + 0.06);
    // Drag is relative and linear, so with the finger down at centre while x = 0, ball x maps to one finger position.
    finger = 195 + target * pxPerLane; await touch('touchMove', finger); last = state;
  }
  await touch('touchEnd');
  assert.equal(await page.evaluate(() => window.tileRush.mode), 'complete', `the steered run reached the end of the track (last seen ${JSON.stringify(last)})`);
  await page.locator('#modal-stars').waitFor({ timeout: 8000 });
  assert.equal(await page.locator('#modal-title').textContent(), track.title);
  assert.equal(await page.locator('#modal-stars i.on').count(), 3);
  await page.waitForTimeout(700); await page.screenshot({ path: 'test-results/05-result.png' });
  await tap(page.getByRole('button', { name: 'Back to tracks' }));
  assert.equal(await page.locator(`.track[data-id="${track.id}"] .stars b`).textContent(), '★★★'); check(`a complete ${track.title} run with real touch input earns three stars`);

  await page.setViewportSize({ width: 740, height: 360 });
  assert.ok(await page.locator('#rotate').isVisible()); check('landscape phones are asked to rotate');
  await context.close();

  const silent = await browser.newContext(options), quiet = await silent.newPage(); quiet.on('pageerror', (e) => errors.push(e.message));
  await quiet.addInitScript(() => { delete window.AudioContext; delete window.webkitAudioContext; Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }); });
  await quiet.goto(url); await tap(quiet.locator('.genre').first()); await tap(quiet.locator('#play'));
  await quiet.waitForFunction(() => document.querySelector('#score').textContent !== '0', null, { timeout: 15000 }); check('plays silently without Web Audio or storage');
  await silent.close();
  assert.deepEqual(errors, []); check('no uncaught page errors');
  console.log(`${tests} browser checks passed`);
} finally { await browser?.close(); server.kill(); }
