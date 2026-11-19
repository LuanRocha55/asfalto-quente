// Geração da cidade: tiles, prédios, árvores, zonas e orelhões
import { rng, rand, pick } from '../core/utils.js';
import { S } from '../core/state.js';

export const T=32, BAND=4, PER=16, NI=15, O=12;
export const CITY=(NI-1)*PER+BAND;              // 228 tiles
export const W=CITY+O*2, H=W;                    // 252
export const PX=PER*T;                           // 512 px entre cruzamentos
export const WORLD=W*T;
export const WATER=0,SAND=1,ROAD=2,SIDE=3,GRASS=4,BUILD=5,TREE=6,PARK=7;
export const map=new Uint8Array(W*H);
export const roadPx=i=>(O+i*PER)*T;
export const LANE_OFF=[96,32,32,96]; // E,S,O,N
export const DX=[1,0,-1,0], DY=[0,1,0,-1];

export const buildings=[];
export const trees=[];
export const zones=[];
export const phones=[];
export const lamps=[];
export const pumps=[];
export let hospitalSpot, policeSpot;
export const special={};

export function tileAt(px,py){const x=px/T|0,y=py/T|0;if(x<0||y<0||x>=W||y>=H)return WATER;return map[y*W+x];}
export function isSolidT(t){return t===WATER||t===BUILD||t===TREE;}
export function solidAt(px,py){return isSolidT(tileAt(px,py));}
export function setT(x,y,t){if(x>=0&&y>=0&&x<W&&y<H)map[y*W+x]=t;}

export const WALLS=['#d98b5f','#e6c27a','#7fb7a8','#e89aa3','#efe3c8','#c9a3d4','#8fb1d9','#d6d06b','#b8846a','#9ccf8f','#f0b37e','#a7a2a0'];
export const ROOFS=['#6b6460','#5d6670','#7a6a5a','#4f5a52','#6e5c6a','#857b6c'];

