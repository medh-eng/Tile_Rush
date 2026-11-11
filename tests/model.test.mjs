import {test} from 'node:test';import assert from 'node:assert/strict';
import {TRACKS,Run,createChart,judge,clamp} from '../src/model.js';
test('charts are deterministic, have a gentle opening, and align to BPM',()=>{
  for(const track of TRACKS){const a=createChart(track);assert.deepEqual(a,createChart(track));assert.equal(a.length,track.beats);assert.equal(a[0].x,0);assert.equal(a[1].x,0);for(let i=0;i<a.length;i++){assert.ok(Math.abs(a[i].x)<=.5);assert.equal(a[i].time,i*60/track.bpm);if(i)assert.ok(Math.abs(a[i].x-a[i-1].x)<=1);}}
});
test('judgement has explicit forgiving edges',()=>{assert.equal(judge(.1),'perfect');assert.equal(judge(-.26),'good');assert.equal(judge(.261),'miss');});
test('a complete accurate run scores each beat once',()=>{
  const run=new Run(TRACKS[0]);for(const note of run.chart){run.advance(note.time,note.x);run.advance(note.time,note.x);}
  assert.equal(run.status,'complete');assert.equal(run.next,64);assert.equal(run.perfect,64);assert.equal(run.maxCombo,64);assert.equal(run.score,20800);assert.equal(run.progress,1);
});
test('miss terminates without awarding points or consuming a note',()=>{const run=new Run(TRACKS[0]);run.advance(-.01,1);assert.equal(run.status,'playing');run.advance(0,1);assert.equal(run.status,'failed');assert.equal(run.score,0);assert.equal(run.next,0);run.advance(20,0);assert.equal(run.score,0);});
test('edge landings earn a lower score and clamping keeps input on stage',()=>{const run=new Run(TRACKS[0]);run.advance(0,.2);assert.equal(run.good,1);assert.equal(run.score,60);assert.equal(clamp(10),1);assert.equal(clamp(-10),-1);});
