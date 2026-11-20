// Constrói a cidade estática em 3D (uma vez): prédios com janelas e telhados, árvores, postes,
// semáforos, enfeites, estádio. Unidade: 1 = 1 tile (32 px). X = x do mundo, Z = y do mundo, Y = altura.
import * as THREE from '../../vendor/three/three.module.min.js';
import { mulberry } from '../core/utils.js';
import { T, ROAD, tileAt, buildings, trees, lamps, decor, pumps, phones, special, VL, HL, NV, NH, isJunction } from '../world/map.js';
import { signalized } from '../world/districts.js';
import { BUS_STOPS } from '../game/jobs.js';
import { roofSign } from '../render/draw.js';
import { mergePlain } from './models97.js';

export const U=1/T;                         // px -> unidade
export const HSCALE=2.2/T;                  // altura "2D" -> unidade
export const bh=b=>Math.max(0.35,b.h*HSCALE);

// ---------- montador de geometria com cor por vértice ----------
export class Geo{
  constructor(){this.p=[];this.n=[];this.c=[];}
  quad(a,b,c,d,nx,ny,nz,col){ // a,b,c,d em sentido anti-horário visto de fora
    for(const v of [a,b,c,a,c,d]){this.p.push(v[0],v[1],v[2]);this.n.push(nx,ny,nz);this.c.push(col.r,col.g,col.b);}
  }
  tri(a,b,c,nx,ny,nz,col){for(const v of [a,b,c]){this.p.push(v[0],v[1],v[2]);this.n.push(nx,ny,nz);this.c.push(col.r,col.g,col.b);}}
  box(x0,z0,x1,z1,y0,y1,top,side,shadeSides=true){
    const s=shadeSides?[0.82,0.92,0.72,0.78]:[1,1,1,1];
    const sc=(k)=>new THREE.Color(side).multiplyScalar(s[k]);
    if(top)this.quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],0,1,0,new THREE.Color(top));
    this.quad([x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0],0,0,-1,sc(0)); // norte
    this.quad([x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x0,y0,z1],0,0,1,sc(1));  // sul
    this.quad([x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0],-1,0,0,sc(2)); // oeste
    this.quad([x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],1,0,0,sc(3));  // leste
  }
  mesh(mat){const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));
    g.computeBoundingSphere();return new THREE.Mesh(g,mat);}
}
const C=hex=>new THREE.Color(hex);

// ---------- setores: a cidade é cortada em blocos de 32x32 tiles pra GPU só desenhar o que está à vista ----------
const SEC=32;
const sk=(x,z)=>Math.floor(x/SEC)+','+Math.floor(z/SEC);
class SGeo{ // vários Geo, um por setor
  constructor(){this.m=new Map();}
  at(x,z){const k=sk(x,z);let g=this.m.get(k);if(!g){g=new Geo();this.m.set(k,g);}return g;}
  meshes(mat){const out=[];for(const g of this.m.values())if(g.p.length)out.push(g.mesh(mat));return out;}
}
// InstancedMesh dividido por setor, com índice global
class SInst{
  constructor(geo,mat,pts){
    this.map=[];const buckets=new Map();
    pts.forEach((p,i)=>{const k=sk(p[0],p[1]);let a=buckets.get(k);if(!a){a=[];buckets.set(k,a);}this.map[i]=[k,a.length];a.push(i);});
    this.meshes=new Map();
    for(const [k,a] of buckets)this.meshes.set(k,new THREE.InstancedMesh(geo,mat,a.length));
  }
  setMatrixAt(i,M){const [k,j]=this.map[i];this.meshes.get(k).setMatrixAt(j,M);}
  setColorAt(i,c){const [k,j]=this.map[i];this.meshes.get(k).setColorAt(j,c);}
  colorsDirty(){for(const m of this.meshes.values())if(m.instanceColor)m.instanceColor.needsUpdate=true;}
  add(scene,cast=false){for(const m of this.meshes.values()){m.computeBoundingSphere();m.castShadow=cast;scene.add(m);}return this;}
  get list(){return [...this.meshes.values()];}
}

