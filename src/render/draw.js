// Desenho do mundo: carros, pessoas, prédios em perspectiva
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { mulberry, clamp, lerp, hyp, shade } from '../core/utils.js';
import { W, H, WATER, buildings, trees, zones, phones, tileAt } from '../world/map.js';
import { CHUNK, CPX, getChunk } from '../world/chunks.js';
import { Car } from '../entities/vehicles.js';
import { Ped } from '../entities/peds.js';
import { heatStars } from '../game/world.js';
import { nearestCar } from '../game/player.js';
import { drawHUD } from './hud.js';
import { S, player, cam, keys } from '../core/state.js';
import { lamps, special } from '../world/map.js';
import { darkness } from '../world/time.js';
import { drawLighting, drawGlows } from './lighting.js';
import { WEAPONS } from '../game/weapons.js';

let BR=1;      // brilho geral dos prédios/árvores (cai à noite)
let NIGHT=0;   // 0 dia .. 1 noite
function hash(n){const x=Math.sin(n)*43758.5453;return x-Math.floor(x);}

export function drawCar(g,c){
  g.save();g.translate(c.x,c.y);g.rotate(c.a);
  const L=c.t.len,Wd=c.t.wid,hl=L/2,hw=Wd/2;
  // sombra
  g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(-hl+3,-hw+4,L,Wd);
  const col=c.wreck?'#2b2724':c.color;
  g.fillStyle=shade(col,0.7);roundRect(g,-hl,-hw,L,Wd,5);g.fill();
  g.fillStyle=col;roundRect(g,-hl+1,-hw+1,L-2,Wd-2,4);g.fill();
  if(c.type==='busao'){
    g.fillStyle=shade(col,1.15);g.fillRect(-hl+4,-hw+3,L-10,Wd-6);
    g.fillStyle='#9fd3e8';g.fillRect(hl-7,-hw+3,4,Wd-6);
    g.fillStyle='rgba(255,255,255,0.5)';for(let i=0;i<6;i++)g.fillRect(-hl+10+i*11,-hw+5,6,Wd-10);
  } else if(c.type==='camin'){
    g.fillStyle=shade(col,0.55);g.fillRect(-hl+3,-hw+3,L*0.45,Wd-6); // caçamba
    g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(-hl+5,-hw+5,L*0.45-4,Wd-10);
    g.fillStyle='#7fb8cf';g.fillRect(hl-L*0.42,-hw+3,5,Wd-6);
    g.fillStyle=shade(col,1.2);g.fillRect(hl-L*0.42+5,-hw+3,L*0.22,Wd-6);
  } else if(c.type==='bugue'){
    g.fillStyle='#222';g.fillRect(-hl+4,-hw+3,L-12,Wd-6);
    g.fillStyle='#d9d9d9';g.fillRect(-4,-hw+2,2,Wd-4);g.fillRect(-hl+6,-hw+2,2,Wd-4);
    g.fillStyle='#5a3b22';g.fillRect(-hl+8,-4,6,8);g.fillRect(-2,-4,6,8);
  } else {
    g.fillStyle='#86c5da';g.fillRect(hl-L*0.36,-hw+3,L*0.12,Wd-6); // para-brisa
    g.fillStyle=shade(col,1.18);g.fillRect(-hl+L*0.25,-hw+3,L*0.38,Wd-6); // teto
    g.fillStyle='#5f8fa0';g.fillRect(-hl+L*0.16,-hw+3,L*0.09,Wd-6); // vidro traseiro
    if(c.type==='taxi'){g.fillStyle='#e53935';g.fillRect(-hl+L*0.4,-3,6,6);g.fillStyle='#1e88e5';g.fillRect(-hl+3,-hw+1,L-6,2);g.fillRect(-hl+3,hw-3,L-6,2);}
    if(c.type==='brisa'){g.fillStyle='rgba(0,0,0,0.6)';g.fillRect(-hl+L*0.25,-1.5,L*0.38,3);g.fillStyle='#111';g.fillRect(-hl,-hw+2,3,Wd-4);}
    if(c.type==='viatura'){g.fillStyle='#f4f4f4';g.fillRect(-hl+L*0.25,-hw+3,L*0.38,Wd-6);g.fillStyle='#f4f4f4';g.fillRect(hl-L*0.24,-hw+1,L*0.2,Wd-2);g.fillRect(-hl+1,-hw+1,L*0.14,Wd-2);
      const on=Math.floor(S.gameTime*8)%2===0&&heatStars()>0;g.fillStyle=on?'#ff2a2a':'#7a1010';g.fillRect(-hl+L*0.42,-hw+3,5,(Wd-6)/2);g.fillStyle=on?'#3a6bff':'#0e1f66';g.fillRect(-hl+L*0.42,0,5,(Wd-6)/2);
      if(on){g.fillStyle='rgba(255,40,40,0.18)';g.beginPath();g.arc(0,0,38,0,Math.PI*2);g.fill();}}
  }
  // faróis / lanternas
  if(!c.wreck){g.fillStyle='#fff8c0';g.fillRect(hl-2,-hw+2,2,4);g.fillRect(hl-2,hw-6,2,4);
    g.fillStyle=c.brakeLight?'#ff3030':'#8a1a1a';g.fillRect(-hl,-hw+2,2,4);g.fillRect(-hl,hw-6,2,4);}
  else{g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(-hl+4,-hw+3,L-8,Wd-6);}
  if(c===player.car){g.strokeStyle='rgba(255,255,255,0.0)';}
  g.restore();
}
export function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();}
export function drawPerson(g,x,y,a,shirt,skin,hair,anim,moving,scale){
  g.save();g.translate(x,y);g.rotate(a);if(scale)g.scale(scale,scale);
  g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(2,2,7,6,0,0,Math.PI*2);g.fill();
  if(moving){const sw=Math.sin(anim*10)*4;g.fillStyle='#2b2f45';g.fillRect(-2+sw,-5,5,3);g.fillRect(-2-sw,2,5,3);}
  g.fillStyle=shirt;g.beginPath();g.ellipse(0,0,4.5,7,0,0,Math.PI*2);g.fill();
  g.fillStyle=skin;g.beginPath();g.arc(1,0,3.6,0,Math.PI*2);g.fill();
  g.fillStyle=hair;g.beginPath();g.arc(0,0,3.4,Math.PI*0.5,Math.PI*1.5);g.fill();
  g.restore();
}
// prédios com perspectiva
export function proj(px,py,h,camH){const k=camH/(camH-h);return[cam.x+(px-cam.x)*k,cam.y+(py-cam.y)*k];}
export function drawBuilding(g,b,camH){
  const h=b.h;const {x0,y0,x1,y1}=b;
  const A=proj(x0,y0,h,camH),B=proj(x1,y0,h,camH),C=proj(x1,y1,h,camH),D=proj(x0,y1,h,camH);
  const quad=(p1,p2,p3,p4,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);g.lineTo(p3[0],p3[1]);g.lineTo(p4[0],p4[1]);g.closePath();g.fill();};
  const floors=Math.max(1,Math.floor(h/12));
  const wallLines=(e1,e2,r1,r2,col)=>{g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();for(let i=1;i<floors;i++){const t=i/floors;
      g.moveTo(lerp(e1[0],r1[0],t),lerp(e1[1],r1[1],t));g.lineTo(lerp(e2[0],r2[0],t),lerp(e2[1],r2[1],t));}g.stroke();};
  // janelas acesas à noite
  const wins=(e1,e2,r1,r2,face)=>{if(NIGHT<0.3)return;const len=hyp(e2[0]-e1[0],e2[1]-e1[1]);const n=Math.max(1,Math.floor(len/24));const fl=Math.min(floors,8);
    g.fillStyle='rgba(255,214,120,'+Math.min(1,(NIGHT-0.3)*2.2)+')';
    for(let i=0;i<fl;i++){const t=(i+0.5)/fl;for(let kk=0;kk<n;kk++){if(hash(b.seed*1000+i*13.1+kk*7.7+face*3.3)>0.38)continue;const u=(kk+0.5)/n;
      const bx=lerp(e1[0],e2[0],u),by=lerp(e1[1],e2[1],u),rx=lerp(r1[0],r2[0],u),ry=lerp(r1[1],r2[1],u);g.fillRect(lerp(bx,rx,t)-2.5,lerp(by,ry,t)-1.5,5,3);}}};
  if(cam.y<y0){quad([x0,y0],[x1,y0],B,A,shade(b.wall,0.82*BR));wallLines([x0,y0],[x1,y0],A,B,'rgba(0,0,0,0.18)');wins([x0,y0],[x1,y0],A,B,1);}
  if(cam.y>y1){quad([x0,y1],[x1,y1],C,D,shade(b.wall,0.92*BR));wallLines([x0,y1],[x1,y1],D,C,'rgba(0,0,0,0.18)');wins([x0,y1],[x1,y1],D,C,2);}
  if(cam.x<x0){quad([x0,y0],[x0,y1],D,A,shade(b.wall,0.72*BR));wallLines([x0,y0],[x0,y1],A,D,'rgba(0,0,0,0.18)');wins([x0,y0],[x0,y1],A,D,3);}
  if(cam.x>x1){quad([x1,y0],[x1,y1],C,B,shade(b.wall,0.78*BR));wallLines([x1,y0],[x1,y1],B,C,'rgba(0,0,0,0.18)');wins([x1,y0],[x1,y1],B,C,4);}
  // telhado
  quad(A,B,C,D,shade(b.roof,BR));
  const k=camH/(camH-h);const rw=(x1-x0)*k, rh=(y1-y0)*k;
  g.strokeStyle=shade(b.roof,1.35*BR);g.lineWidth=3;g.strokeRect(A[0]+2,A[1]+2,rw-4,rh-4);
  if(b.kind==='hospital'){g.fillStyle='#e53935';const cx=A[0]+rw/2,cy=A[1]+rh/2,s=Math.min(rw,rh)*0.18;g.fillRect(cx-s,cy-s*3,s*2,s*6);g.fillRect(cx-s*3,cy-s,s*6,s*2);
    label(g,'HOSPITAL',cx,A[1]+rh-10,'#b71c1c',12);}
  else if(b.kind==='policia'){label(g,'POLÍCIA',A[0]+rw/2,A[1]+rh/2+5,'#ffffff',16);}
  else if(b.kind==='ze'){label(g,'OFICINA DO ZÉ',A[0]+rw/2,A[1]+rh/2+5,'#ffd08a',13);}
  else if(b.kind==='armas'){label(g,'ARMAS DO TONHÃO',A[0]+rw/2,A[1]+rh/2+5,'#ffb0a0',13);}
  else if(b.kind==='pintura'||b.kind==='pintura2'){label(g,'PINTURA EXPRESS',A[0]+rw/2,A[1]+rh/2+5,'#d9ffe9',13);}
  else{
    const r=mulberry(Math.floor(b.seed*1e9));
    const n=Math.floor(r()*3)+(rw*rh>60000?2:0);
    for(let i=0;i<n;i++){const kind=r();const px=A[0]+10+r()*(rw-34),py=A[1]+10+r()*(rh-34);
      if(kind<0.45){g.fillStyle=shade('#2f6fb3',BR);g.beginPath();g.arc(px+9,py+9,8,0,Math.PI*2);g.fill();g.fillStyle=shade('#4f8fd3',BR);g.beginPath();g.arc(px+9,py+9,5,0,Math.PI*2);g.fill();} // caixa d'água
      else if(kind<0.8){g.fillStyle=shade(b.roof,0.75*BR);g.fillRect(px,py,16,12);g.fillStyle=shade(b.roof,1.25*BR);g.fillRect(px+3,py+3,10,6);} // ar-condicionado
      else{g.fillStyle=shade(b.roof,0.6*BR);g.fillRect(px,py,22,22);g.fillStyle=shade(b.roof,0.9*BR);g.fillRect(px+3,py+3,16,16);}}
  }
}
export function label(g,t,x,y,col,size){g.font='bold '+size+'px "Courier New",monospace';g.textAlign='center';g.fillStyle='rgba(0,0,0,0.5)';g.fillText(t,x+2,y+2);g.fillStyle=col;g.fillText(t,x,y);}
export function drawTree(g,tr,camH){const p=proj(tr.x,tr.y,26,camH);const k=camH/(camH-26);const TC=shade(tr.c,BR);
  g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.arc(tr.x+4,tr.y+4,tr.r*0.9,0,Math.PI*2);g.fill();
  if(tr.palm){g.strokeStyle='#7a5a2a';g.lineWidth=3;g.beginPath();g.moveTo(tr.x,tr.y);g.lineTo(p[0],p[1]);g.stroke();
    g.fillStyle=TC;for(let i=0;i<6;i++){const a=i*Math.PI/3+tr.r;g.beginPath();g.ellipse(p[0]+Math.cos(a)*9*k,p[1]+Math.sin(a)*9*k,10*k,3.5*k,a,0,Math.PI*2);g.fill();}
    g.fillStyle='#5a3b1a';g.beginPath();g.arc(p[0],p[1],3*k,0,Math.PI*2);g.fill();return;}
  g.fillStyle=shade(tr.c,0.8*BR);g.beginPath();g.arc(p[0],p[1],tr.r*k,0,Math.PI*2);g.fill();
  g.fillStyle=TC;g.beginPath();g.arc(p[0]-2,p[1]-2,tr.r*k*0.75,0,Math.PI*2);g.fill();
  g.fillStyle=shade(tr.c,1.25*BR);g.beginPath();g.arc(p[0]-4,p[1]-4,tr.r*k*0.35,0,Math.PI*2);g.fill();}

