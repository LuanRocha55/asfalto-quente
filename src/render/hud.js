// Interface: dinheiro, estrelas, vida, minimapa e tela de título
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { clamp, hyp, fmtMoney } from '../core/utils.js';
import { T, H, phones } from '../world/map.js';
import { mini } from '../world/chunks.js';
import { heatStars } from '../game/world.js';
import { S, player, cam } from '../core/state.js';
import { VERSION } from '../core/version.js';

export function drawHUD(g,tgt){
  g.setTransform(DPR,0,0,DPR,0,0);
  const txt=(t,x,y,size,col,align)=>{g.font='bold '+size+'px "Courier New",monospace';g.textAlign=align||'left';g.fillStyle='rgba(0,0,0,0.75)';g.fillText(t,x+2,y+2);g.fillStyle=col;g.fillText(t,x,y);};
  // seta pro alvo
  if(tgt){const sx=(tgt.x-cam.x)*cam.zoom+CW/2, sy=(tgt.y-cam.y)*cam.zoom+CH/2;
    if(sx<20||sx>CW-20||sy<20||sy>CH-20){const a=Math.atan2(sy-CH/2,sx-CW/2);const r=Math.min(CW,CH)/2-50;
      const ax=CW/2+Math.cos(a)*Math.min(r*1.6,Math.abs((CW/2-40)/Math.cos(a))||r), ay=CH/2+Math.sin(a)*Math.min(r*1.6,Math.abs((CH/2-40)/Math.sin(a))||r);
      g.save();g.translate(clamp(ax,40,CW-40),clamp(ay,40,CH-40));g.rotate(a);g.fillStyle='#ffe14a';g.strokeStyle='#000';g.lineWidth=2;
      g.beginPath();g.moveTo(18,0);g.lineTo(-10,-12);g.lineTo(-4,0);g.lineTo(-10,12);g.closePath();g.fill();g.stroke();g.restore();
      const dist=Math.round(hyp(tgt.x-player.x,tgt.y-player.y)/10);txt(dist+'m',clamp(ax,40,CW-40),clamp(ay,40,CH-40)+30,12,'#ffe14a','center');}}
  // dinheiro e estrelas
  txt(fmtMoney(player.money),CW-20,42,30,'#7dff6b','right');
  const st=heatStars();
  for(let i=0;i<5;i++){const x=CW-28-i*30,y=72;const on=i<st;const blink=on&&st>0&&Math.floor(S.gameTime*4)%2===0;
    drawStar(g,x,y,12,on?(blink?'#ffffff':'#ffd84a'):'rgba(255,255,255,0.15)');}
  txt('Recorde: '+fmtMoney(S.best),CW-20,108,12,'#cfcfcf','right');
  // vida
  g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(18,18,184,16);g.fillStyle=player.health>35?'#e53935':'#ff1744';g.fillRect(20,20,180*player.health/100,12);
  txt('VIDA',22,50,12,'#fff');
  if(player.car){const c=player.car;g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(18,58,184,12);g.fillStyle=c.health>c.t.hp*0.35?'#42a5f5':'#ff9100';g.fillRect(20,60,180*Math.max(0,c.health)/c.t.hp,8);
    txt(c.t.name+'  '+Math.round(Math.max(0,c.fwdSpeed())*0.36)+' km/h',22,88,14,'#fff');}
  // missão
  if(S.mission){txt(S.mission.title,CW/2,34,18,'#ffd84a','center');txt(S.mission.text,CW/2,58,14,'#ffffff','center');
    if(S.mission.time!==undefined){const t=Math.max(0,Math.ceil(S.mission.time));txt(Math.floor(t/60)+':'+String(t%60).padStart(2,'0'),CW/2,84,20,t<15?'#ff5050':'#ffffff','center');}}
  else if(S.phoneCd<=0&&player.state==='play'){txt('Procura um orelhão tocando pra pegar missão',CW/2,34,14,'#ffe9a0','center');}
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
  const toM=(x,y)=>[mx+(x/T-ptx+VIEW/2)*MS/VIEW,my2+(y/T-pty+VIEW/2)*MS/VIEW];
  for(const ph of phones){const p=toM(ph.x,ph.y);g.fillStyle=(!S.mission&&S.phoneCd<=0)?'#ffd84a':'#8a7a3a';g.fillRect(p[0]-3,p[1]-3,6,6);}
  for(const c of S.cars){if(c.ai!=='police')continue;const p=toM(c.x,c.y);g.fillStyle=Math.floor(S.gameTime*6)%2?'#ff3030':'#3a6bff';g.fillRect(p[0]-2.5,p[1]-2.5,5,5);}
  g.fillStyle='#ff9a3c';g.font='bold 9px monospace';
  g.fillStyle='#fff';const pp=toM(player.x,player.y);g.save();g.translate(pp[0],pp[1]);g.rotate(player.a);g.beginPath();g.moveTo(6,0);g.lineTo(-4,-4);g.lineTo(-4,4);g.closePath();g.fill();g.restore();
  if(tgt){const p=toM(tgt.x,tgt.y);const cp=[clamp(p[0],mx+4,mx+MS-4),clamp(p[1],my2+4,my2+MS-4)];g.fillStyle='#ffe14a';g.beginPath();g.arc(cp[0],cp[1],5,0,Math.PI*2);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();}
  g.restore();
  txt('N mudo · P pausa · v'+VERSION,mx,my2-10,11,'rgba(255,255,255,0.6)');
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
  const lines=['WASD / setas  —  dirigir ou andar','ESPAÇO  —  freio de mão (carro) / soco (a pé)','F ou ENTER  —  entrar / sair / roubar carro','SHIFT  —  correr a pé     H  —  buzina','','Orelhões amarelos tocando = missões','PINTURA EXPRESS ($500) apaga as estrelas','OFICINA DO ZÉ compra carro roubado'];
  lines.forEach((l,i)=>txt(l,CW/2,CH*0.42+i*26*s,Math.round(16*s),'#e8e8e8'));
  if(Math.floor(performance.now()/500)%2===0)txt(S.paused?'PAUSADO — ESC, P, ENTER ou clique pra voltar':'Aperta ENTER pra começar',CW/2,CH*0.86,Math.round(24*s),'#7dff6b');
}
