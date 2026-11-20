// Interface: dinheiro, estrelas, vida, minimapa e tela de título
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { clamp, hyp, fmtMoney } from '../core/utils.js';
import { T, H, phones } from '../world/map.js';
import { lockMask, nextDistrict } from '../game/blitz.js';
import { mini } from '../world/chunks.js';
import { heatStars } from '../game/world.js';
import { S, player, cam } from '../core/state.js';
import { VERSION } from '../core/version.js';
import { clockText, darkness } from '../world/time.js';
import { WEAPONS } from '../game/weapons.js';
import { districtAt, streetAt } from '../world/districts.js';
import { buildings, zones } from '../world/map.js';
import { mouse, view } from '../core/state.js';
import { tut, currentStep, tutorialSteps } from '../game/tutorial.js';
import { drawIcon, KIND_ICON } from './icons.js';
import { hasSave, saveSummary } from '../game/save.js';
import { JOBS, levelOf, jobHint, jobSpots } from '../game/jobs.js';
import { cv } from '../core/canvas.js';
let lastDistrict='', districtFlash=0, lastFrame=performance.now();
const POI_ICONS={hospital:['+','#e53935'],policia:['★','#3a6bff'],ze:['Z','#ff9a3c'],pintura:['P','#3cff9a'],pintura2:['P','#3cff9a'],armas:['A','#ff4a3c'],lojaposto:['G','#ffd83c'],lanchonete:['L','#ffb84a'],mercadinho:['V','#c9a0ff'],farmacia:['V','#c9a0ff']};

