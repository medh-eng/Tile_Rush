export const TRACKS = [
  {id:'afterglow',title:'Afterglow',artist:'TILE RUSH ORIGINAL',bpm:110,beats:64,difficulty:'Easy',colour:'#baff65',notes:[69,72,76,79,76,72,67,72],bass:[45,41,48,43]},
  {id:'night-drive',title:'Night Drive',artist:'TILE RUSH ORIGINAL',bpm:126,beats:80,difficulty:'Medium',colour:'#69ddff',notes:[66,69,73,76,73,69,64,68],bass:[42,38,45,40]},
];
export const clamp=(x,a=-1,b=1)=>Math.max(a,Math.min(b,x));
export function createChart(track) {
  const easy=[0,0,0,-.5,-.5,0,.5,.5,0,0,-.5,0,.5,0,-.5,-.5];
  const medium=[0,0,-.5,0,.5,.5,0,-.5,-.5,.5,0,-.5,0,.5,-.5,0];
  return Array.from({length:track.beats},(_,i)=>({index:i,time:i*60/track.bpm,x:(track.id==='afterglow'?easy:medium)[i%16]}));
}
export function judge(distance) { return Math.abs(distance)<=.26 ? (Math.abs(distance)<=.10?'perfect':'good') : 'miss'; }
export class Run {
  constructor(track) {this.track=track;this.chart=createChart(track);this.next=0;this.score=0;this.combo=0;this.maxCombo=0;this.perfect=0;this.good=0;this.status='playing';this.lastJudgement=null;}
  advance(time,x,onHit=()=>{}) {
    // Each note resolves exactly once. The controller pauses on large frame gaps.
    while(this.status==='playing' && this.next<this.chart.length && time>=this.chart[this.next].time) {
      const note=this.chart[this.next]; const result=judge(x-note.x);
      this.lastJudgement=result;
      if(result==='miss') {this.status='failed';onHit(result,note);break;}
      this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);
      this[result]++;this.score+=(result==='perfect'?100:60)*Math.min(4,1+Math.floor((this.combo-1)/8));
      this.next++;onHit(result,note);
      if(this.next===this.chart.length) this.status='complete';
    }
    return this.status;
  }
  get progress(){return this.next/this.chart.length;}
}