// telhado de duas águas (casas)
function gable(G,x0,z0,x1,z1,y,h,roof){
  const col=C(roof), along=(x1-x0)>=(z1-z0);
  if(along){const zm=(z0+z1)/2;
    G.quad([x0,y,z1],[x1,y,z1],[x1,y+h,zm],[x0,y+h,zm],0,0.7,0.7,col);
    G.quad([x1,y,z0],[x0,y,z0],[x0,y+h,zm],[x1,y+h,zm],0,0.7,-0.7,col.clone().multiplyScalar(0.85));
    const w=C('#e8e0d0');G.tri([x0,y,z0],[x0,y,z1],[x0,y+h,zm],-1,0,0,w);G.tri([x1,y,z1],[x1,y,z0],[x1,y+h,zm],1,0,0,w);}
  else{const xm=(x0+x1)/2;
    G.quad([x1,y,z1],[x1,y,z0],[xm,y+h,z0],[xm,y+h,z1],0.7,0.7,0,col);
    G.quad([x0,y,z0],[x0,y,z1],[xm,y+h,z1],[xm,y+h,z0],-0.7,0.7,0,col.clone().multiplyScalar(0.85));
    const w=C('#e8e0d0');G.tri([x0,y,z1],[x1,y,z1],[xm,y+h,z1],0,0,1,w);G.tri([x1,y,z0],[x0,y,z0],[xm,y+h,z0],0,0,-1,w);}
}

