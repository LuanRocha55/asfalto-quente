// Bairros, avenidas, nomes de rua e semáforos
import { T, BAND, PER, NI, O, CITY } from './map.js';
import { S } from '../core/state.js';

// estilos visuais de cada bairro
export const DISTRICTS = {
  centro:  { name:'CENTRO',            road:'#2f2f36', side:'#b8b5ad', sideStyle:'lajes' },
  orla:    { name:'ORLA',              road:'#3d3d45', side:'#e9e6dc', sideStyle:'ondas' },
  velha:   { name:'VILA VELHA',        road:'#6e655c', side:'#a85a4a', sideStyle:'tijolo', cobble:true },
  cajueiro:{ name:'ALTO DO CAJUEIRO',  road:'#48484e', side:'#9a968c', sideStyle:'rachado', worn:true },
  jardim:  { name:'JARDIM MARESIA',    road:'#3b3b42', side:'#a9a7a0', sideStyle:'grama', bumps:true },
};

// índices das ruas que são avenidas (nas duas direções)
export const AVENUES = new Set([3,7,11]);
export const RING = i => i===0 || i===NI-1;
export const isAvenue = i => AVENUES.has(i);

export function districtOfBlock(bi,bj){
  bi=Math.max(0,Math.min(NI-2,bi)); bj=Math.max(0,Math.min(NI-2,bj));
  if(bi===0||bj===0||bi===NI-2||bj===NI-2) return 'orla';
  if(Math.hypot(bi-6.5,bj-6.5)<3.3) return 'centro';
  if(bj>=7&&bi<7) return 'velha';
  if(bj>=7) return 'cajueiro';
  return 'jardim';
}
// bairro de um tile (ruas usam o quarteirão mais próximo)
export function districtOfTile(tx,ty){
  const cx=tx-O, cy=ty-O;
  const bi=Math.floor((cx-BAND/2)/PER), bj=Math.floor((cy-BAND/2)/PER);
  return districtOfBlock(bi,bj);
}
export const districtAt = (px,py) => DISTRICTS[districtOfTile(px/T|0,py/T|0)];

// nomes fictícios das ruas
const H_NAMES = ['Av. Beira-Mar','Rua das Jangadas','Rua do Farol','Av. Sol Nascente','Rua dos Pescadores','Rua da Rendeira','Rua das Gaivotas',
  'Av. Central','Rua Coqueiral','Rua da Maré','Rua do Mangue','Av. Atlântica','Rua Areia Branca','Rua dos Ventos','Av. Beira-Mar'];
const V_NAMES = ['Av. Beira-Mar','Rua da Brisa','Rua do Sal','Av. dos Coqueiros','Rua Tapioca','Rua da Rede','Rua do Caju',
  'Av. Maresia','Rua Carnaúba','Rua Baião','Rua do Xote','Av. do Porto','Rua do Forró','Rua do Vaqueiro','Av. Beira-Mar'];
export const hName = j => H_NAMES[j];
export const vName = i => V_NAMES[i];

// índice da rua horizontal/vertical em que um ponto está (ou -1)
export function roadIndexAt(px,py){
  const cx=(px/T|0)-O, cy=(py/T|0)-O;
  const inX=cx>=0&&cx<CITY, inY=cy>=0&&cy<CITY;
  const h=(inX&&inY&&cy%PER<BAND)?Math.floor(cy/PER):-1;
  const v=(inX&&inY&&cx%PER<BAND)?Math.floor(cx/PER):-1;
  return {h,v};
}
export function streetAt(px,py){
  const {h,v}=roadIndexAt(px,py);
  if(h>=0&&v>=0) return hName(h)+' × '+vName(v);
  if(h>=0) return hName(h);
  if(v>=0) return vName(v);
  return '';
}

// ---- semáforos: em todo cruzamento que tem pelo menos uma avenida ----
export const signalized = (ix,iy) => (isAvenue(ix)||isAvenue(iy)) && !RING(ix) && !RING(iy);
const CYCLE = 15; // verde 6s, amarelo 1.5s pra cada direção
// axis 'h' = quem anda na horizontal, 'v' = vertical. retorna 'g' | 'y' | 'r'
export function signalState(ix,iy,axis){
  const t=(S.gameTime+(ix*3+iy*5)%CYCLE)%CYCLE;
  const hs = t<6?'g':t<7.5?'y':'r';
  const vs = t<7.5?'r':t<13.5?'g':'y';
  return axis==='h'?hs:vs;
}
