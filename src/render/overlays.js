// Telas por cima do jogo: mapa em tela cheia (M) e menu dos comércios
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { clamp, fmtMoney } from '../core/utils.js';
import { T, W, buildings, phones } from '../world/map.js';
import { mini } from '../world/chunks.js';
import { DISTRICTS } from '../world/districts.js';
import { ZONE_LABELS } from '../world/zoning.js';
import { jobSpots } from '../game/jobs.js';
import { isDisabled, whyOf, priceLabel } from '../game/interiors.js';
import { drawIcon, ICONS, KIND_ICON } from './icons.js';
import { S, player } from '../core/state.js';

function txt(g,t,x,y,size,col,align){g.font='bold '+size+'px "Courier New",monospace';g.textAlign=align||'left';g.fillStyle='rgba(0,0,0,0.8)';g.fillText(t,x+2,y+2);g.fillStyle=col;g.fillText(t,x,y);}

// ---------------- MAPA ----------------
export function drawBigMap(){
  const g=ctx; g.setTransform(DPR,0,0,DPR,0,0);
  g.fillStyle='rgba(6,12,22,0.94)'; g.fillRect(0,0,CW,CH);
  const legendW=Math.min(330,CW*0.32);
  const size=Math.max(200,Math.min(CW-legendW-70,CH-90));
  const ox=30, oy=Math.max(50,(CH-size)/2+10), sc=size/W;
  S.mapRect={ox,oy,size,sc};
  const toS=(wx,wy)=>[ox+wx/T*sc, oy+wy/T*sc];
  g.imageSmoothingEnabled=false; g.drawImage(mini,ox,oy,size,size); g.imageSmoothingEnabled=true;
  g.strokeStyle='rgba(255,255,255,0.3)';g.lineWidth=2;g.strokeRect(ox,oy,size,size);
  txt(g,'MAPA DE VILA MARESIA',ox,oy-16,18,'#ffe9a0');
  // nomes dos bairros
  for(const [k,[tx,ty]] of Object.entries(ZONE_LABELS)){const p=toS(tx*T,ty*T);g.globalAlpha=0.8;txt(g,DISTRICTS[k].name,p[0],p[1],Math.round(clamp(size/48,10,15)),'#ffffff','center');g.globalAlpha=1;}
  // ícones
  const isz=Math.round(clamp(size/42,12,22));
  for(const b of buildings){const k=KIND_ICON[b.kind];if(!k)continue;const p=toS((b.x0+b.x1)/2,(b.y0+b.y1)/2);drawIcon(g,k,p[0],p[1],isz);}
  for(const sp of jobSpots()){if(!sp.terminal&&!sp.ponto)continue;const p=toS(sp.x,sp.y);drawIcon(g,sp.terminal?'terminal':'taxi',p[0],p[1],isz);}
  const ringing=!S.mission&&!S.job&&S.phoneCd<=0;
  for(const ph of phones){const p=toS(ph.x,ph.y);g.globalAlpha=ringing?1:0.45;drawIcon(g,'phone',p[0],p[1],isz*0.85);g.globalAlpha=1;}
  // polícia
  for(const c of S.cars){if(c.ai!=='police')continue;const p=toS(c.x,c.y);g.fillStyle=Math.floor(S.gameTime*6)%2?'#ff3030':'#3a6bff';g.beginPath();g.arc(p[0],p[1],4,0,Math.PI*2);g.fill();}
  // alvo da missão/emprego e marcador
  const tgt=S.mission?S.mission.def.target(S.mission):(S.job?S.job.target:null);
  if(tgt){const p=toS(tgt.x,tgt.y);const r=8+Math.sin(S.gameTime*6)*3;g.strokeStyle='#ffe14a';g.lineWidth=3;g.beginPath();g.arc(p[0],p[1],r,0,Math.PI*2);g.stroke();}
  if(S.waypoint){const p=toS(S.waypoint.x,S.waypoint.y);drawIcon(g,'waypoint',p[0],p[1]-isz*0.4,isz*1.1);}
  // jogador
  {const p=toS(player.x,player.y);g.save();g.translate(p[0],p[1]);g.rotate(player.a);g.fillStyle='#ffffff';g.strokeStyle='#000';g.lineWidth=2;
    g.beginPath();g.moveTo(11,0);g.lineTo(-7,-7);g.lineTo(-3,0);g.lineTo(-7,7);g.closePath();g.fill();g.stroke();g.restore();
    const pulse=10+Math.sin(S.gameTime*5)*4;g.strokeStyle='rgba(255,255,255,0.6)';g.lineWidth=1.5;g.beginPath();g.arc(p[0],p[1],pulse+6,0,Math.PI*2);g.stroke();}
  // legenda
  const lx=ox+size+30; let ly=oy+6;
  txt(g,'LEGENDA',lx,ly,16,'#ffe9a0'); ly+=20;
  const order=['casa','phone','hospital','farmacia','policia','ze','pintura','armas','posto','lanchonete','mercadinho','padaria','escola','terminal','taxi','waypoint'];
  const step=Math.max(18,Math.min(26,(size-110)/order.length));
  for(const k of order){drawIcon(g,k,lx+9,ly+step/2-2,Math.min(18,step-4));txt(g,ICONS[k].name,lx+26,ly+step/2+3,Math.round(clamp(step*0.5,10,13)),'#e8e8e8');ly+=step;}
  ly+=8;
  g.fillStyle='#ffffff';txt(g,'Seta branca = você',lx,ly,12,'#ffffff');ly+=17;
  txt(g,'Círculo amarelo = objetivo',lx,ly,12,'#ffe14a');ly+=17;
  txt(g,'Pontos piscando = polícia',lx,ly,12,'#ff8080');ly+=24;
  txt(g,'Clique: marcar destino',lx,ly,12,'#bfe8ff');ly+=16;
  txt(g,'Clique direito: apagar marcador',lx,ly,12,'#bfe8ff');ly+=16;
  txt(g,'M ou Esc: fechar',lx,ly,12,'#bfe8ff');
}
export function mapClick(x,y,button){
  const r=S.mapRect;if(!r)return;
  if(x<r.ox||y<r.oy||x>r.ox+r.size||y>r.oy+r.size)return;
  if(button===2){S.waypoint=null;return;}
  S.waypoint={x:(x-r.ox)/r.sc*T,y:(y-r.oy)/r.sc*T};
}

