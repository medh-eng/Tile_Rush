export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.effects=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);}
  hit(x,colour){if(!this.reduced)this.effects.push({x,colour,life:1});}
  draw(run,time,player,dt=0){
    const c=this.ctx,w=this.w,h=this.h,spb=60/run.track.bpm,land=h*.76,horizon=h*.33;
    const glow=c.createRadialGradient(w*.5,h*.43,0,w*.5,h*.43,w*.95);glow.addColorStop(0,'#174849');glow.addColorStop(.55,'#0b2433');glow.addColorStop(1,'#081320');c.fillStyle=glow;c.fillRect(0,0,w,h);
    // A quiet horizon and architectural silhouettes keep the tiles legible.
    c.strokeStyle='#8fe9da16';c.lineWidth=1;
    for(let i=0;i<7;i++){const y=horizon+((i/6)**2)*(h-horizon);c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(w/2+i*10,horizon);c.lineTo(w/2+i*w*.48,h);c.stroke();}
    c.fillStyle='#baff6533';
    for(let i=0;i<24;i++){const x=((i*197+33)%997)/997*w,y=((i*71+47)%311)/311*h*.6;const r=i%5===0?1.4:.7;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
    const pulse=this.reduced?0:(1-((Math.max(0,time)/spb)%1));
    c.strokeStyle=`rgba(155,244,204,${.12+pulse*.1})`;c.lineWidth=1;c.beginPath();c.arc(w/2,horizon+15,w*.25,Math.PI,0);c.stroke();
    // Next notes are projected by musical time, not integrated frame movement.
    const next=run.chart[run.next];
    for(let i=run.chart.length-1;i>=Math.max(0,run.next-2);i--){
      const note=run.chart[i],ahead=(note.time-time)/spb;
      if(ahead>6||ahead<-.8)continue;
      const z=1-ahead/6,scale=.12+.88*z*z;
      const x=w/2+note.x*w*.36*scale,y=horizon+(land-horizon)*z*z;
      const tw=w*.188*scale,th=23*scale;
      const active=note===next,passed=i<run.next;
      this.tile(x,y,tw,th,passed?'#487d70':active?run.track.colour:'#4d9ea5',active,passed);
    }
    const px=w/2+player*w*.36;
    let phase=((time/spb)%1+1)%1;
    if(time<0)phase=0;
    const bounce=run.status==='failed'?Math.min(100,Math.max(0,time-(next?.time||0))*250):Math.sin(phase*Math.PI)*(this.reduced?26:64);
    const py=land-17-bounce+(run.status==='failed'?bounce*2:0);
    c.fillStyle='#020c1a55';c.beginPath();c.ellipse(px,land+6,20-bounce*.07,6,0,0,7);c.fill();
    for(const e of this.effects){e.life-=dt*2.5;if(e.life<=0)continue;const ex=w/2+e.x*w*.36;c.globalAlpha=e.life*.65;c.strokeStyle=e.colour;c.lineWidth=2;c.beginPath();c.ellipse(ex,land,20+(1-e.life)*70,8+(1-e.life)*20,0,0,7);c.stroke();}
    this.effects=this.effects.filter(e=>e.life>0);c.globalAlpha=1;
    const halo=c.createRadialGradient(px,py,2,px,py,45);halo.addColorStop(0,'#baff6560');halo.addColorStop(1,'#baff6500');c.fillStyle=halo;c.fillRect(px-45,py-45,90,90);
    const ball=c.createRadialGradient(px-6,py-8,1,px,py,18);ball.addColorStop(0,'#ffffff');ball.addColorStop(.6,'#efffdd');ball.addColorStop(1,'#9dcc98');c.fillStyle=ball;c.beginPath();c.arc(px,py,16,0,7);c.fill();
  }
  tile(x,y,w,h,colour,active,passed){
    const c=this.ctx;c.save();
    c.fillStyle=passed?'#193f40':'#123743';c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);c.lineTo(x+w*.42,y+h*.7+7);c.lineTo(x-w*.42,y+h*.7+7);c.closePath();c.fill();
    c.beginPath();c.moveTo(x-w*.42,y-h*.65);c.lineTo(x+w*.42,y-h*.65);c.lineTo(x+w/2,y+h*.65);c.lineTo(x-w/2,y+h*.65);c.closePath();
    c.fillStyle=active?colour:passed?'#325c55':'#225361';c.strokeStyle=colour;c.lineWidth=active?2:1;
    if(active&&!this.reduced){c.shadowColor=colour;c.shadowBlur=18;}c.fill();c.stroke();c.shadowBlur=0;
    c.strokeStyle=active?'#f1ffdc88':'#7ee0df55';c.lineWidth=1;c.beginPath();c.moveTo(x-w*.3,y-h*.35);c.lineTo(x+w*.3,y-h*.35);c.lineTo(x+w*.36,y+h*.32);c.lineTo(x-w*.36,y+h*.32);c.closePath();c.stroke();
    if(active){c.fillStyle='#173e32';c.beginPath();c.arc(x,y,Math.max(1,h*.11),0,7);c.fill();}c.restore();
  }
}
