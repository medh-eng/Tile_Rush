import {TRACKS,Run,clamp} from './model.js';
import {Soundtrack} from './audio.js';
import {Renderer} from './renderer.js';
const $=id=>document.getElementById(id);
const sound=new Soundtrack();
let selected=TRACKS[0],run=null,renderer=null,mode='home',x=0,pointer=null,lastFrame=0,raf=0,feedbackUntil=-1,busy=false,landscapeDismissed=false,lastTime=0,interrupted=false;
const keys=new Set();
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Private mode still plays. */}}
let records=read('tile-rush-records',{});
if(!records||typeof records!=='object'||Array.isArray(records))records={};
sound.setMuted(read('tile-rush-muted',false)===true);
function syncSound(){$('sound').textContent=sound.muted?'♪̸':'♫';$('sound').setAttribute('aria-pressed',String(sound.muted));$('sound').setAttribute('aria-label',sound.muted?'Unmute audio':'Mute audio');}
syncSound();
function renderTracks(){
  $('tracks').replaceChildren();
  for(const track of TRACKS){
    const button=document.createElement('button');button.className='track';button.setAttribute('aria-pressed',String(selected.id===track.id));
    button.innerHTML=`<span class="album" aria-hidden="true">${track.id==='afterglow'?'◈':'≋'}</span><span><span class="track-title">${track.title}</span><span class="track-info">${track.bpm} BPM &nbsp;·&nbsp; ${Math.ceil(track.beats*60/track.bpm)} SEC <span class="best"></span></span></span><span class="difficulty">${track.difficulty}</span><span class="selection" aria-hidden="true"></span>`;
    const best=Number(records[track.id])||0;if(best)button.querySelector('.best').textContent=`BEST ${best}`;
    button.addEventListener('click',()=>{selected=track;renderTracks();$('tracks').children[TRACKS.indexOf(track)].focus({preventScroll:true});});
    $('tracks').append(button);
  }
}
renderTracks();
function resetPointer(){pointer=null;keys.clear();}
function updateHud(){
  $('score').textContent=run.score.toLocaleString();$('progress-fill').style.width=`${run.progress*100}%`;
  $('beat-count').textContent=`${run.next} / ${run.chart.length}`;
  $('combo').textContent=run.combo?`${run.combo} COMBO · ×${Math.min(4,1+Math.floor((run.combo-1)/8))}`:'FIND YOUR FLOW';
}
async function start(){
  if(busy)return;busy=true;$('play').disabled=true;$('modal-primary').disabled=true;
  try{
    cancelAnimationFrame(raf);resetPointer();x=0;run=new Run(selected);mode='starting';interrupted=false;feedbackUntil=-1;
    $('home').hidden=true;$('game').hidden=false;$('modal').hidden=true;$('tutorial').hidden=false;
    $('game-track').textContent=selected.title.toUpperCase();$('feedback').textContent='';
    renderer ||= new Renderer($('stage'));renderer.effects=[];renderer.resize();updateHud();renderer.draw(run,-2,0);
    await sound.start(selected);lastTime=sound.time;mode='playing';lastFrame=performance.now();
    if(document.hidden||interrupted){await pause();}else{raf=requestAnimationFrame(frame);$('stage').focus({preventScroll:true});}
  }finally{busy=false;$('play').disabled=false;$('modal-primary').disabled=false;}
}
function frame(stamp){
  if(mode!=='playing')return;
  const dt=(stamp-lastFrame)/1000;lastFrame=stamp;
  // Do not award or miss several notes against one late input sample.
  if(dt>.3||(!sound.fallback&&sound.ctx.state!=='running')){pause();return;}
  const direction=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);
  x=clamp(x+direction*dt*2.2);
  const time=sound.time;
  if(time<0){$('feedback').textContent=String(Math.ceil(-time/(60/selected.bpm)));}
  else{
    run.advance(time,x,(result,note)=>{
      if(result==='miss')return;
      renderer.hit(note.x,selected.colour);$('feedback').innerHTML=`${result==='perfect'?'PERFECT':'NICE'}<small>${run.combo>1?`${run.combo} IN THE FLOW`:'YOU’VE GOT THIS'}</small>`;feedbackUntil=time+.35;
    });
    if(time>feedbackUntil)$('feedback').textContent='';
    $('tutorial').hidden=time>5;updateHud();
  }
  lastTime=time;renderer.draw(run,time,x,dt);
  if(run.status!=='playing'){finish();return;}
  raf=requestAnimationFrame(frame);
}
function showDialog(kicker,title,copy,primary){
  $('modal-kicker').textContent=kicker;$('modal-title').textContent=title;$('modal-copy').textContent=copy;
  $('modal-primary').innerHTML=`${primary} <span>↗</span>`;$('modal').hidden=false;$('modal-primary').focus({preventScroll:true});
}
async function pause(){
  if(mode!=='playing')return;mode='paused';cancelAnimationFrame(raf);resetPointer();
  $('result-stats').hidden=true;showDialog('TAKE A BREATHER','On pause.','Your rhythm will be right here.','Resume');
  await sound.pause(lastTime);
}
async function resume(){
  if(busy)return;busy=true;$('modal-primary').disabled=true;
  try{
    interrupted=false;mode='resuming';await sound.resume();mode='playing';
    if(document.hidden||interrupted){await pause();return;}
    $('modal').hidden=true;lastFrame=performance.now();raf=requestAnimationFrame(frame);$('stage').focus({preventScroll:true});
  }
  finally{busy=false;$('modal-primary').disabled=false;}
}
function finish(){
  mode='result';resetPointer();sound.stop();
  const best=Number(records[selected.id])||0,newBest=run.score>best;
  if(newBest){records[selected.id]=run.score;write('tile-rush-records',records);}
  $('result-stats').innerHTML=`<div><strong>${run.score.toLocaleString()}</strong><small>SCORE</small></div><div><strong>${run.maxCombo}</strong><small>BEST COMBO</small></div><div><strong>${Math.round(run.progress*100)}%</strong><small>COMPLETE</small></div>`;
  $('result-stats').hidden=false;
  showDialog(run.status==='complete'?'TRACK COMPLETE':newBest?'A NEW PERSONAL BEST':'KEEP THE FEELING',run.status==='complete'?'That was a flow.':'One more run?',run.status==='complete'?`${run.perfect} perfect landings. Try the other track or beat your score.`:'Missed a tile. Drag towards the next glowing platform before the ball lands.','Play again');
}
function home(){
  if(busy)return;cancelAnimationFrame(raf);sound.stop();resetPointer();mode='home';$('modal').hidden=true;$('game').hidden=true;$('home').hidden=false;renderTracks();$('play').focus({preventScroll:true});
}
$('play').addEventListener('click',start);$('pause').addEventListener('click',pause);
$('sound').addEventListener('click',()=>{sound.setMuted(!sound.muted);write('tile-rush-muted',sound.muted);syncSound();});
$('modal-primary').addEventListener('click',()=>mode==='paused'?resume():start());$('home-button').addEventListener('click',home);
const canvas=$('stage');
canvas.addEventListener('pointerdown',e=>{if(mode!=='playing'||pointer||!e.isPrimary||e.button!==0)return;pointer={id:e.pointerId,last:e.clientX};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(mode!=='playing'||pointer?.id!==e.pointerId)return;const width=canvas.getBoundingClientRect().width;x=clamp(x+(e.clientX-pointer.last)/(width*.36));pointer.last=e.clientX;});
canvas.addEventListener('pointerup',e=>{if(pointer?.id===e.pointerId)pointer=null;});
canvas.addEventListener('pointercancel',e=>{if(pointer?.id===e.pointerId){pointer=null;pause();}});
canvas.addEventListener('lostpointercapture',e=>{if(pointer?.id===e.pointerId){pointer=null;pause();}});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&mode==='playing'){pause();return;}
  if(mode!=='playing')return;
  if(['ArrowLeft','ArrowRight','a','d'].includes(e.key)){e.preventDefault();keys.add(e.key);}
});
window.addEventListener('keyup',e=>keys.delete(e.key));
// Keep keyboard focus within the modal; returning home/resuming restores it.
$('modal').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const first=$('modal-primary'),last=$('home-button');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
function interrupt(){
  resetPointer();
  if(mode==='starting'||mode==='resuming'){interrupted=true;return;}
  pause();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();});
window.addEventListener('blur',interrupt);
window.addEventListener('pagehide',interrupt);
function resize(){
  renderer?.resize();const landscape=innerWidth>innerHeight&&innerHeight<600;
  $('rotate').hidden=!landscape||landscapeDismissed;if(landscape&&!landscapeDismissed)pause();
  if(!landscape)landscapeDismissed=false;
  if(run&&mode!=='playing')renderer?.draw(run,lastTime,x);
}
window.addEventListener('resize',resize);$('landscape-continue').addEventListener('click',()=>{landscapeDismissed=true;$('rotate').hidden=true;});resize();
