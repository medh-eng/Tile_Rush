import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Soundtrack} from '../src/audio.js';
import {TRACKS} from '../src/model.js';
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
class FakeAudio {
  constructor(){this.currentTime=0;this.state='suspended';this.destination={};}
  async resume(){this.state='running';}
  async suspend(){this.state='suspended';}
  createGain(){return{gain:param(),connect(){},disconnect(){}};}
  createOscillator(){return{frequency:param(),connect(){},disconnect(){},start(){},stop(at){if(at===undefined)this.onended?.();}};}
}
test('audio lifecycle rewinds stalled frames, freezes, resumes and clears old voices',async()=>{
  globalThis.AudioContext=FakeAudio;
  const sound=new Soundtrack();
  try{
    await sound.start(TRACKS[0]);assert.ok(sound.time<0);
    sound.ctx.currentTime=sound.origin+.4;sound.tick();assert.ok(sound.nodes.size>0);
    await sound.pause(.25);assert.equal(sound.ctx.state,'suspended');assert.equal(sound.time,.25);assert.equal(sound.nodes.size,0);
    await sound.resume();assert.equal(sound.ctx.state,'running');assert.equal(sound.time,.25);
    await sound.stop();assert.equal(sound.timer,null);assert.equal(sound.ctx.state,'suspended');assert.equal(sound.nodes.size,0);
  }finally{await sound.stop();delete globalThis.AudioContext;}
});
test('retries reuse one audio context and preserve mute preference',async()=>{
  globalThis.AudioContext=FakeAudio;const sound=new Soundtrack();
  try{
    sound.setMuted(true);await sound.start(TRACKS[0]);const ctx=sound.ctx;assert.equal(sound.gain.gain.value,0);
    await sound.start(TRACKS[1]);assert.equal(sound.ctx,ctx);assert.equal(sound.gain.gain.value,0);assert.equal(sound.step,0);
  }finally{await sound.stop();delete globalThis.AudioContext;}
});
test('missing Web Audio falls back to a pauseable monotonic clock',async()=>{
  const sound=new Soundtrack();
  try{await sound.start(TRACKS[0]);assert.equal(sound.fallback,true);await sound.pause(-1);const t=sound.time;assert.equal(t,-1);await sound.resume();assert.ok(sound.time>=t);}
  finally{await sound.stop();}
});
