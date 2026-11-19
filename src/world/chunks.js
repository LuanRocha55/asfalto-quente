// Renderização do chão em blocos (cache) e minimapa
import { mulberry, shade } from '../core/utils.js';
import { DISTRICTS, districtOfTile, roadIndexAt, isAvenue, RING, signalized } from './districts.js';
import { T, BAND, PER, O, NI, CITY, W, H, roadPx, WATER, SAND, ROAD, SIDE, GRASS, BUILD, TREE, PARK, map, zones } from './map.js';

export const CHUNK=16, CPX=CHUNK*T;
export const chunkCache=new Map();
export const TILE_COL={[WATER]:'#1f5f8b',[SAND]:'#e3cf98',[ROAD]:'#3b3b42',[SIDE]:'#a9a7a0',[GRASS]:'#5f9e4a',[BUILD]:'#2a2a2e',[TREE]:'#4f8e3e',[PARK]:'#4a4a52'};
export function bandIdx(c){return (c-O)%PER;}
export function isRoadBand(c){const k=c-O;return k>=0&&k<CITY&&k%PER<BAND;}
export function renderChunk(cx,cy){
  const c=document.createElement('canvas');c.width=CPX;c.height=CPX;const g=c.getContext('2d');
  const r=mulberry(cx*7919+cy*104729);
  for(let ty=0;ty<CHUNK;ty++)for(let tx=0;tx<CHUNK;tx++){
    const X=cx*CHUNK+tx, Y=cy*CHUNK+ty; if(X>=W||Y>=H)continue;
    const t=map[Y*W+X]; const px=tx*T, py=ty*T;
    const D=DISTRICTS[districtOfTile(X,Y)];
    g.fillStyle=TILE_COL[t]; g.fillRect(px,py,T,T);
    if(t===WATER){g.fillStyle='rgba(255,255,255,0.06)';for(let i=0;i<3;i++)g.fillRect(px+r()*28,py+r()*30,6,1);}
    else if(t===SAND){g.fillStyle='rgba(150,120,60,0.18)';for(let i=0;i<5;i++)g.fillRect(px+r()*30,py+r()*30,2,2);}
    else if(t===GRASS||t===TREE){g.fillStyle='rgba(30,70,20,0.25)';for(let i=0;i<6;i++)g.fillRect(px+r()*30,py+r()*30,2,3);}
    else if(t===SIDE){drawSidewalk(g,px,py,X,Y,D,r);}
    else if(t===PARK){g.fillStyle='rgba(255,255,255,0.35)';if(X%3===0)g.fillRect(px,py+4,2,24);}
    else if(t===ROAD){drawRoadTile(g,px,py,X,Y,D,r);}
  }
  // marcações por trecho de rua (atravessam tiles)
  g.save(); g.translate(-cx*CPX,-cy*CPX);
  const bx0=cx*CPX, by0=cy*CPX, bx1=bx0+CPX, by1=by0+CPX;
  for(let j=0;j<NI;j++)for(let k=0;k<NI-1;k++){
    // trecho horizontal: rua j entre os cruzamentos k e k+1
    let x0=roadPx(k)+128, x1=roadPx(k+1), y0=roadPx(j);
    if(x1>bx0&&x0<bx1&&y0+128>by0&&y0<by1) markSegment(g,x0,y0,x1,true,j,k);
    // trecho vertical: rua j entre k e k+1
    let yy0=roadPx(k)+128, yy1=roadPx(k+1), xx0=roadPx(j);
    if(yy1>by0&&yy0<by1&&xx0+128>bx0&&xx0<bx1) markSegment(g,yy0,xx0,yy1,false,j,k);
  }
  g.restore();
  return c;
}

