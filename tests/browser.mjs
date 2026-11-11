// Run with npm install --no-save playwright@1.62.1 && npx playwright install chromium.
// The game itself has no runtime dependencies.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=spawn(process.execPath,['server.mjs'],{stdio:'pipe'});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`Server exited: ${code}`)));});
let browser;const errors=[];let tests=0;
const check=(name)=>{tests++;console.log(`PASS ${name}`);};
try{
  browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  await mkdir('test-results',{recursive:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,recordVideo:{dir:'test-results/video',size:{width:390,height:844}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  // Test-only access to the real audio clock. No gameplay backdoor in production.
  await page.addInitScript(()=>{
    const RealAudio=window.AudioContext;
    window.AudioContext=class extends RealAudio{constructor(...args){super(...args);window.testAudio=this;}};
  });
  await page.goto('http://localhost:4173');
  await page.locator('.track').first().waitFor();
  assert.equal(await page.title(),'Tile Rush — Find your flow');
  assert.equal(await page.locator('.track').count(),2);
  for(const size of [{width:320,height:568},{width:360,height:740},{width:390,height:844},{width:430,height:932}]){
    await page.setViewportSize(size);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const play=await page.locator('#play').boundingBox();assert.ok(play.width>=44&&play.height>=44);
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/01-home.png',fullPage:true});check('four portrait layouts, track selection and touch target size');
  await page.getByRole('button',{name:/Night Drive/}).click();
  assert.equal(await page.getByRole('button',{name:/Night Drive/}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:/Afterglow/}).click();
  await page.getByRole('button',{name:"Let's play"}).click();
  await page.waitForFunction(()=>document.querySelector('#score').textContent!=='0');
  assert.ok(await page.locator('#stage').isVisible());
  await page.screenshot({path:'test-results/02-gameplay.png'});check('user gesture unlocks audio and first landing scores');
  await page.getByRole('button',{name:'Pause game'}).click();
  await page.getByRole('heading',{name:'On pause.'}).waitFor();
  const paused=await page.locator('#score').textContent();const audioTime=await page.evaluate(()=>window.testAudio.currentTime);
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>window.testAudio.currentTime),audioTime);
  assert.equal(await page.locator('#score').textContent(),paused);
  await page.getByRole('button',{name:'Resume'}).click();
  await page.getByRole('button',{name:'Mute audio'}).click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Unmute audio'}).click();check('pause freezes audio and score; resume and mute work');
  // Without steering, the first side tile must end the run.
  await page.getByRole('heading',{name:'One more run?'}).waitFor({timeout:12000});
  await page.screenshot({path:'test-results/03-result.png'});check('miss produces a result instead of silently continuing');
  await page.getByRole('button',{name:'Back to tracks'}).click();assert.ok(await page.locator('.best').first().textContent());
  await page.reload();assert.ok(await page.locator('.best').first().textContent());check('personal best survives reload');
  // Play the full chart with real CDP touch input, never changing the game state.
  await page.getByRole('button',{name:"Let's play"}).click();
  await page.waitForFunction(()=>window.testAudio?.state==='running');
  const cdp=await context.newCDPSession(page);
  // Capture the precise first note from its first observable score increment instead.
  await page.waitForFunction(()=>document.querySelector('#score').textContent!=='0');
  const first=await page.evaluate(()=>window.testAudio.currentTime);
  let fingerX=195;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:fingerX,y:680,id:1}]});
  const pattern=[0,0,0,-.5,-.5,0,.5,.5,0,0,-.5,0,.5,0,-.5,-.5];
  for(let i=1;i<64;i++){
    const time=first+(i-.52)*60/110;
    await page.waitForFunction(target=>window.testAudio.currentTime>=target,time,{timeout:2000});
    fingerX=195+pattern[i%16]*390*.36;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:fingerX,y:680,id:1}]});
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.getByRole('heading',{name:'That was a flow.'}).waitFor({timeout:3000});
  assert.ok((await page.locator('#result-stats').textContent()).includes('100%'));
  await page.screenshot({path:'test-results/04-complete.png'});check('full 64-note chart completes using real touch drag input');
  await page.getByRole('button',{name:'Play again'}).click();
  // Force a visibility interruption using another foreground page.
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await page.getByRole('heading',{name:'On pause.'}).waitFor();check('interruption pauses instead of dropping notes');
  await page.getByRole('button',{name:'Back to tracks'}).click();
  await page.setViewportSize({width:844,height:390});await page.getByRole('heading',{name:'A little turn?'}).waitFor();
  await page.getByRole('button',{name:'Continue in portrait frame'}).click();assert.equal(await page.locator('#rotate').isVisible(),false);check('landscape provides a portrait frame option');
  await context.close();
  // Silent fallback and denied storage must still allow play.
  const fallback=await browser.newPage({viewport:{width:360,height:740}});
  fallback.on('pageerror',e=>errors.push(e.message));
  await fallback.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});
  await fallback.goto('http://localhost:4173');await fallback.getByRole('button',{name:"Let's play"}).click();
  await fallback.waitForFunction(()=>document.querySelector('#score').textContent!=='0');check('silent fallback and denied storage remain playable');
  assert.deepEqual(errors,[]);console.log(`All ${tests} browser checks passed; no uncaught errors.`);
}finally{await browser?.close();server.kill();}
