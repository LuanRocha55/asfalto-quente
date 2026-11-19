// Renderização do chão em blocos (cache) e minimapa
import { mulberry } from '../core/utils.js';
import { T, BAND, PER, O, CITY, W, H, WATER, SAND, ROAD, SIDE, GRASS, BUILD, TREE, PARK, map, zones } from './map.js';

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
    g.fillStyle=TILE_COL[t]; g.fillRect(px,py,T,T);
    if(t===WATER){g.fillStyle='rgba(255,255,255,0.06)';for(let i=0;i<3;i++)g.fillRect(px+r()*28,py+r()*30,6,1);}
    else if(t===SAND){g.fillStyle='rgba(150,120,60,0.18)';for(let i=0;i<5;i++)g.fillRect(px+r()*30,py+r()*30,2,2);}
    else if(t===GRASS||t===TREE){g.fillStyle='rgba(30,70,20,0.25)';for(let i=0;i<6;i++)g.fillRect(px+r()*30,py+r()*30,2,3);}
    else if(t===SIDE){g.fillStyle='rgba(0,0,0,0.10)';g.fillRect(px,py+15,T,1);g.fillRect(px+15,py,1,T);
      // meio-fio
      g.fillStyle='#7d7b75';
      if(tileOf(X-1,Y)===ROAD)g.fillRect(px,py,3,T);
      if(tileOf(X+1,Y)===ROAD)g.fillRect(px+T-3,py,3,T);
      if(tileOf(X,Y-1)===ROAD)g.fillRect(px,py,T,3);
      if(tileOf(X,Y+1)===ROAD)g.fillRect(px,py+T-3,T,3);}
    else if(t===PARK){g.fillStyle='rgba(255,255,255,0.35)';if(X%3===0)g.fillRect(px,py+4,2,24);}
    else if(t===ROAD){
      g.fillStyle='rgba(0,0,0,0.08)';for(let i=0;i<4;i++)g.fillRect(px+r()*30,py+r()*30,3,2);
      const hb=isRoadBand(Y), vb=isRoadBand(X);
      if(hb&&!vb){ const b=bandIdx(Y);
        if(b===1&&X%2===0){g.fillStyle='#e8c440';g.fillRect(px+4,py+T-2,20,3);}  // faixa central
        if(b===2&&X%2===0){g.fillStyle='#e8c440';g.fillRect(px+4,py-1,20,2);}
        const bx=bandIdx(X); if(bx===BAND||bx===PER-1){g.fillStyle='rgba(240,240,240,0.7)';for(let i=0;i<4;i++)g.fillRect(px+(bx===BAND?2:20),py+i*8+2,10,4);} // faixa de pedestre
      } else if(vb&&!hb){ const b=bandIdx(X);
        if(b===1&&Y%2===0){g.fillStyle='#e8c440';g.fillRect(px+T-2,py+4,3,20);}
        if(b===2&&Y%2===0){g.fillStyle='#e8c440';g.fillRect(px-1,py+4,2,20);}
        const by=bandIdx(Y); if(by===BAND||by===PER-1){g.fillStyle='rgba(240,240,240,0.7)';for(let i=0;i<4;i++)g.fillRect(px+i*8+2,py+(by===BAND?2:20),4,10);}
      }
    }
  }
  return c;
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
  for(const z of zones){g.fillStyle=z.type==='ze'?'#ff9a3c':z.type==='armas'?'#ff4a3c':'#3cff9a';g.fillRect(z.x0/T,z.y0/T,(z.x1-z.x0)/T,(z.y1-z.y0)/T);}
})();