// mira na posição do mouse (esconde o cursor do sistema durante o jogo)
function drawCrosshair(g){
  const playing=S.started&&!S.paused&&!S.menu&&!S.mapOpen&&player.state==='play';
  cv.style.cursor=(playing&&mouse.active)?'none':'default';
  if(!playing||!mouse.active)return;
  const x=mouse.x,y=mouse.y,armed=player.weapon!=='punho';
  const col=armed?'#ff5a4a':'#ffffff';
  g.strokeStyle='rgba(0,0,0,0.7)';g.lineWidth=4;g.beginPath();g.arc(x,y,9,0,Math.PI*2);g.stroke();
  g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.arc(x,y,9,0,Math.PI*2);g.stroke();
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){g.beginPath();g.moveTo(x+dx*5,y+dy*5);g.lineTo(x+dx*14,y+dy*14);g.stroke();}
  if(mouse.down&&armed){g.fillStyle=col;g.beginPath();g.arc(x,y,2.5,0,Math.PI*2);g.fill();}
}
// tecla desenhada (estilo teclado) com texto ao lado
export function drawKeycap(g,key,x,y,label,size){
  size=size||14;g.font='bold '+size+'px "Courier New",monospace';
  const w=Math.max(size*1.8,g.measureText(key).width+size*0.9),h=size*1.8;
  g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(x+2,y-h/2+3,w,h);
  g.fillStyle='#e9e9e9';g.fillRect(x,y-h/2,w,h);g.fillStyle='#bdbdbd';g.fillRect(x,y+h/2-4,w,4);
  g.fillStyle='#1b1b1b';g.textAlign='center';g.fillText(key,x+w/2,y+size*0.3);
  let end=x+w;
  if(label){g.textAlign='left';g.fillStyle='rgba(0,0,0,0.8)';g.fillText(label,end+9,y+size*0.35+1);g.fillStyle='#ffffff';g.fillText(label,end+8,y+size*0.35);end+=8+g.measureText(label).width;}
  return end;
}
// cartão do tutorial (passo atual) e dicas de primeira vez
function drawGuide(g){
  const st=currentStep();
  if(st){
    const w=Math.min(560,CW-40),h=96,x=(CW-w)/2,y=CH-h-70;
    g.fillStyle='rgba(10,14,22,0.88)';g.fillRect(x,y,w,h);g.strokeStyle=tut.flash>0?'#7dff6b':'#7fd8ff';g.lineWidth=2;g.strokeRect(x,y,w,h);
    g.font='bold 12px "Courier New",monospace';g.textAlign='left';g.fillStyle='#7fd8ff';g.fillText('COMEÇANDO  '+(tut.step+1)+'/'+tutorialSteps.length,x+14,y+20);
    g.textAlign='right';g.fillStyle='rgba(255,255,255,0.5)';g.fillText('T pula',x+w-12,y+20);
    g.textAlign='left';g.font='bold 18px "Courier New",monospace';g.fillStyle='#ffffff';g.fillText(st.title,x+14,y+44);
    let kx=x+14;for(const k of st.keys)kx=drawKeycap(g,k,kx,y+70,null,13)+6;
    g.font='13px "Courier New",monospace';g.fillStyle='rgba(255,255,255,0.85)';g.textAlign='left';g.fillText(st.text,kx+(st.keys.length?8:0),y+75);
    // barrinha de progresso dos passos
    for(let i=0;i<tutorialSteps.length;i++){g.fillStyle=i<tut.step?'#7dff6b':i===tut.step?'#7fd8ff':'rgba(255,255,255,0.2)';g.fillRect(x+14+i*22,y+h-10,18,4);}
  }
  let ty=150;
  for(const t of S.toasts){
    const a=clamp(Math.min(t.life,t.max-t.life)*2,0,1);g.globalAlpha=a;
    const w=330,h=t.keys.length?78:64,x=18;
    g.fillStyle='rgba(10,14,22,0.88)';g.fillRect(x,ty,w,h);g.fillStyle='#ffe14a';g.fillRect(x,ty,4,h);
    g.font='bold 14px "Courier New",monospace';g.textAlign='left';g.fillStyle='#ffe14a';g.fillText(t.title,x+14,ty+20);
    g.font='12px "Courier New",monospace';g.fillStyle='#eeeeee';
    const words=t.text.split(' ');let line='',ly=ty+38;for(const wd of words){if(g.measureText(line+wd).width>w-28){g.fillText(line,x+14,ly);line='';ly+=15;}line+=wd+' ';}g.fillText(line,x+14,ly);
    if(t.keys.length){let kx=x+w-14-t.keys.length*30;for(const k of t.keys)kx=drawKeycap(g,k,kx,ty+20,null,11)+4;}
    g.globalAlpha=1;ty+=h+8;
  }
}
export function drawHUD(g,tgt){
  g.setTransform(DPR,0,0,DPR,0,0);
  const txt=(t,x,y,size,col,align)=>{g.font='bold '+size+'px "Courier New",monospace';g.textAlign=align||'left';g.fillStyle='rgba(0,0,0,0.75)';g.fillText(t,x+2,y+2);g.fillStyle=col;g.fillText(t,x,y);};
  // seta pro alvo
  if(tgt){const pp=view.project(tgt.x,tgt.y,0);const sx=pp.x, sy=pp.y;
    if(sx<20||sx>CW-20||sy<20||sy>CH-20){const a=Math.atan2(sy-CH/2,sx-CW/2);const r=Math.min(CW,CH)/2-50;
      const ax=CW/2+Math.cos(a)*Math.min(r*1.6,Math.abs((CW/2-40)/Math.cos(a))||r), ay=CH/2+Math.sin(a)*Math.min(r*1.6,Math.abs((CH/2-40)/Math.sin(a))||r);
      g.save();g.translate(clamp(ax,40,CW-40),clamp(ay,40,CH-40));g.rotate(a);g.fillStyle='#ffe14a';g.strokeStyle='#000';g.lineWidth=2;
      g.beginPath();g.moveTo(18,0);g.lineTo(-10,-12);g.lineTo(-4,0);g.lineTo(-10,12);g.closePath();g.fill();g.stroke();g.restore();
      const dist=Math.round(hyp(tgt.x-player.x,tgt.y-player.y)/10);txt(dist+'m',clamp(ax,40,CW-40),clamp(ay,40,CH-40)+30,12,'#ffe14a','center');}}
  // dinheiro e estrelas
  txt(fmtMoney(player.money),CW-20,42,30,'#7dff6b','right');
  const st=heatStars();
  for(let i=0;i<6;i++){const x=CW-28-i*28,y=72;const on=i<st;const blink=on&&st>0&&Math.floor(S.gameTime*4)%2===0;
    drawStar(g,x,y,12,on?(blink?'#ffffff':'#ffd84a'):'rgba(255,255,255,0.15)');}
  txt('Recorde: '+fmtMoney(S.best),CW-20,108,12,'#cfcfcf','right');
  {const nd=nextDistrict();if(nd){const f=Math.max(0,nd.meta-Math.floor(player.money));txt('Libera '+nd.name+': faltam '+fmtMoney(f),CW-20,190,11,f<=0?'#7dff6b':'#ffb36b','right');}}
  txt((darkness()>0.5?'☾ ':'☀ ')+clockText(),CW-20,132,16,'#ffe9a0','right');
  // bairro e rua
  {const now=performance.now(), fdt=Math.min(0.1,(now-lastFrame)/1000); lastFrame=now;
    const D=districtAt(player.x,player.y); const st=streetAt(player.x,player.y);
    txt(D.name,CW-20,156,13,'#ffffff','right'); if(st)txt(st,CW-20,174,12,'rgba(255,255,255,0.75)','right');
    if(D.name!==lastDistrict){if(lastDistrict)districtFlash=2.6;lastDistrict=D.name;}
    if(districtFlash>0){districtFlash-=fdt;g.globalAlpha=clamp(districtFlash,0,1);txt(D.name,CW/2,CH*0.2,30,'#ffe9a0','center');g.globalAlpha=1;}}
  {const w=WEAPONS[player.weapon];const ay=player.car?112:72;
    txt(w.name+(player.weapon!=='punho'?'  '+(player.ammo[player.weapon]||0):''),22,ay,15,player.weapon==='punho'?'#dddddd':'#ff9a80');
    txt(player.car?'clique atira na mira · X pra frente':'clique ou ESPAÇO usa · roda troca',22,ay+16,10,'rgba(255,255,255,0.55)');}
  // vida
  g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(18,18,184,16);g.fillStyle=player.health>35?'#e53935':'#ff1744';g.fillRect(20,20,180*player.health/100,12);
  txt('VIDA',22,50,12,'#fff');
  if(player.armor>0){g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(70,40,132,10);g.fillStyle='#90a4ae';g.fillRect(72,42,128*player.armor/100,6);txt('COLETE',150,50,9,'#cfd8dc','center');}
  if(player.car){const c=player.car;g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(18,58,184,12);g.fillStyle=c.health>c.t.hp*0.35?'#42a5f5':'#ff9100';g.fillRect(20,60,180*Math.max(0,c.health)/c.t.hp,8);
    txt(c.t.name+'  '+Math.round(Math.max(0,c.fwdSpeed())*0.36)+' km/h',22,88,14,'#fff');}
  // missão
  if(S.mission){txt(S.mission.title,CW/2,34,18,'#ffd84a','center');txt(S.mission.text,CW/2,58,14,'#ffffff','center');
    if(S.mission.time!==undefined){const t=Math.max(0,Math.ceil(S.mission.time));txt(Math.floor(t/60)+':'+String(t%60).padStart(2,'0'),CW/2,84,20,t<15?'#ff5050':'#ffffff','center');}}
  else if(S.job){const j=S.job;
    txt(JOBS[j.type].title+'  ·  nível '+levelOf(j.type)+'  ·  sequência '+j.streak+'  ·  turno '+fmtMoney(j.earned),CW/2,34,15,'#7fd8ff','center');
    txt(j.text,CW/2,56,14,'#ffffff','center');
    if(j.time!==undefined){const t=Math.max(0,Math.ceil(j.time));txt(Math.floor(t/60)+':'+String(t%60).padStart(2,'0'),CW/2,82,20,t<10?'#ff5050':'#ffffff','center');}
    txt('J encerra o turno',CW/2,j.time!==undefined?100:74,10,'rgba(255,255,255,0.5)','center');}
  else if(S.phoneCd<=0&&player.state==='play'&&!tut.active){txt('Procura um orelhão tocando pra pegar missão  ·  ou aperta J pra ver os empregos',CW/2,34,14,'#ffe9a0','center');}
  {const h=jobHint();if(h){g.font='bold 15px "Courier New",monospace';const w=g.measureText(h).width+36;drawKeycap(g,'J',CW/2-w/2,CH-86,h,15);}}
  if(player.bustT>0.15)txt('PARADO AÍ!',CW/2,CH/2-80,28,'#5aa0ff','center');
  // mensagens
  let my=CH-40;for(let i=S.messages.length-1;i>=0;i--){const m=S.messages[i];g.globalAlpha=clamp(m.life,0,1);txt(m.t,CW/2,my,16,'#ffffff','center');my-=24;}g.globalAlpha=1;
  if(S.bigMsg){const a=clamp(S.bigMsg.life*2,0,1);g.globalAlpha=a;const sc=1+Math.max(0,(S.bigMsg.life-S.bigMsg.max+0.3))*1.5;
    txt(S.bigMsg.t,CW/2,CH/2-20,Math.round(46*sc),S.bigMsg.col,'center');if(S.bigMsg.sub)txt(S.bigMsg.sub,CW/2,CH/2+20,18,'#fff','center');g.globalAlpha=1;}
  // minimapa
  const MS=Math.min(200,CW*0.22),VIEW=70; const mx=18,my2=CH-MS-18;
  g.save();g.fillStyle='rgba(0,0,0,0.6)';g.fillRect(mx-3,my2-3,MS+6,MS+6);g.beginPath();g.rect(mx,my2,MS,MS);g.clip();
  const ptx=player.x/T,pty=player.y/T;g.imageSmoothingEnabled=false;
  g.drawImage(mini,ptx-VIEW/2,pty-VIEW/2,VIEW,VIEW,mx,my2,MS,MS);
  g.drawImage(lockMask(),(ptx-VIEW/2)*2,(pty-VIEW/2)*2,VIEW*2,VIEW*2,mx,my2,MS,MS); // bairros fechados (hachurado)
  const toM=(x,y)=>[mx+(x/T-ptx+VIEW/2)*MS/VIEW,my2+(y/T-pty+VIEW/2)*MS/VIEW];
  const inMini=p=>!(p[0]<mx-8||p[0]>mx+MS+8||p[1]<my2-8||p[1]>my2+MS+8);
  {const ringing=!S.mission&&!S.job&&S.phoneCd<=0;for(const ph of phones){const p=toM(ph.x,ph.y);if(!inMini(p))continue;g.globalAlpha=ringing?1:0.4;drawIcon(g,'phone',p[0],p[1],12);g.globalAlpha=1;}}
  for(const b of buildings){const k=KIND_ICON[b.kind];if(!k)continue;const p=toM((b.x0+b.x1)/2,(b.y0+b.y1)/2);if(!inMini(p))continue;drawIcon(g,k,p[0],p[1],14);}
  for(const sp of jobSpots()){if(!sp.terminal&&!sp.ponto)continue;const p=toM(sp.x,sp.y);if(!inMini(p))continue;drawIcon(g,sp.terminal?'terminal':'taxi',p[0],p[1],14);}
  if(S.waypoint&&!S.mission&&!S.job){const p=toM(S.waypoint.x,S.waypoint.y);drawIcon(g,'waypoint',clamp(p[0],mx+7,mx+MS-7),clamp(p[1],my2+7,my2+MS-7),14);}
  for(const c of S.cars){if(c.ai!=='police')continue;const p=toM(c.x,c.y);g.fillStyle=Math.floor(S.gameTime*6)%2?'#ff3030':'#3a6bff';g.fillRect(p[0]-2.5,p[1]-2.5,5,5);}
  g.fillStyle='#ff9a3c';g.font='bold 9px monospace';
  g.fillStyle='#fff';const pp=toM(player.x,player.y);g.save();g.translate(pp[0],pp[1]);g.rotate(player.a);g.beginPath();g.moveTo(6,0);g.lineTo(-4,-4);g.lineTo(-4,4);g.closePath();g.fill();g.restore();
  if(tgt){const p=toM(tgt.x,tgt.y);const cp=[clamp(p[0],mx+4,mx+MS-4),clamp(p[1],my2+4,my2+MS-4)];g.fillStyle='#ffe14a';g.beginPath();g.arc(cp[0],cp[1],5,0,Math.PI*2);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();}
  g.restore();
  txt('M mapa · G gráficos · N mudo · P pausa · F3 desempenho · v'+VERSION,mx,my2-10,11,'rgba(255,255,255,0.6)');
  if(S.saveFlash>0){g.globalAlpha=clamp(S.saveFlash,0,1);txt('✔ jogo salvo',mx,my2-28,12,'#7dff6b');g.globalAlpha=1;}
  drawGuide(g);
  drawCrosshair(g);
}
export function drawStar(g,x,y,r,col){g.fillStyle=col;g.strokeStyle='rgba(0,0,0,0.6)';g.lineWidth=2;g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fill();g.stroke();}

