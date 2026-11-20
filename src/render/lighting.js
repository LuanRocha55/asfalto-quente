// Iluminação: escurece a tela à noite e abre "buracos" de luz (postes, faróis, fogo)
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { lamps, zones, phones, special } from '../world/map.js';
import { darkness, golden } from '../world/time.js';
import { heatStars } from '../game/world.js';
import { S, player, cam } from '../core/state.js';

const lc = document.createElement('canvas');
const lg = lc.getContext('2d');

const sx = x => ((x-cam.x)*cam.zoom + CW/2)*DPR;
const sy = y => ((y-cam.y)*cam.zoom + CH/2)*DPR;
const inView = (x,y,v,m=200) => x>v.vx0-m && x<v.vx1+m && y>v.vy0-m && y<v.vy1+m;

function hole(x,y,r,a){
  const X=sx(x), Y=sy(y), R=r*cam.zoom*DPR;
  const g=lg.createRadialGradient(X,Y,0,X,Y,R);
  g.addColorStop(0,'rgba(0,0,0,'+a+')'); g.addColorStop(1,'rgba(0,0,0,0)');
  lg.fillStyle=g; lg.beginPath(); lg.arc(X,Y,R,0,Math.PI*2); lg.fill();
}
function cone(x,y,ang,len,spread,a){
  const X=sx(x), Y=sy(y), R=len*cam.zoom*DPR;
  const g=lg.createRadialGradient(X,Y,0,X,Y,R);
  g.addColorStop(0,'rgba(0,0,0,'+a+')'); g.addColorStop(1,'rgba(0,0,0,0)');
  lg.fillStyle=g; lg.beginPath(); lg.moveTo(X,Y); lg.arc(X,Y,R,ang-spread,ang+spread); lg.closePath(); lg.fill();
}

// camada de escuridão em espaço de tela
export function drawLighting(v){
  const dark=darkness(), gold=golden();
  if(dark<0.02 && gold<0.02) return;
  const w=Math.round(CW*DPR), h=Math.round(CH*DPR);
  if(lc.width!==w||lc.height!==h){ lc.width=w; lc.height=h; }
  lg.setTransform(1,0,0,1,0,0);
  lg.globalCompositeOperation='source-over';
  lg.clearRect(0,0,w,h);
  if(gold>0.02){ lg.fillStyle='rgba(255,120,40,'+(gold*0.16*(1-dark*0.6))+')'; lg.fillRect(0,0,w,h); }
  if(dark>0.02){
    lg.fillStyle='rgba(6,10,32,'+(dark*0.70)+')'; lg.fillRect(0,0,w,h);
    lg.globalCompositeOperation='destination-out';
    const a=Math.min(1,dark*1.2);
    for(const l of lamps) if(inView(l.x,l.y,v)) hole(l.x,l.y,135,0.85*a);
    for(const z of zones) if(inView((z.x0+z.x1)/2,(z.y0+z.y1)/2,v)) hole((z.x0+z.x1)/2,(z.y0+z.y1)/2,170,0.6*a);
    for(const p of phones) if(inView(p.x,p.y,v)) hole(p.x,p.y,45,0.6*a);
    for(const c of S.cars){
      if(c.wreck||!inView(c.x,c.y,v))continue;
      const fx=c.x+Math.cos(c.a)*c.t.len/2, fy=c.y+Math.sin(c.a)*c.t.len/2;
      if(c.driver) cone(fx,fy,c.a,190,0.42,0.9*a);
      hole(c.x,c.y,c.t.len*0.7,0.35*a);
      if(c.ai==='police'&&heatStars()>0) hole(c.x,c.y,70,0.5*a);
    }
    if(!player.car&&player.state==='play') hole(player.x,player.y,75,0.55*a);
    if(special.estadio){const I=special.estadio.inner;const cx=(I.x0+I.x1)/2,cy=(I.y0+I.y1)/2;if(inView(cx,cy,v,600))hole(cx,cy,Math.max(I.x1-I.x0,I.y1-I.y0)*0.75,0.95*a);}
    for(const p of S.parts) if(p.fire&&inView(p.x,p.y,v,40)) hole(p.x,p.y,p.size*5,0.7*a);
    for(const t of S.tracers) hole(t.x2,t.y2,30,0.8*a);
  }
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(lc,0,0);
}

// brilhos aditivos em coordenadas do mundo (lâmpadas, faróis, sirene)
export function drawGlows(g,v){
  const dark=darkness();
  g.globalCompositeOperation='lighter';
  if(dark>0.05){
    for(const l of lamps){
      if(!inView(l.x,l.y,v,40))continue;
      const gr=g.createRadialGradient(l.x,l.y,0,l.x,l.y,26);
      gr.addColorStop(0,'rgba(255,210,120,'+(0.55*dark)+')'); gr.addColorStop(1,'rgba(255,210,120,0)');
      g.fillStyle=gr; g.beginPath(); g.arc(l.x,l.y,26,0,Math.PI*2); g.fill();
    }
  }
  for(const c of S.cars){
    if(c.wreck||!inView(c.x,c.y,v,60))continue;
    const cs=Math.cos(c.a), sn=Math.sin(c.a), hl=c.t.len/2, hw=c.t.wid/2-3;
    if(dark>0.05&&c.driver){
      g.fillStyle='rgba(255,250,210,'+(0.7*dark)+')';
      for(const s of[-1,1]){ g.beginPath(); g.arc(c.x+cs*hl-sn*hw*s, c.y+sn*hl+cs*hw*s, 4,0,Math.PI*2); g.fill(); }
      g.fillStyle='rgba(255,40,30,'+((c.brakeLight?0.9:0.45)*dark)+')';
      for(const s of[-1,1]){ g.beginPath(); g.arc(c.x-cs*hl-sn*hw*s, c.y-sn*hl+cs*hw*s, c.brakeLight?6:4,0,Math.PI*2); g.fill(); }
    }
    if(c.ai==='police'&&heatStars()>0){
      const on=Math.floor(S.gameTime*8)%2===0;
      const gr=g.createRadialGradient(c.x,c.y,0,c.x,c.y,55);
      const col=on?'255,40,40':'60,100,255';
      gr.addColorStop(0,'rgba('+col+','+(0.25+0.35*dark)+')'); gr.addColorStop(1,'rgba('+col+',0)');
      g.fillStyle=gr; g.beginPath(); g.arc(c.x,c.y,55,0,Math.PI*2); g.fill();
    }
  }
  g.globalCompositeOperation='source-over';
}