// ---------------- MENU DOS COMÉRCIOS ----------------
export function drawMenu(){
  const m=S.menu;if(!m)return;
  const g=ctx; g.setTransform(DPR,0,0,DPR,0,0);
  g.fillStyle='rgba(0,0,0,0.6)';g.fillRect(0,0,CW,CH);
  const n=m.items.length+1, rowH=44, w=Math.min(600,CW-40), h=120+n*rowH+40;
  const x=(CW-w)/2, y=Math.max(20,(CH-h)/2);
  g.fillStyle='#14161c';g.fillRect(x,y,w,h);g.strokeStyle='#ffe9a0';g.lineWidth=2;g.strokeRect(x,y,w,h);
  const ik=KIND_ICON[m.kind]; if(ik)drawIcon(g,ik,x+34,y+40,34);
  txt(g,m.title,x+62,y+42,24,'#ffe9a0');
  txt(g,m.sub,x+62,y+64,13,'rgba(255,255,255,0.7)');
  txt(g,fmtMoney(player.money),x+w-20,y+42,20,'#7dff6b','right');
  txt(g,'Vida '+Math.round(player.health)+(player.armor>0?' · Colete '+Math.round(player.armor):''),x+w-20,y+64,12,'#ff9a9a','right');
  m.rects=[];
  for(let i=0;i<n;i++){
    const it=m.items[i], ry=y+90+i*rowH, sel=m.sel===i;
    const dis=it?isDisabled(it):false;
    g.fillStyle=sel?'rgba(255,233,160,0.18)':'rgba(255,255,255,0.04)';g.fillRect(x+14,ry,w-28,rowH-6);
    if(sel){g.strokeStyle='#ffe9a0';g.lineWidth=1.5;g.strokeRect(x+14,ry,w-28,rowH-6);}
    m.rects.push({x:x+14,y:ry,w:w-28,h:rowH-6,i});
    const col=dis?'rgba(255,255,255,0.35)':'#ffffff';
    if(it){
      txt(g,(i+1)+'. '+it.label,x+26,ry+24,14,col);
      txt(g,dis?(whyOf(it)||'—'):priceLabel(it),x+w-28,ry+24,14,dis?'rgba(255,255,255,0.35)':'#7dff6b','right');
    } else txt(g,'Sair',x+26,ry+24,14,'#ffb0a0');
  }
  txt(g,'W/S ou mouse escolhe · ENTER ou clique compra · 1-9 atalho · ESC sai',CW/2,y+h-14,12,'rgba(255,255,255,0.6)','center');
}
