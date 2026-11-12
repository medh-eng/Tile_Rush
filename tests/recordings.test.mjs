import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {RecordingBank} from '../src/recordings.js';
import {TRACKS,GENRES,compile,sectionAt} from '../src/songs.js';
import {createChart,Run,autoX} from '../src/model.js';
const piano=TRACKS.filter(t=>t.recording);
test('three attributed human performances lead the collection, with verified bundled audio',async()=>{
  assert.equal(GENRES[0].id,'piano');assert.equal(piano.length,3);assert.equal(TRACKS.length,28);
  const rights=JSON.parse(await readFile(new URL('../public/music/rights.json',import.meta.url)));
  for(const track of piano){
    const credit=rights.find(r=>r.id===track.id), bytes=await readFile(new URL('../'+track.recording.src,import.meta.url));
    assert.equal(credit.license,'CC0-1.0');assert.equal(credit.performer,'Kimiko Ishizaka');assert.equal(credit.duration,48);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),credit.clipSha256);assert.equal(bytes.length,credit.clipBytes);
    assert.ok(bytes.length<650000);assert.match(credit.sourcePage,/commons.wikimedia.org/);
  }
});
test('performance cues preserve non-grid timing and all three charts are reachable and completable',()=>{
  for(const track of piano){
    const song=compile(track),chart=createChart(track);assert.deepEqual(chart,createChart(track));
    assert.equal(song.duration,48);assert.ok(chart.length>=60);assert.ok(chart.at(-1).time<46.5);
    for(let i=0;i<4;i++)assert.equal(chart[i].x,0);
    assert.ok(chart.some(n=>Math.abs(n.step-Math.round(n.step))>.1),'live attacks are not quantised');
    for(let i=1;i<chart.length;i++){
      assert.ok(chart[i].time-chart[i-1].time>=track.minGap-.001);
      assert.ok(Math.abs(chart[i].x-chart[i-1].x)<=track.reach*(chart[i].time-chart[i-1].time)+.002);
      assert.ok(chart[i].time-chart[i-1].time<1);
    }
    assert.equal(sectionAt(song,25).index,2);
    const run=new Run(track);for(const note of chart)run.advance(note.time,autoX(chart,note.time));
    assert.equal(run.status,'complete');assert.equal(run.stars,3);assert.equal(run.perfect,chart.length);
  }
});
function fakeContext(){
  const voices=[],volumes=[];
  return {currentTime:5,destination:{},voices,volumes,
    createGain:()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},setTargetAtTime(v){volumes.push(v);}},connect(){},disconnect(){}}),
    decodeAudioData:async()=>({duration:48}),
    createBufferSource(){const source={connect(){},disconnect(){},start(at,offset){voices.push({at,offset,source});},stop(){source.stopped=true;}};return source;}
  };
}
test('recordings load once, decode lazily, obey the two-buffer memory cap and retry failures',async()=>{
  const ctx=fakeContext();let calls=0,fail=false;
  const bank=new RecordingBank(ctx,{fetcher:async()=>{calls++;return {ok:!fail,arrayBuffer:async()=>new ArrayBuffer(8)};}});
  await Promise.all([bank.load(piano[0].recording),bank.load(piano[0].recording)]);assert.equal(calls,1);
  await bank.load(piano[1].recording);await bank.load(piano[2].recording);assert.equal(bank.buffers.size,2);
  assert.equal(bank.buffers.has(piano[0].recording.src),false);
  fail=true;await assert.rejects(bank.load(piano[0].recording));assert.equal(bank.pending.size,0);
  fail=false;await bank.load(piano[0].recording);assert.equal(bank.buffers.size,2);
});
test('recorded seek schedules exact offsets and pause/stop removes the previous voice',()=>{
  const ctx=fakeContext(),bank=new RecordingBank(ctx);bank.play({duration:48},7,0);assert.deepEqual(ctx.voices.map(v=>[v.at,v.offset]),[[7,0]]);
  bank.play({duration:48},8,20.35);assert.ok(ctx.voices[0].source.stopped);assert.equal(ctx.voices[1].offset,20.35);
  bank.setVolume(0);assert.equal(ctx.volumes.at(-1),0);bank.stop();assert.ok(ctx.voices[1].source.stopped);assert.equal(bank.active,null);
});