function roadStyleAt(X,Y){
  const {h,v}=roadIndexAt((X+.5)*T,(Y+.5)*T);
  const ave=(h>=0&&isAvenue(h))||(v>=0&&isAvenue(v));
  const ring=(h>=0&&RING(h))||(v>=0&&RING(v));
  return {ave,ring};
}
function drawRoadTile(g,px,py,X,Y,D,r){
  const {ave,ring}=roadStyleAt(X,Y);
  if(ave){g.fillStyle='#2a2a31';g.fillRect(px,py,T,T);g.fillStyle='rgba(255,255,255,0.03)';for(let i=0;i<3;i++)g.fillRect(px+r()*30,py+r()*30,2,1);return;}
  if(ring){g.fillStyle='#3d3d45';g.fillRect(px,py,T,T);g.fillStyle='rgba(0,0,0,0.08)';for(let i=0;i<3;i++)g.fillRect(px+r()*30,py+r()*30,3,2);return;}
  g.fillStyle=D.road;g.fillRect(px,py,T,T);
  if(D.cobble){ // paralelepípedo
    for(let row=0;row<6;row++){const off=(row%2)*5;for(let col=-1;col<4;col++){
      const sx=px+off+col*10, sy=py+row*5.33;const v=0.85+r()*0.3;g.fillStyle=shade(D.road,v);g.fillRect(sx+1,sy+1,8,4);}}
    return;}
  g.fillStyle='rgba(0,0,0,0.08)';for(let i=0;i<4;i++)g.fillRect(px+r()*30,py+r()*30,3,2);
  if(D.worn){ // remendos e buracos
    if(r()<0.10){g.fillStyle='rgba(120,120,125,0.35)';g.fillRect(px+r()*14,py+r()*14,10+r()*14,8+r()*12);}
    if(r()<0.04){g.fillStyle='rgba(15,15,18,0.7)';g.beginPath();g.ellipse(px+8+r()*16,py+8+r()*16,4+r()*3,3+r()*2,r()*3,0,Math.PI*2);g.fill();}
  }
}
function drawSidewalk(g,px,py,X,Y,D,r){
  g.fillStyle=D.side;g.fillRect(px,py,T,T);
  if(D.sideStyle==='lajes'){g.fillStyle='rgba(0,0,0,0.12)';g.fillRect(px,py+15,T,1);g.fillRect(px+15,py,1,T);g.fillRect(px,py,T,1);g.fillRect(px,py,1,T);}
  else if(D.sideStyle==='ondas'){ // calçadão com ondas
    g.save();g.beginPath();g.rect(px,py,T,T);g.clip();g.strokeStyle='#2c2c30';g.lineWidth=3.5;
    for(const base of[4,20]){g.beginPath();for(let xx=0;xx<=T;xx+=2){const wx=X*T+xx;const yy=py+base+Math.sin(wx/9)*4;xx===0?g.moveTo(px+xx,yy):g.lineTo(px+xx,yy);}g.stroke();}
    g.restore();}
  else if(D.sideStyle==='tijolo'){g.fillStyle='rgba(60,20,15,0.35)';for(let row=0;row<8;row++){g.fillRect(px,py+row*4,T,1);const off=(row%2)*4;for(let col=0;col<5;col++)g.fillRect(px+off+col*8,py+row*4,1,4);}}
  else if(D.sideStyle==='rachado'){g.fillStyle='rgba(0,0,0,0.10)';g.fillRect(px,py+15,T,1);g.fillRect(px+15,py,1,T);
    if(r()<0.35){g.strokeStyle='rgba(40,40,40,0.4)';g.lineWidth=1;g.beginPath();let x=px+r()*T,y=py+r()*T;g.moveTo(x,y);for(let i=0;i<3;i++){x+=r()*12-6;y+=r()*12-6;g.lineTo(x,y);}g.stroke();}}
  else if(D.sideStyle==='grama'){g.fillStyle='rgba(0,0,0,0.10)';g.fillRect(px,py+15,T,1);g.fillRect(px+15,py,1,T);}
  // meio-fio (e faixa de grama no Jardim)
  const curb=(x,y,w,h)=>{g.fillStyle='#7d7b75';g.fillRect(x,y,w,h);};
  const grass=D.sideStyle==='grama';
  if(tileOf(X-1,Y)===ROAD){curb(px,py,3,T);if(grass){g.fillStyle='#5f9e4a';g.fillRect(px+3,py,5,T);}}
  if(tileOf(X+1,Y)===ROAD){curb(px+T-3,py,3,T);if(grass){g.fillStyle='#5f9e4a';g.fillRect(px+T-8,py,5,T);}}
  if(tileOf(X,Y-1)===ROAD){curb(px,py,T,3);if(grass){g.fillStyle='#5f9e4a';g.fillRect(px,py+3,T,5);}}
  if(tileOf(X,Y+1)===ROAD){curb(px,py+T-3,T,3);if(grass){g.fillStyle='#5f9e4a';g.fillRect(px,py+T-8,T,5);}}
}