export function genMap(){
  map.fill(WATER);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const cx=x-O, cy=y-O;
    if(cx>=-3&&cx<CITY+3&&cy>=-3&&cy<CITY+3) map[y*W+x]=SAND;
    if(cx>=0&&cx<CITY&&cy>=0&&cy<CITY){
      const rx=cx%PER<BAND, ry=cy%PER<BAND;
      if(rx||ry) map[y*W+x]=ROAD;
      else{const lx=cx%PER-BAND, ly=cy%PER-BAND;
        map[y*W+x]=(lx===0||lx===11||ly===0||ly===11)?SIDE:GRASS;}
    }
  }
  const specials={'2,2':'hospital','11,3':'policia','5,9':'pintura','10,11':'pintura2','3,11':'ze','6,3':'estac','12,8':'estac2','7,12':'estac3','9,6':'armas','4,5':'posto','10,2':'posto2','1,2':'casa'};
  for(let bj=0;bj<NI-1;bj++)for(let bi=0;bi<NI-1;bi++){
    const ix=O+bi*PER+BAND+1, iy=O+bj*PER+BAND+1; // interior 10x10
    const key=bi+','+bj; const sp=specials[key];
    const cxd=Math.abs(bi-6.5), cyd=Math.abs(bj-6.5);
    const downtown=Math.max(0,1-Math.hypot(cxd,cyd)/7);
    if(sp==='hospital'||sp==='policia'){
      fillLot(ix,iy,10,6,BUILD);
      for(let y=iy+6;y<iy+10;y++)for(let x=ix;x<ix+10;x++)setT(x,y,PARK);
      buildings.push({x0:ix*T,y0:iy*T,x1:(ix+10)*T,y1:(iy+6)*T,h:34,wall:sp==='hospital'?'#f2f2ee':'#c8d2e0',roof:sp==='hospital'?'#e9e9e4':'#3c5a8a',kind:sp,seed:rng()});
      const spot={x:(ix+5)*T,y:(iy+10)*T+T*1.5};
      if(sp==='hospital')hospitalSpot=spot;else policeSpot=spot;
      continue;
    }
    if(sp==='casa'){
      // quintal com a casa do jogador no meio
      for(let y=iy;y<iy+10;y++)for(let x=ix;x<ix+10;x++)setT(x,y,GRASS);
      for(let y=iy+7;y<iy+10;y++)setT(ix+4,y,SIDE),setT(ix+5,y,SIDE);
      fillLot(ix+2,iy+1,6,6,BUILD);
      const b={x0:(ix+2)*T,y0:(iy+1)*T,x1:(ix+8)*T,y1:(iy+7)*T,h:22,wall:'#f0e0c0',roof:'#9c4a32',kind:'casa',seed:rng()};
      buildings.push(b);special.casa=b;continue;
    }
    if(sp==='posto'||sp==='posto2'){
      for(let y=iy;y<iy+10;y++)for(let x=ix;x<ix+10;x++)setT(x,y,PARK);
      fillLot(ix,iy,10,2,BUILD);
      buildings.push({x0:ix*T,y0:iy*T,x1:(ix+10)*T,y1:(iy+2)*T,h:16,wall:'#e9e2d0',roof:'#c9342a',kind:'lojaposto',seed:rng()});
      // cobertura das bombas: não é sólida, os carros passam por baixo
      buildings.push({x0:(ix+1.5)*T,y0:(iy+3.5)*T,x1:(ix+8.5)*T,y1:(iy+8.5)*T,h:20,wall:'#dddddd',roof:'#f2f2ee',kind:'canopy',seed:rng()});
      for(let i=0;i<3;i++)pumps.push({x:(ix+3+i*2)*T,y:(iy+6)*T});
      const z={x0:(ix+1.5)*T,y0:(iy+3.5)*T,x1:(ix+8.5)*T,y1:(iy+8.5)*T,type:'posto',label:'CONSERTO $150'};
      zones.push(z); special[sp]=z; continue;
    }
    if(sp==='armas'){
      for(let y=iy;y<iy+10;y++)for(let x=ix;x<ix+10;x++)setT(x,y,PARK);
      fillLot(ix,iy,10,3,BUILD);
      buildings.push({x0:ix*T,y0:iy*T,x1:(ix+10)*T,y1:(iy+3)*T,h:24,wall:'#8a3b2f',roof:'#4a2420',kind:'armas',seed:rng()});
      const z={x0:(ix+1)*T,y0:(iy+4)*T,x1:(ix+9)*T,y1:(iy+9)*T,type:'armas',label:'A PÉ: PISA NA ARMA PRA COMPRAR',pads:[]};
      ['pistola','escopeta','smg'].forEach((w,i)=>z.pads.push({x0:(ix+1.5+i*2.5)*T,y0:(iy+5)*T,x1:(ix+3.5+i*2.5)*T,y1:(iy+8)*T,weapon:w}));
      zones.push(z); special.armas=z; continue;
    }
    if(sp==='pintura'||sp==='pintura2'||sp==='ze'){
      for(let y=iy;y<iy+10;y++)for(let x=ix;x<ix+10;x++)setT(x,y,PARK);
      fillLot(ix,iy,10,3,BUILD);
      buildings.push({x0:ix*T,y0:iy*T,x1:(ix+10)*T,y1:(iy+3)*T,h:22,wall:sp==='ze'?'#b5651d':'#2f8f6f',roof:sp==='ze'?'#6a4a2a':'#226b52',kind:sp,seed:rng()});
      const z={x0:(ix+1)*T,y0:(iy+4)*T,x1:(ix+9)*T,y1:(iy+9)*T,type:sp==='ze'?'ze':'pintura',label:sp==='ze'?'OFICINA DO ZÉ':'PINTURA EXPRESS $500'};
      zones.push(z); special[sp]=z; continue;
    }
    if(sp&&sp.startsWith('estac')){
      for(let y=iy;y<iy+10;y++)for(let x=ix;x<ix+10;x++)setT(x,y,PARK);
      special[sp]={x:(ix+5)*T,y:(iy+5)*T};continue;
    }
    const r=rng();
    if(r<0.11&&downtown<0.6){ // praça
      for(let y=iy;y<iy+10;y++)for(let x=ix;x<ix+10;x++){
        const lx=x-ix, ly=y-iy;
        if(lx===4||lx===5||ly===4||ly===5) setT(x,y,SIDE);
        else if(rng()<0.22){setT(x,y,TREE);trees.push({x:(x+.5)*T,y:(y+.5)*T,r:rand(13,18),c:pick(['#2e7d32','#388e3c','#33691e','#2f6b3a'])});}
      }
      continue;
    }
    // lotes de prédios
    const pattern=rng();
    let lots=[];
    if(pattern<0.25) lots=[[0,0,10,10]];
    else if(pattern<0.55) lots=rng()<.5?[[0,0,5,10],[5,0,5,10]]:[[0,0,10,5],[0,5,10,5]];
    else if(pattern<0.85) lots=[[0,0,5,5],[5,0,5,5],[0,5,5,5],[5,5,5,5]];
    else lots=[[0,0,6,10],[6,0,4,4],[6,6,4,4]];
    for(const [lx,ly,lw,lh] of lots){
      // pequena margem às vezes (pátio)
      const inset=rng()<0.3?1:0;
      const bx=ix+lx+inset, by=iy+ly+inset, bw=lw-inset*2, bh=lh-inset*2;
      if(bw<2||bh<2)continue;
      fillLot(bx,by,bw,bh,BUILD);
      const h=Math.round(18+rng()*30+downtown*downtown*90*rng()+downtown*20);
      buildings.push({x0:bx*T,y0:by*T,x1:(bx+bw)*T,y1:(by+bh)*T,h,wall:WALLS[Math.floor(rng()*WALLS.length)],roof:ROOFS[Math.floor(rng()*ROOFS.length)],kind:'b',seed:rng()});
      if(inset){ // pátio vira calçada
        for(let y=iy+ly;y<iy+ly+lh;y++)for(let x=ix+lx;x<ix+lx+lw;x++)if(map[y*W+x]===GRASS)setT(x,y,rng()<.5?GRASS:SIDE);
      }
    }
  }
  // alguns prédios viram comércio com placa no telhado
  const POI={farmacia:{roof:'#f2f2ee',wall:'#d9e8d9'},mercadinho:{roof:'#e8a33a',wall:'#f0d9a8'},padaria:{roof:'#b9824a',wall:'#efdcc0'},
    escola:{roof:'#3f6fb0',wall:'#e7e0c9'},lanchonete:{roof:'#c0392b',wall:'#f3d36b'}};
  for(const b of buildings){
    if(b.kind!=='b')continue;
    const w=(b.x1-b.x0)/T, h=(b.y1-b.y0)/T; if(w<4||h<4)continue;
    const r=rng(); let k=null;
    if(r<0.05)k='farmacia';else if(r<0.10)k='mercadinho';else if(r<0.14)k='padaria';else if(r<0.18&&w>=5&&h>=5)k='escola';else if(r<0.22)k='lanchonete';
    if(k){b.kind=k;b.roof=POI[k].roof;b.wall=POI[k].wall;b.h=Math.min(b.h,24);}
  }
  // árvores na orla
  for(let i=0;i<90;i++){
    const side=Math.floor(rng()*4); const t=O+Math.floor(rng()*CITY);
    let x,y; if(side===0){x=t;y=O-2;}else if(side===1){x=t;y=O+CITY+1;}else if(side===2){x=O-2;y=t;}else{x=O+CITY+1;y=t;}
    if(map[y*W+x]===SAND&&rng()<.5){setT(x,y,TREE);trees.push({x:(x+.5)*T,y:(y+.5)*T,r:rand(12,16),c:'#3f8f3a',palm:true});}
  }
  // orelhões
  const phoneBlocks=[[3,2],[1,5],[6,6],[9,1],[8,9],[12,5],[2,9],[11,12]];
  for(const [bi,bj] of phoneBlocks){
    const x=O+bi*PER+BAND, y=O+bj*PER+BAND; // canto da calçada
    phones.push({x:(x+.5)*T,y:(y+.5)*T});
  }
  // postes de luz nas calçadas (cantos e meio de cada quarteirão)
  for(let j=0;j<NI-1;j++)for(let i=0;i<NI-1;i++){
    const bx=O+i*PER+BAND, by=O+j*PER+BAND;
    const pts=[[bx,by],[bx+11,by],[bx,by+11],[bx+11,by+11],[bx+6,by],[bx+6,by+11],[bx,by+6],[bx+11,by+6]];
    for(const [x,y] of pts){
      if(map[y*W+x]!==SIDE)continue;
      const lx=(x+.5)*T, ly=(y+.5)*T;
      if(phones.some(p=>Math.abs(p.x-lx)<20&&Math.abs(p.y-ly)<20))continue;
      lamps.push({x:lx,y:ly});
    }
  }
}
export function fillLot(x0,y0,w,h,t){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)setT(x,y,t);}
genMap();
