// One musical clock drives both the chart and the original synthesised soundtrack.
export class Soundtrack {
  constructor(){this.ctx=null;this.timer=null;this.nodes=new Set();this.muted=false;this.fallback=false;}
  async start(track){
    this.stop();this.track=track;this.step=0;this.paused=false;
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
    try {
      if(!Audio) throw new Error('Web Audio unavailable');
      this.ctx ||= new Audio({latencyHint:'interactive'});
      await this.ctx.resume();
      if(this.ctx.state!=='running') throw new Error('Audio suspended');
      this.gain=this.ctx.createGain();this.gain.gain.value=this.muted?0:.6;this.gain.connect(this.ctx.destination);
      this.origin=this.ctx.currentTime+4*60/track.bpm;this.fallback=false;
    }catch{this.fallback=true;this.origin=performance.now()/1000+4*60/track.bpm;}
    this.tick();this.timer=setInterval(()=>this.tick(),25);
  }
  get time(){return (this.fallback?(this.paused?this.frozen:performance.now()/1000):this.ctx.currentTime)-this.origin;}
  tick(){
    if(this.fallback||this.paused)return;
    const spb=60/this.track.bpm;
    while(this.origin+this.step*spb<this.ctx.currentTime+.15 && this.step<this.track.beats){
      const at=this.origin+this.step*spb;
      if(at>=this.ctx.currentTime){
        this.tone(this.track.notes[this.step%8],at,.24,'triangle',.15);
        this.tone(this.track.bass[Math.floor(this.step/16)%4],at,.36,'sine',.2);
        this.kick(at);
        if(this.step%2) this.tone(96,at,.035,'square',.018);
        if(this.step%4===3)this.tone(this.track.notes[(this.step+2)%8]+12,at+spb/2,.13,'sine',.08);
      }
      this.step++;
    }
  }
  tone(midi,at,duration,type,volume){
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);
    g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
    o.connect(g);g.connect(this.gain);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};o.start(at);o.stop(at+duration+.02);
  }
  kick(at){
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.setValueAtTime(120,at);o.frequency.exponentialRampToValueAtTime(38,at+.12);
    g.gain.setValueAtTime(.3,at);g.gain.exponentialRampToValueAtTime(.0001,at+.18);o.connect(g);g.connect(this.gain);
    this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};o.start(at);o.stop(at+.2);
  }
  setMuted(value){this.muted=value;if(this.gain)this.gain.gain.setTargetAtTime(value?0:.6,this.ctx.currentTime,.02);}
  async pause(time=this.time){
    if(this.paused)return;this.paused=true;
    if(!this.fallback)await this.ctx.suspend();
    this.frozen=performance.now()/1000;
    this.origin=(this.fallback?this.frozen:this.ctx.currentTime)-time;
    for(const node of this.nodes){try{node.stop();}catch{}}
    this.nodes.clear();this.step=Math.max(0,Math.floor(time/(60/this.track.bpm))+1);
  }
  async resume(){if(!this.paused)return;if(this.fallback)this.origin+=performance.now()/1000-this.frozen;else await this.ctx.resume();this.paused=false;}
  stop(){clearInterval(this.timer);this.timer=null;for(const o of this.nodes){try{o.stop();}catch{}}this.nodes.clear();if(this.gain){this.gain.disconnect();this.gain=null;}}
}