// desenha marcações de um trecho. horiz: (a0..a1) no eixo x, p0 = y do topo da rua
// vertical: (a0..a1) no eixo y, p0 = x da esquerda. j = índice da rua, k = trecho
function markSegment(g,a0,p0,a1,horiz,j,k){
  const R=(a,p,w,h)=>horiz?g.fillRect(a,p,w,h):g.fillRect(p,a,h,w); // retângulo no sistema (along, perp)
  const ave=isAvenue(j), ring=RING(j);
  const midA=(a0+a1)/2;
  const cxT=horiz?((midA/T)|0):((p0/T)|0)+1, cyT=horiz?((p0/T)|0)+1:((midA/T)|0);
  const D=DISTRICTS[districtOfTile(cxT,cyT)];
  const cobble=!ave&&!ring&&D.cobble;
  // linha central
  if(ave){g.fillStyle='#e8c440';R(a0,p0+60,a1-a0,2.5);R(a0,p0+65.5,a1-a0,2.5);
    g.fillStyle='rgba(240,240,240,0.85)';R(a0,p0+4,a1-a0,2);R(a0,p0+122,a1-a0,2);}
  else if(!cobble){g.fillStyle=D.worn?'rgba(232,196,64,0.55)':'#e8c440';for(let a=a0+18;a<a1-30;a+=40)R(a,p0+62.5,22,3);}
  // ciclofaixa na Beira-Mar (lado de fora da cidade)
  if(ring){const outer=(j===0)?p0:p0+128-16;g.fillStyle='#b5392e';R(a0,outer,a1-a0,16);g.fillStyle='rgba(255,255,255,0.85)';R(a0,(j===0)?p0+16:p0+128-17,a1-a0,1.5);
    g.strokeStyle='rgba(255,255,255,0.8)';g.lineWidth=1.5;
    for(let a=a0+60;a<a1-40;a+=140){const c=horiz?[a,outer+8]:[outer+8,a];g.beginPath();g.arc(c[0]-4,c[1],3,0,Math.PI*2);g.arc(c[0]+4,c[1],3,0,Math.PI*2);g.stroke();}}
  // setas nas avenidas
  if(ave){g.fillStyle='rgba(240,240,240,0.85)';const m=midA;
    arrow(g,horiz,m,p0+(horiz?96:32),1);arrow(g,horiz,m,p0+(horiz?32:96),-1);}
  // faixas de pedestre nas duas pontas
  g.fillStyle=cobble?'rgba(240,240,240,0.55)':'rgba(240,240,240,0.75)';
  for(let i=0;i<8;i++){R(a0+2,p0+6+i*15.5,10,8);R(a1-12,p0+6+i*15.5,10,8);}
  // cruzamentos nas pontas: k (início) e k+1 (fim)
  const ixS=horiz?k:j, iyS=horiz?j:k, ixE=horiz?k+1:j, iyE=horiz?j:k+1;
  const crossIdxS=k, crossIdxE=k+1; // índice da rua que cruza
  // pista que chega no fim (sentido + : fica em p0+64..128) e no início (sentido - : p0..64)
  // sentido + (leste/sul) e sentido - (oeste/norte): no horizontal o + usa a metade de baixo; no vertical, a da esquerda
  const plusP=p0+(horiz?66:2), minusP=p0+(horiz?2:66);
  stopMark(g,R,horiz,a1-22,plusP,signalized(ixE,iyE),needPare(j,crossIdxE,ixE,iyE),+1);
  stopMark(g,R,horiz,a0+17,minusP,signalized(ixS,iyS),needPare(j,crossIdxS,ixS,iyS),-1);
  // lombada no meio do quarteirão (Jardim)
  if(D.bumps&&!ave&&!ring&&((j*7+k*3)%3===0)){for(let i=0;i<8;i++){g.fillStyle=i%2?'#1d1d1d':'#e8c440';R(midA-6,p0+i*16,12,16);}}
}
function needPare(j,cross,ix,iy){
  if(isAvenue(j)||RING(j))return false;
  if(signalized(ix,iy))return false;
  return isAvenue(cross)||RING(cross);
}
function stopMark(g,R,horiz,a,p,sig,pare,dir){
  if(!sig&&!pare)return;
  g.fillStyle='rgba(245,245,245,0.9)';R(a,p,5,60);
  if(pare){g.save();g.fillStyle='rgba(245,245,245,0.9)';g.font='bold 15px "Courier New",monospace';g.textAlign='center';g.textBaseline='middle';
    const cx=horiz?a-dir*22:p+30, cy=horiz?p+30:a-dir*22;g.translate(cx,cy);
    // texto lido por quem chega
    const ang=horiz?(dir>0?Math.PI/2:-Math.PI/2):(dir>0?Math.PI:0);g.rotate(ang);g.fillText('PARE',0,0);g.restore();}
}
function arrow(g,horiz,a,p,dir){
  g.save();if(horiz)g.translate(a,p);else{g.translate(p,a);}g.rotate(horiz?(dir>0?0:Math.PI):(dir>0?Math.PI/2:-Math.PI/2));
  g.fillRect(-18,-2.5,24,5);g.beginPath();g.moveTo(14,0);g.lineTo(4,-9);g.lineTo(4,9);g.closePath();g.fill();g.restore();
}
export function tileOf(x,y){if(x<0||y<0||x>=W||y>=H)return WATER;return map[y*W+x];}
export function getChunk(cx,cy){const k=cx+','+cy;let c=chunkCache.get(k);
  if(!c){c=renderChunk(cx,cy);chunkCache.set(k,c);if(chunkCache.size>80){const f=chunkCache.keys().next().value;chunkCache.delete(f);}}
  else{chunkCache.delete(k);chunkCache.set(k,c);} return c;}

// minimapa pré-renderizado
export const mini=document.createElement('canvas');mini.width=W;mini.height=H;
(function(){const g=mini.getContext('2d');const img=g.createImageData(W,H);
  const MC={[WATER]:[31,80,120],[SAND]:[214,196,140],[ROAD]:[70,70,78],[SIDE]:[150,150,145],[GRASS]:[80,140,60],[BUILD]:[120,110,100],[TREE]:[50,110,45],[PARK]:[90,90,98]};
  for(let i=0;i<W*H;i++){const c=MC[map[i]];img.data[i*4]=c[0];img.data[i*4+1]=c[1];img.data[i*4+2]=c[2];img.data[i*4+3]=255;}
  g.putImageData(img,0,0);
  g.fillStyle='rgba(150,150,160,1)';
  for(const i of [3,7,11]){g.fillRect(O,O+i*PER,CITY,BAND);g.fillRect(O+i*PER,O,BAND,CITY);}
  for(const z of zones){g.fillStyle=z.type==='ze'?'#ff9a3c':z.type==='armas'?'#ff4a3c':z.type==='posto'?'#ffd83c':'#3cff9a';g.fillRect(z.x0/T,z.y0/T,(z.x1-z.x0)/T,(z.y1-z.y0)/T);}
})();