export function drawTitle(){
  const g=ctx;g.setTransform(DPR,0,0,DPR,0,0);
  g.fillStyle='rgba(8,8,14,0.72)';g.fillRect(0,0,CW,CH);
  const txt=(t,x,y,size,col)=>{g.font='bold '+size+'px "Courier New",monospace';g.textAlign='center';g.fillStyle='rgba(0,0,0,0.8)';g.fillText(t,x+3,y+3);g.fillStyle=col;g.fillText(t,x,y);};
  const s=Math.min(1,CW/900);
  txt('ASFALTO QUENTE',CW/2,CH*0.24,Math.round(70*s),'#ff8a1a');
  txt('Vila Maresia, 1997',CW/2,CH*0.24+40,Math.round(20*s),'#ffe9a0');
  txt('versão '+VERSION,CW/2,CH*0.24+66,Math.round(14*s),'rgba(255,255,255,0.55)');
  const lines=['WASD / setas  —  dirigir ou andar','ESPAÇO  —  freio de mão (carro) / soco (a pé)','F ou ENTER  —  entrar / sair / roubar carro','SHIFT  —  correr a pé     H  —  buzina','Q / E ou 1-4  —  trocar arma     X  —  atirar do carro',"MOUSE: mira · clique esquerdo atira/soca · direito entra/sai do carro · roda troca arma",'','Orelhões amarelos tocando = missões','PINTURA EXPRESS ($500) apaga as estrelas','OFICINA DO ZÉ compra carro roubado','ARMAS DO TONHÃO vende armas · POSTO conserta o carro ($150)','M ou TAB  —  mapa da cidade com legenda   ·   F na porta  —  entrar nos comércios',"Empregos (J): táxi, motoboy, busão, guincho e vigilante (de noite)  ·  salva sozinho"];
  lines.forEach((l,i)=>txt(l,CW/2,CH*0.37+i*21*s,Math.round(16*s),'#e8e8e8'));
  if(Math.floor(performance.now()/500)%2===0)txt(S.paused?'PAUSADO — ESC, P, ENTER ou clique pra voltar':(hasSave()?'ENTER continua o jogo salvo · BACKSPACE começa do zero':'Aperta ENTER pra começar'),CW/2,CH*0.86,Math.round((hasSave()&&!S.paused?18:24)*s),'#7dff6b');
  if(!S.paused&&hasSave())txt('Save: '+saveSummary(),CW/2,CH*0.86+28*s,Math.round(13*s),'#cfcfcf');
}