// telhado de quatro águas com beiral (casa brasileira dos anos 80/90), telha de barro
function hip(G,x0,z0,x1,z1,y,h,roof){
  const ov=0.18;x0-=ov;z0-=ov;x1+=ov;z1+=ov;
  const col=C(roof),dark=col.clone().multiplyScalar(0.78),mid=col.clone().multiplyScalar(0.9);
  const along=(x1-x0)>=(z1-z0),inset=Math.min(x1-x0,z1-z0)/2;
  const r0=along?[x0+inset,y+h,(z0+z1)/2]:[(x0+x1)/2,y+h,z0+inset], r1=along?[x1-inset,y+h,(z0+z1)/2]:[(x0+x1)/2,y+h,z1-inset];
  if(along){
    G.quad([x0,y,z1],[x1,y,z1],r1,r0,0,0.75,0.66,col);
    G.quad([x1,y,z0],[x0,y,z0],r0,r1,0,0.75,-0.66,dark);
    G.tri([x0,y,z0],[x0,y,z1],r0,-0.66,0.75,0,mid);G.tri([x1,y,z1],[x1,y,z0],r1,0.66,0.75,0,mid);
  }else{
    G.quad([x1,y,z1],[x1,y,z0],r0,r1,0.66,0.75,0,mid);
    G.quad([x0,y,z0],[x0,y,z1],r1,r0,-0.66,0.75,0,mid);
    G.tri([x0,y,z1],[x1,y,z1],r1,0,0.75,0.66,col);G.tri([x1,y,z0],[x0,y,z0],r0,0,0.75,-0.66,dark);
  }
  // espessura do beiral (faixa escura embaixo da telha)
  G.quad([x0,y-0.06,z1],[x1,y-0.06,z1],[x1,y,z1],[x0,y,z1],0,0,1,dark);
}
// detalhes de fachada de época na frente (lado sul, que fica de frente pra câmera)
const SHUTTERS=['#2e6b4f','#2c4f7c','#7a4a2a','#a33b2b','#3b6e6e'];
function facade(G,b,x0,z0,x1,z1,H,kind){
  const r=mulberry(Math.floor(b.seed*1e9)+31), w=x1-x0, zf=z1+0.012;
  const base=C(b.wall).multiplyScalar(0.62);
  // barra (rodapé pintado mais escuro) em volta
  G.quad([x0,0,zf],[x1,0,zf],[x1,0.28,zf],[x0,0.28,zf],0,0,1,base);
  G.quad([x0-0.012,0,z0],[x0-0.012,0,z1],[x0-0.012,0.28,z1],[x0-0.012,0.28,z0],-1,0,0,base);
  G.quad([x1+0.012,0,z1],[x1+0.012,0,z0],[x1+0.012,0.28,z0],[x1+0.012,0.28,z1],1,0,0,base);
  if(kind==='casa'){
    // porta de madeira e janelas com veneziana
    const sh=C(SHUTTERS[Math.floor(r()*SHUTTERS.length)]),door=C('#6b4a2e'),frame=C('#f2efe8');
    const dx=x0+w*(0.2+r()*0.15);
    G.quad([dx-0.05,0,zf+0.002],[dx+0.55,0,zf+0.002],[dx+0.55,0.95,zf+0.002],[dx-0.05,0.95,zf+0.002],0,0,1,frame);
    G.quad([dx,0,zf+0.004],[dx+0.5,0,zf+0.004],[dx+0.5,0.9,zf+0.004],[dx,0.9,zf+0.004],0,0,1,door);
    const n=Math.max(1,Math.floor((w-1.2)/1.1));
    for(let k=0;k<n;k++){const wx=dx+0.9+k*1.05;if(wx+0.7>x1-0.15)break;
      G.quad([wx-0.05,0.38,zf+0.002],[wx+0.75,0.38,zf+0.002],[wx+0.75,1.0,zf+0.002],[wx-0.05,1.0,zf+0.002],0,0,1,frame);
      G.quad([wx,0.42,zf+0.004],[wx+0.33,0.42,zf+0.004],[wx+0.33,0.96,zf+0.004],[wx,0.96,zf+0.004],0,0,1,sh);
      G.quad([wx+0.37,0.42,zf+0.004],[wx+0.7,0.42,zf+0.004],[wx+0.7,0.96,zf+0.004],[wx+0.37,0.96,zf+0.004],0,0,1,sh);}
  } else if(kind==='loja'){
    // porta de aço de enrolar e toldo listrado
    const steel=C('#8e9499'),steel2=C('#6f757a');
    const dw=Math.min(w*0.7,3.2),dx=x0+(w-dw)/2;
    for(let k=0;k<8;k++){const y0=k*0.12,y1=y0+0.12;G.quad([dx,y0,zf+0.003],[dx+dw,y0,zf+0.003],[dx+dw,y1,zf+0.003],[dx,y1,zf+0.003],0,0,1,k%2?steel:steel2);}
    G.quad([dx-0.06,0,zf+0.002],[dx+dw+0.06,0,zf+0.002],[dx+dw+0.06,1.02,zf+0.002],[dx-0.06,1.02,zf+0.002],0,0,1,C('#3a3a3a'));
    const cols=[C(['#c62828','#1565c0','#2e7d32','#ef6c00'][Math.floor(r()*4)]),C('#f5f1e6')];
    const aw=Math.min(w*0.86,3.8),ax=x0+(w-aw)/2,n=Math.max(4,Math.round(aw/0.3)),y=1.25,d=0.55;
    for(let k=0;k<n;k++){const a=ax+aw*k/n,bb=ax+aw*(k+1)/n,c=cols[k%2];
      G.quad([a,y-0.32,zf+d],[bb,y-0.32,zf+d],[bb,y,zf],[a,y,zf],0,0.85,0.5,c);
      G.quad([a,y-0.42,zf+d],[bb,y-0.42,zf+d],[bb,y-0.32,zf+d],[a,y-0.32,zf+d],0,0,1,c);}
  } else if(kind==='predio'){
    // varandas com guarda-corpo em cada andar (prédio residencial dos anos 80/90)
    const floorH=0.95,rows=Math.floor((H-0.4)/floorH),rail=C('#e9e6df'),slab=C('#cfcac0');
    const bw=Math.min(w*0.8,4),bx=x0+(w-bw)/2;
    for(let row=1;row<rows;row++){const y=row*floorH+0.1;
      G.box(bx,z1,bx+bw,z1+0.35,y,y+0.06,'#cfcac0','#bdb7ab');
      G.quad([bx,y+0.06,z1+0.35],[bx+bw,y+0.06,z1+0.35],[bx+bw,y+0.38,z1+0.35],[bx,y+0.38,z1+0.35],0,0,1,rail);}
  }
}