export function render(){
  const g=ctx;
  g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#1f5f8b';g.fillRect(0,0,CW,CH);
  const sx=(Math.random()-.5)*S.shake,sy=(Math.random()-.5)*S.shake;
  const setCam=()=>g.setTransform(DPR*cam.zoom,0,0,DPR*cam.zoom,DPR*(CW/2+sx)-cam.x*DPR*cam.zoom,DPR*(CH/2+sy)-cam.y*DPR*cam.zoom);
  setCam();
  NIGHT=darkness(); BR=1-NIGHT*0.5;
  const hw=CW/2/cam.zoom, hh=CH/2/cam.zoom;
  const vx0=cam.x-hw-40,vx1=cam.x+hw+40,vy0=cam.y-hh-40,vy1=cam.y+hh+40;
  // chão
  const c0x=Math.max(0,Math.floor(vx0/CPX)),c1x=Math.min(Math.ceil(W/CHUNK)-1,Math.floor(vx1/CPX));
  const c0y=Math.max(0,Math.floor(vy0/CPX)),c1y=Math.min(Math.ceil(H/CHUNK)-1,Math.floor(vy1/CPX));
  for(let cy=c0y;cy<=c1y;cy++)for(let cx=c0x;cx<=c1x;cx++)g.drawImage(getChunk(cx,cy),cx*CPX,cy*CPX);
  // ondas animadas
  g.fillStyle='rgba(255,255,255,0.08)';
  for(let i=0;i<40;i++){const wx=Math.floor(vx0/64)*64+((i*137)%Math.max(64,(vx1-vx0)))+Math.sin(S.gameTime+i)*10;const wy=Math.floor(vy0/64)*64+((i*251)%Math.max(64,(vy1-vy0)));if(tileAt(wx,wy)===WATER)g.fillRect(wx,wy,14,2);}
  // decalques
  for(const d of S.decals){if(d.x<vx0||d.x>vx1||d.y<vy0||d.y>vy1)continue;const a=clamp(d.life/5,0,1);
    if(d.type==='scorch'){g.fillStyle='rgba(15,10,5,'+(0.55*a)+')';g.beginPath();g.arc(d.x,d.y,d.r,0,Math.PI*2);g.fill();}
    else{g.fillStyle='rgba(120,10,10,'+(0.7*a)+')';g.beginPath();g.arc(d.x,d.y,d.r,0,Math.PI*2);g.fill();g.beginPath();g.arc(d.x+7,d.y-4,d.r*0.5,0,Math.PI*2);g.fill();}}
  // marcas de pneu
  g.lineWidth=3;
  for(const s of S.skids){if(s.x1<vx0||s.x1>vx1||s.y1<vy0||s.y1>vy1)continue;g.strokeStyle=s.sand?'rgba(150,120,70,'+(Math.min(1,s.life/4)*0.5)+')':'rgba(15,15,15,'+(Math.min(1,s.life/4)*0.55)+')';
    g.beginPath();g.moveTo(s.x1,s.y1);g.lineTo(s.x2,s.y2);g.stroke();}
  // zonas
  for(const z of zones){const pulse=0.25+0.15*Math.sin(S.gameTime*4);g.fillStyle=z.type==='ze'?'rgba(255,150,40,'+pulse+')':z.type==='armas'?'rgba(255,70,50,'+(pulse*0.6)+')':'rgba(40,255,150,'+pulse+')';g.fillRect(z.x0,z.y0,z.x1-z.x0,z.y1-z.y0);
    g.setLineDash([10,8]);g.strokeStyle=z.type==='ze'?'#ffb060':z.type==='armas'?'#ff7a60':'#60ffb0';g.lineWidth=3;g.strokeRect(z.x0,z.y0,z.x1-z.x0,z.y1-z.y0);g.setLineDash([]);
    if(z.pads){label(g,z.label,(z.x0+z.x1)/2,z.y0+22,'#fff',12);
      for(const pd of z.pads){const w=WEAPONS[pd.weapon];g.fillStyle='rgba(120,20,10,0.55)';g.fillRect(pd.x0,pd.y0,pd.x1-pd.x0,pd.y1-pd.y0);
        g.strokeStyle='#ff9a80';g.lineWidth=2;g.strokeRect(pd.x0,pd.y0,pd.x1-pd.x0,pd.y1-pd.y0);
        label(g,w.name.length>9?'SMG':w.name.toUpperCase(),(pd.x0+pd.x1)/2,(pd.y0+pd.y1)/2-2,'#fff',11);label(g,'$'+w.price,(pd.x0+pd.x1)/2,(pd.y0+pd.y1)/2+14,'#9dff8a',11);}}
    else label(g,z.label,(z.x0+z.x1)/2,(z.y0+z.y1)/2+6,'#fff',16);}
  // postes
  for(const l of lamps){if(l.x<vx0||l.x>vx1||l.y<vy0||l.y>vy1)continue;
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.arc(l.x+2,l.y+2,4,0,Math.PI*2);g.fill();
    g.fillStyle='#3d3d42';g.beginPath();g.arc(l.x,l.y,4,0,Math.PI*2);g.fill();
    g.fillStyle=NIGHT>0.05?'#fff1b8':'#c9c9c0';g.beginPath();g.arc(l.x,l.y,2,0,Math.PI*2);g.fill();}
  // orelhões
  for(const ph of phones){if(ph.x<vx0||ph.x>vx1||ph.y<vy0||ph.y>vy1)continue;
    const ring=!S.mission&&S.phoneCd<=0;
    if(ring){const r=18+Math.sin(S.gameTime*8)*4;g.strokeStyle='rgba(255,220,60,0.8)';g.lineWidth=2;g.beginPath();g.arc(ph.x,ph.y,r,0,Math.PI*2);g.stroke();}
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.arc(ph.x+3,ph.y+3,10,0,Math.PI*2);g.fill();
    g.fillStyle='#f2a900';g.beginPath();g.arc(ph.x,ph.y,10,0,Math.PI*2);g.fill();g.fillStyle='#ffd04a';g.beginPath();g.arc(ph.x-2,ph.y-2,6,0,Math.PI*2);g.fill();
    g.fillStyle='#3a3a3a';g.fillRect(ph.x-2,ph.y+4,4,6);}
  // marcador do alvo
  const tgt=S.mission?S.mission.def.target(S.mission):null;
  if(tgt&&!(tgt instanceof Car)&&!(tgt instanceof Ped)){const r=26+Math.sin(S.gameTime*5)*5;g.strokeStyle='#ffe14a';g.lineWidth=4;g.beginPath();g.arc(tgt.x,tgt.y,r,0,Math.PI*2);g.stroke();g.fillStyle='rgba(255,225,74,0.25)';g.fill();}
  // pedestres
  for(const p of S.peds){if(p.state==='dead'||p.state==='gone'||p.state==='dead2')continue;if(p.x<vx0||p.x>vx1||p.y<vy0||p.y>vy1)continue;
    if(p.state==='down'){g.save();g.translate(p.x,p.y);g.fillStyle=p.shirt;g.fillRect(-7,-4,14,8);g.fillStyle=p.skin;g.beginPath();g.arc(8,0,3.5,0,Math.PI*2);g.fill();g.restore();continue;}
    drawPerson(g,p.x,p.y,p.a,p.shirt,p.skin,p.hair,p.anim,p.state!=='wait',1);
    if(p.state==='wait'){const yy=p.y-16+Math.sin(S.gameTime*6)*2;g.fillStyle='#ffe14a';g.beginPath();g.moveTo(p.x,yy+6);g.lineTo(p.x-5,yy-2);g.lineTo(p.x+5,yy-2);g.fill();}}
  // jogador a pé
  if(!player.car&&player.state==='play'){if(!(player.inv>0&&Math.floor(S.gameTime*10)%2))drawPerson(g,player.x,player.y,player.a,'#ff7a1a','#c68642','#111',player.anim/10,(keys['KeyW']||keys['KeyS']||keys['KeyA']||keys['KeyD']||keys['ArrowUp']||keys['ArrowDown']||keys['ArrowLeft']||keys['ArrowRight']),1.15);
    const nc=nearestCar(26);if(nc){g.fillStyle='rgba(255,255,255,0.9)';g.font='bold 11px monospace';g.textAlign='center';g.fillText('[F] '+nc.t.name,nc.x,nc.y-nc.t.wid-6);}}
  // carros
  for(const c of S.cars){if(c.x<vx0-60||c.x>vx1+60||c.y<vy0-60||c.y>vy1+60)continue;drawCar(g,c);
    if(S.mission&&c.mission===S.mission&&!c.wreck&&c.maxHp){const f=clamp(c.health/c.maxHp,0,1);g.fillStyle='rgba(0,0,0,0.6)';g.fillRect(c.x-21,c.y-44,42,7);g.fillStyle=f>0.4?'#4cff6a':'#ff5030';g.fillRect(c.x-20,c.y-43,40*f,5);}
    if(S.mission&&c.mission===S.mission&&!c.wreck){const yy=c.y-28+Math.sin(S.gameTime*6)*3;g.fillStyle='#ffe14a';g.beginPath();g.moveTo(c.x,yy+8);g.lineTo(c.x-7,yy-3);g.lineTo(c.x+7,yy-3);g.fill();}}
  // noite: escuridão com pontos de luz, depois brilhos
  const view={vx0,vx1,vy0,vy1};
  drawLighting(view); setCam(); drawGlows(g,view);
  // prédios e árvores ordenados por distância à câmera
  const camH=420/Math.min(1.2,cam.zoom);
  const vis=[];
  for(const b of buildings){if(b.x1<vx0-200||b.x0>vx1+200||b.y1<vy0-200||b.y0>vy1+200)continue;const cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;vis.push({d:hyp(cx-cam.x,cy-cam.y),b});}
  for(const t of trees){if(t.x<vx0-40||t.x>vx1+40||t.y<vy0-40||t.y>vy1+40)continue;vis.push({d:hyp(t.x-cam.x,t.y-cam.y),t});}
  vis.sort((a,b)=>b.d-a.d);
  for(const v of vis){if(v.b)drawBuilding(g,v.b,camH);else drawTree(g,v.t,camH);}
  // partículas
  for(const p of S.parts){if(p.x<vx0||p.x>vx1||p.y<vy0||p.y>vy1)continue;const a=clamp(p.life/p.max,0,1);g.fillStyle=p.col+(p.fire?a:a*0.5)+')';
    g.beginPath();g.arc(p.x,p.y,p.size*(p.fire?a+0.3:1),0,Math.PI*2);g.fill();}
  // rastros de bala
  g.globalCompositeOperation='lighter';g.lineWidth=2;
  for(const t of S.tracers){g.strokeStyle='rgba('+t.col+','+clamp(t.life/t.max,0,1)+')';g.beginPath();g.moveTo(t.x1,t.y1);g.lineTo(t.x2,t.y2);g.stroke();}
  g.globalCompositeOperation='source-over';

  drawHUD(g,tgt);
}