// janelas: vidro em todas e luz acesa em parte delas (aparece só de noite)
function windows(Gw,Gl,b,x0,z0,x1,z1,H,startY){
  if(['conteiner','barraca','salva-vidas'].includes(b.style))return;
  const floorH=b.style==='galpao'?2.2:0.95, rows=Math.max(1,Math.floor((H-0.3)/floorH));
  const r=mulberry(Math.floor(b.seed*1e9)+7);
  const glass=C(b.style==='torre'||b.style==='hotel'?'#5b7c99':'#3e4f5e');
  const lit=C('#ffd98a');
  const faces=[[x0,z0,x1,z0,0,-1],[x1,z1,x0,z1,0,1],[x0,z1,x0,z0,-1,0],[x1,z0,x1,z1,1,0]];
  for(const [ax,az,bx,bz,nx,nz] of faces){
    const len=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.floor(len/1.1)), off=0.02;
    for(let row=0;row<rows;row++){
      const y0=(startY||0.35)+row*floorH, y1=y0+floorH*0.5; if(y1>H-0.15)break;
      for(let k=0;k<n;k++){
        const t0=(k+0.25)/n,t1=(k+0.75)/n;
        const p0=[ax+(bx-ax)*t0+nx*off,0,az+(bz-az)*t0+nz*off],p1=[ax+(bx-ax)*t1+nx*off,0,az+(bz-az)*t1+nz*off];
        const q=[[p0[0],y0,p0[2]],[p1[0],y0,p1[2]],[p1[0],y1,p1[2]],[p0[0],y1,p0[2]]];
        Gw.quad(q[0],q[1],q[2],q[3],nx,0,nz,glass);
        if(r()<0.38)Gl.quad(q[0],q[1],q[2],q[3],nx,0,nz,lit);
      }
    }
  }
}

// textura do telhado com o ícone/placa do lugar (reaproveita o desenho 2D)
function roofTexture(b){
  const w=Math.round(b.x1-b.x0), h=Math.round(b.y1-b.y0);
  const cv=document.createElement('canvas');cv.width=Math.min(1024,w*2);cv.height=Math.min(1024,h*2);
  const g=cv.getContext('2d');g.scale(cv.width/w,cv.height/h);
  g.fillStyle=b.roof||b.wall;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(255,255,255,0.25)';g.lineWidth=4;g.strokeRect(3,3,w-6,h-6);
  roofSign(g,b,0,0,w,h);
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;return tx;
}

export function buildCity(scene,mats){
  const SG=new SGeo(), SGw=new SGeo(), SGl=new SGeo();
  const special3d=[];
  for(const b of buildings){
    if(b.kind==='estadio'){special3d.push(buildStadium(b,mats));continue;}
    const x0=b.x0*U,z0=b.y0*U,x1=b.x1*U,z1=b.y1*U,H=bh(b);
    const cx=(x0+x1)/2,cz=(z0+z1)/2, G=SG.at(cx,cz), Gw=SGw.at(cx,cz), Gl=SGl.at(cx,cz);
    if(b.kind==='canopy'){ // cobertura do posto: pilares + laje fina
      for(const [px,pz] of [[x0+0.3,z0+0.3],[x1-0.5,z0+0.3],[x0+0.3,z1-0.5],[x1-0.5,z1-0.5]])G.box(px,pz,px+0.2,pz+0.2,0,H,'#9e9e9e','#9e9e9e');
      G.box(x0,z0,x1,z1,H,H+0.25,'#f2f2ee','#c9342a',false);continue;}
    const pitched=['casa','casario','casinha','mansao'].includes(b.style)&&b.kind==='b';
    const isPOI=b.kind!=='b';
    G.box(x0,z0,x1,z1,0,H,(isPOI||pitched)?null:(b.roof||b.wall),b.wall);
    if(pitched){facade(G,b,x0,z0,x1,z1,H,'casa');if(H>1.6)windows(Gw,Gl,b,x0,z0,x1,z1,H,1.2);}
    else{windows(Gw,Gl,b,x0,z0,x1,z1,H);if(isPOI&&!['hospital','policia','escola','casa','canopy','lojaposto'].includes(b.kind))facade(G,b,x0,z0,x1,z1,H,'loja');
      else if(b.kind==='casa')facade(G,b,x0,z0,x1,z1,H,'casa');
      else if(b.style==='predio'||b.style==='casario')facade(G,b,x0,z0,x1,z1,H,'predio');}
    if(pitched)hip(G,x0,z0,x1,z1,H,Math.min(1.0,Math.min(x1-x0,z1-z0)*0.3),b.roof);
    else if(isPOI){ // telhado com placa: malha separada com textura
      const geo=new THREE.PlaneGeometry(x1-x0,z1-z0);geo.rotateX(-Math.PI/2);
      const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:roofTexture(b)}));m.position.set((x0+x1)/2,H+0.01,(z0+z1)/2);m.receiveShadow=true;scene.add(m);
    } else { // caixa d'água e ar-condicionado no telhado
      const r=mulberry(Math.floor(b.seed*1e9));const n=Math.floor(r()*3)+((x1-x0)*(z1-z0)>40?2:0);
      for(let k=0;k<n;k++){const px=x0+0.5+r()*Math.max(0.1,x1-x0-1.5),pz=z0+0.5+r()*Math.max(0.1,z1-z0-1.5);
        if(r()<0.5)G.box(px,pz,px+0.7,pz+0.7,H,H+0.6,'#4f8fd3','#2f6fb3');else G.box(px,pz,px+0.8,pz+0.5,H,H+0.35,'#b0b0b0','#8a8a8a');}
      if(b.style==='torre'||b.style==='hotel')G.box(x0+0.2,z0+0.2,x1-0.2,z1-0.2,H,H+0.15,'#6b7680','#6b7680'); // mureta
    }
  }
  // bombas de gasolina, pontos de ônibus, orelhões
  let G;
  for(const p of pumps){const x=p.x*U,z=p.y*U;G=SG.at(x,z);G.box(x-0.2,z-0.3,x+0.2,z+0.3,0,0.9,'#c9342a','#c9342a');}
  for(const s of BUS_STOPS){const x=(s.x+s.side.x*s.off)*U,z=(s.y+s.side.y*s.off)*U;const horiz=s.side.x===0;G=SG.at(x,z);
    const w=horiz?1.4:0.4,d=horiz?0.4:1.4;G.box(x-w,z-d,x+w,z+d,1.5,1.62,'#1565c0','#1565c0');
    for(const [px,pz] of [[x-w,z-d],[x+w-0.1,z+d-0.1]])G.box(px,pz,px+0.1,pz+0.1,0,1.5,'#cfd8dc','#cfd8dc');}
  for(const ph of phones){const x=ph.x*U,z=ph.y*U;G=SG.at(x,z);G.box(x-0.05,z-0.05,x+0.05,z+0.05,0,1.45,'#555','#555');}
  const shellG=new THREE.SphereGeometry(0.42,12,8,0,Math.PI*2,0,Math.PI*0.62);shellG.scale(1,1.15,1);
  // guindastes do porto
  for(const d of decor)if(d.type==='guindaste'){const x=d.x*U,z=d.y*U;G=SG.at(x,z);G.box(x-1.2,z-0.8,x+1.2,z+0.8,0,6,'#f9a825','#f9a825');G.box(x-0.3,z-0.3,x+0.3,z+5,6,6.6,'#f9a825','#f9a825');}

  {const shells=new SInst(shellG,mats.shell,phones.map(ph=>[ph.x*U,ph.y*U]));const M=new THREE.Matrix4();
    phones.forEach((ph,i)=>{M.makeTranslation(ph.x*U,1.25,ph.y*U);shells.setMatrixAt(i,M);});shells.add(scene,true);}
  const city=SG.meshes(mats.city);for(const m of city){m.castShadow=true;m.receiveShadow=true;scene.add(m);}
  const win=SGw.meshes(mats.glass);for(const m of win)scene.add(m);
  const lit=SGl.meshes(mats.lit);for(const m of lit){m.renderOrder=1;scene.add(m);}

  // árvores e coqueiros (instanciadas)
  const normal=trees.filter(t=>!t.palm), palms=trees.filter(t=>t.palm);
  const trunkG=new THREE.CylinderGeometry(0.1,0.14,1,6);trunkG.translate(0,0.5,0);
  const crownG=new THREE.IcosahedronGeometry(1,0);
  const pt=t=>[t.x*U,t.y*U];
  const trunks=new SInst(trunkG,mats.trunk,[...normal.map(pt),...palms.map(pt)]);
  const crowns=new SInst(crownG,mats.leaf,normal.map(pt));
  const frondG=new THREE.BoxGeometry(1.5,0.05,0.32);frondG.translate(0.75,0,0);
  const fronds=new SInst(frondG,mats.leaf,palms.flatMap(t=>Array(7).fill(pt(t))));
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S3=new THREE.Vector3(),P=new THREE.Vector3(),E=new THREE.Euler();
  let ti=0;
  normal.forEach((t,i)=>{const s=t.r/16;M.compose(P.set(t.x*U,0,t.y*U),Q.identity(),S3.set(1,1.6*s,1));trunks.setMatrixAt(ti++,M);
    M.compose(P.set(t.x*U,1.6*s+0.55*s,t.y*U),Q.setFromEuler(E.set(0,t.x,0)),S3.set(0.85*s,0.75*s,0.85*s));crowns.setMatrixAt(i,M);crowns.setColorAt(i,C(t.c));});
  palms.forEach((t,i)=>{M.compose(P.set(t.x*U,0,t.y*U),Q.setFromEuler(E.set(0.08,t.r,0.05)),S3.set(0.8,3.2,0.8));trunks.setMatrixAt(ti++,M);
    for(let k=0;k<7;k++){M.compose(P.set(t.x*U+0.1,3.15,t.y*U),Q.setFromEuler(E.set(0,t.r+k*Math.PI*2/7,-0.35-(k%2)*0.15,'YXZ')),S3.set(1,1,1));fronds.setMatrixAt(i*7+k,M);fronds.setColorAt(i*7+k,C(k%2?'#3f8f3a':'#2f7a33'));}});
  for(const m of [trunks,crowns,fronds])m.add(scene,true);

  // postes
  const poleG=new THREE.CylinderGeometry(0.05,0.07,2.6,5);poleG.translate(0,1.3,0);
  // poste de concreto da época: fuste cônico, braço curvo pra rua e luminária alongada (vapor de sódio)
  const lampPoleG=(()=>{const parts=[];
    const f=new THREE.CylinderGeometry(0.045,0.085,2.75,8);f.translate(0,1.375,0);parts.push(f);
    const arm=new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,2.6,0),new THREE.Vector3(0,2.95,0),new THREE.Vector3(0.75,2.92,0)),8,0.03,6);parts.push(arm);
    return mergePlain(parts);})();
  const headG=(()=>{const g=new THREE.SphereGeometry(0.2,12,8,0,Math.PI*2,0,Math.PI/2);g.scale(1.9,0.55,1);g.translate(0.92,2.86,0);return g;})();
  const lp=lamps.map(l=>[l.x*U,l.y*U]);
  const poles=new SInst(lampPoleG,mats.concrete||mats.pole,lp), heads=new SInst(headG,mats.lampHead,lp);
  const roadDir=l=>{let best=0,bd=1e9;for(let k=0;k<4;k++){const dx=[1,0,-1,0][k],dy=[0,1,0,-1][k];for(let d=1;d<=3;d++){if(tileAt(l.x+dx*d*T,l.y+dy*d*T)===ROAD){if(d<bd){bd=d;best=k;}break;}}}return -best*Math.PI/2;};
  const lampRot=lamps.map(roadDir);
  lamps.forEach((l,i)=>{Q.setFromEuler(E.set(0,lampRot[i],0));M.compose(P.set(l.x*U,0,l.y*U),Q,S3.set(1,1,1));poles.setMatrixAt(i,M);heads.setMatrixAt(i,M);});
  poles.add(scene);heads.add(scene);
  // poça de luz no chão em volta dos postes (só de noite)
  const poolG=new THREE.PlaneGeometry(1,1);poolG.rotateX(-Math.PI/2);
  const pools=new SInst(poolG,mats.lightPool,lp);
  lamps.forEach((l,i)=>{const r=lampRot[i];M.compose(P.set(l.x*U+Math.cos(r)*0.9,0.03,l.y*U-Math.sin(r)*0.9),Q.identity(),S3.set(8,1,8));pools.setMatrixAt(i,M);});
  pools.add(scene);for(const m of pools.list)m.renderOrder=2;

  // guarda-sóis da praia
  const umb=decor.filter(d=>d.type==='guarda-sol');
  const up=umb.map(d=>[d.x*U,d.y*U]);
  const umbTop=new SInst(new THREE.ConeGeometry(0.75,0.35,8),mats.umbrella,up);
  const umbPole=new SInst(poleG,mats.pole,up);
  umb.forEach((d,i)=>{M.compose(P.set(d.x*U,1.25,d.y*U),Q.identity(),S3.set(1,1,1));umbTop.setMatrixAt(i,M);umbTop.setColorAt(i,C(d.c));
    M.compose(P.set(d.x*U,0,d.y*U),Q.identity(),S3.set(0.6,0.5,0.6));umbPole.setMatrixAt(i,M);});
  umbTop.add(scene,true);umbPole.add(scene);

  // semáforos: poste + caixa, e 3 luzes instanciadas (a cor muda a cada quadro)
  const heads3=[];
  for(let j=0;j<NH;j++)for(let i=0;i<NV;i++){
    if(!isJunction(i,j)||!signalized(i,j))continue;
    const ox=VL[i].px,oy=HL[j].px,hv=VL[i].w*T/2,hh=HL[j].w*T/2;
    heads3.push({x:ox-hv-8,y:oy+hh+8,axis:'h',face:[1,0],i,j});
    heads3.push({x:ox+hv+8,y:oy-hh-8,axis:'h',face:[-1,0],i,j});
    heads3.push({x:ox-hv-8,y:oy-hh-8,axis:'v',face:[0,1],i,j});
    heads3.push({x:ox+hv+8,y:oy+hh+8,axis:'v',face:[0,-1],i,j});
  }
  const hp=heads3.map(h=>[h.x*U,h.y*U]);
  const tlPole=new SInst(poleG,mats.pole,hp);
  const tlBox=new SInst(new THREE.BoxGeometry(0.3,0.9,0.3),mats.dark,hp);
  const bulbG=new THREE.SphereGeometry(0.1,5,3);
  const bulbs=['r','y','g'].map(()=>new SInst(bulbG,mats.bulb,hp));
  heads3.forEach((h,k)=>{const x=h.x*U,z=h.y*U;
    M.compose(P.set(x,0,z),Q.identity(),S3.set(1,1.1,1));tlPole.setMatrixAt(k,M);
    M.compose(P.set(x,3.1,z),Q.identity(),S3.set(1,1,1));tlBox.setMatrixAt(k,M);
    bulbs.forEach((bm,c)=>{M.compose(P.set(x+h.face[0]*0.16,3.38-c*0.28,z+h.face[1]*0.16),Q.identity(),S3.set(1,1,1));bm.setMatrixAt(k,M);bm.setColorAt(k,C('#222'));});});
  for(const m of [tlPole,tlBox,...bulbs])m.add(scene);

  return {city,win,lit,pools,heads,heads3,bulbs,special3d};
}

// ---------- estádio ----------
function buildStadium(b,mats){
  const G=new Geo(), I=b.inner;
  const x0=b.x0*U,z0=b.y0*U,x1=b.x1*U,z1=b.y1*U, ix0=I.x0*U,iz0=I.y0*U,ix1=I.x1*U,iz1=I.y1*U;
  const H=bh(b)*1.4, Hi=H*0.25;
  const wall=C('#cfd8dc'), st=[C('#78909c'),C('#8d9ea7')], inner=C('#546e7a');
  // paredes de fora
  G.quad([x0,0,z0],[x0,H,z0],[x1,H,z0],[x1,0,z0],0,0,-1,wall.clone().multiplyScalar(0.82));
  G.quad([x1,0,z1],[x1,H,z1],[x0,H,z1],[x0,0,z1],0,0,1,wall);
  G.quad([x0,0,z1],[x0,H,z1],[x0,H,z0],[x0,0,z0],-1,0,0,wall.clone().multiplyScalar(0.72));
  G.quad([x1,0,z0],[x1,H,z0],[x1,H,z1],[x1,0,z1],1,0,0,wall.clone().multiplyScalar(0.78));
  // arquibancadas inclinadas (de fora alta pra dentro baixa)
  G.quad([x0,H,z0],[ix0,Hi,iz0],[ix1,Hi,iz0],[x1,H,z0],0,0.8,0.6,st[0]);
  G.quad([x1,H,z1],[ix1,Hi,iz1],[ix0,Hi,iz1],[x0,H,z1],0,0.8,-0.6,st[0]);
  G.quad([x0,H,z1],[ix0,Hi,iz1],[ix0,Hi,iz0],[x0,H,z0],0.6,0.8,0,st[1]);
  G.quad([x1,H,z0],[ix1,Hi,iz0],[ix1,Hi,iz1],[x1,H,z1],-0.6,0.8,0,st[1]);
  // mureta da beira do campo
  G.quad([ix1,0,iz0],[ix1,Hi,iz0],[ix0,Hi,iz0],[ix0,0,iz0],0,0,1,inner);
  G.quad([ix0,0,iz1],[ix0,Hi,iz1],[ix1,Hi,iz1],[ix1,0,iz1],0,0,-1,inner);
  G.quad([ix0,0,iz0],[ix0,Hi,iz0],[ix0,Hi,iz1],[ix0,0,iz1],1,0,0,inner);
  G.quad([ix1,0,iz1],[ix1,Hi,iz1],[ix1,Hi,iz0],[ix1,0,iz0],-1,0,0,inner);
  // refletores
  for(const [px,pz] of [[x0-0.5,z0-0.5],[x1+0.3,z0-0.5],[x0-0.5,z1+0.3],[x1+0.3,z1+0.3]]){G.box(px,pz,px+0.25,pz+0.25,0,H+5,'#9e9e9e','#9e9e9e');}
  const mesh=G.mesh(mats.city);mesh.castShadow=true;mesh.receiveShadow=true;
  // torcida: cubinhos nas arquibancadas
  const seats=[];
  const sides=[[[x0,z0],[x1,z0],[ix0,iz0],[ix1,iz0]],[[x1,z1],[x0,z1],[ix1,iz1],[ix0,iz1]],[[x0,z1],[x0,z0],[ix0,iz1],[ix0,iz0]],[[x1,z0],[x1,z1],[ix1,iz0],[ix1,iz1]]];
  for(const [oa,ob,ia,ib] of sides)for(let r=1;r<7;r++){const t=r/7;
    const ax=ia[0]+(oa[0]-ia[0])*t,az=ia[1]+(oa[1]-ia[1])*t,bx=ib[0]+(ob[0]-ib[0])*t,bz=ib[1]+(ob[1]-ib[1])*t,y=Hi+(H-Hi)*t;
    const n=Math.floor(Math.hypot(bx-ax,bz-az)/0.45);for(let k=0;k<n;k++)seats.push([ax+(bx-ax)*k/n,y+0.15,az+(bz-az)*k/n]);}
  const crowd=new THREE.InstancedMesh(new THREE.BoxGeometry(0.22,0.3,0.22),mats.crowd,seats.length);
  const M=new THREE.Matrix4();seats.forEach((s,i)=>{M.makeTranslation(s[0],s[1],s[2]);crowd.setMatrixAt(i,M);crowd.setColorAt(i,C('#888'));});
  crowd.userData.seats=seats;
  const lightBoxes=new THREE.Group();
  for(const [px,pz] of [[x0-0.5,z0-0.5],[x1+0.3,z0-0.5],[x0-0.5,z1+0.3],[x1+0.3,z1+0.3]]){const m=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.6,0.4),mats.lampHead);m.position.set(px+0.1,H+5.2,pz+0.1);lightBoxes.add(m);}
  // brilho dos refletores no gramado (um plano aditivo: bem mais leve que uma luz de verdade)
  const fg=new THREE.PlaneGeometry(ix1-ix0+4,iz1-iz0+4);fg.rotateX(-Math.PI/2);
  const fieldLight=new THREE.Mesh(fg,mats.fieldGlow);fieldLight.position.set((ix0+ix1)/2,0.05,(iz0+iz1)/2);fieldLight.renderOrder=2;
  return {mesh,crowd,lightBoxes,fieldLight,b};
}
