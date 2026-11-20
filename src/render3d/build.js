// Constrói a cidade estática em 3D (uma vez): prédios com janelas e telhados, árvores, postes,
// semáforos, enfeites, estádio. Unidade: 1 = 1 tile (32 px). X = x do mundo, Z = y do mundo, Y = altura.
import * as THREE from '../../vendor/three/three.module.min.js';
import { mulberry } from '../core/utils.js';
import { T, buildings, trees, lamps, decor, pumps, phones, special, VL, HL, NV, NH, isJunction } from '../world/map.js';
import { signalized } from '../world/districts.js';
import { BUS_STOPS } from '../game/jobs.js';
import { roofSign } from '../render/draw.js';

export const U=1/T;                         // px -> unidade
export const HSCALE=2.2/T;                  // altura "2D" -> unidade
export const bh=b=>Math.max(0.35,b.h*HSCALE);

// ---------- montador de geometria com cor por vértice ----------
class Geo{
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

// janelas: vidro em todas e luz acesa em parte delas (aparece só de noite)
function windows(Gw,Gl,b,x0,z0,x1,z1,H){
  if(['conteiner','barraca','salva-vidas'].includes(b.style))return;
  const floorH=b.style==='galpao'?2.2:0.95, rows=Math.max(1,Math.floor((H-0.3)/floorH));
  const r=mulberry(Math.floor(b.seed*1e9)+7);
  const glass=C(b.style==='torre'||b.style==='hotel'?'#5b7c99':'#3e4f5e');
  const lit=C('#ffd98a');
  const faces=[[x0,z0,x1,z0,0,-1],[x1,z1,x0,z1,0,1],[x0,z1,x0,z0,-1,0],[x1,z0,x1,z1,1,0]];
  for(const [ax,az,bx,bz,nx,nz] of faces){
    const len=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.floor(len/1.1)), off=0.02;
    for(let row=0;row<rows;row++){
      const y0=0.35+row*floorH, y1=y0+floorH*0.5; if(y1>H-0.15)break;
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
  const G=new Geo(), Gw=new Geo(), Gl=new Geo();
  const special3d=[];
  for(const b of buildings){
    if(b.kind==='estadio'){special3d.push(buildStadium(b,mats));continue;}
    const x0=b.x0*U,z0=b.y0*U,x1=b.x1*U,z1=b.y1*U,H=bh(b);
    if(b.kind==='canopy'){ // cobertura do posto: pilares + laje fina
      for(const [px,pz] of [[x0+0.3,z0+0.3],[x1-0.5,z0+0.3],[x0+0.3,z1-0.5],[x1-0.5,z1-0.5]])G.box(px,pz,px+0.2,pz+0.2,0,H,'#9e9e9e','#9e9e9e');
      G.box(x0,z0,x1,z1,H,H+0.25,'#f2f2ee','#c9342a',false);continue;}
    const pitched=['casa','casario','casinha','mansao'].includes(b.style)&&b.kind==='b';
    const isPOI=b.kind!=='b';
    G.box(x0,z0,x1,z1,0,H,(isPOI||pitched)?null:(b.roof||b.wall),b.wall);
    windows(Gw,Gl,b,x0,z0,x1,z1,H);
    if(pitched)gable(G,x0,z0,x1,z1,H,Math.min(1.2,Math.min(x1-x0,z1-z0)*0.35),b.roof);
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
  for(const p of pumps){const x=p.x*U,z=p.y*U;G.box(x-0.2,z-0.3,x+0.2,z+0.3,0,0.9,'#c9342a','#c9342a');}
  for(const s of BUS_STOPS){const x=(s.x+s.side.x*s.off)*U,z=(s.y+s.side.y*s.off)*U;const horiz=s.side.x===0;
    const w=horiz?1.4:0.4,d=horiz?0.4:1.4;G.box(x-w,z-d,x+w,z+d,1.5,1.62,'#1565c0','#1565c0');
    for(const [px,pz] of [[x-w,z-d],[x+w-0.1,z+d-0.1]])G.box(px,pz,px+0.1,pz+0.1,0,1.5,'#cfd8dc','#cfd8dc');}
  for(const ph of phones){const x=ph.x*U,z=ph.y*U;G.box(x-0.05,z-0.05,x+0.05,z+0.05,0,1.3,'#555','#555');G.box(x-0.35,z-0.35,x+0.35,z+0.35,1.3,1.75,'#f2a900','#f2a900');}
  // guindastes do porto
  for(const d of decor)if(d.type==='guindaste'){const x=d.x*U,z=d.y*U;G.box(x-1.2,z-0.8,x+1.2,z+0.8,0,6,'#f9a825','#f9a825');G.box(x-0.3,z-0.3,x+0.3,z+5,6,6.6,'#f9a825','#f9a825');}

  const city=G.mesh(mats.city);city.castShadow=true;city.receiveShadow=true;scene.add(city);
  const win=Gw.mesh(mats.glass);scene.add(win);
  const lit=Gl.mesh(mats.lit);lit.renderOrder=1;scene.add(lit);

  // árvores e coqueiros (instanciadas)
  const normal=trees.filter(t=>!t.palm), palms=trees.filter(t=>t.palm);
  const trunkG=new THREE.CylinderGeometry(0.1,0.14,1,6);trunkG.translate(0,0.5,0);
  const crownG=new THREE.IcosahedronGeometry(1,0);
  const trunks=new THREE.InstancedMesh(trunkG,mats.trunk,trees.length);
  const crowns=new THREE.InstancedMesh(crownG,mats.leaf,normal.length);
  const frondG=new THREE.BoxGeometry(1.5,0.05,0.32);frondG.translate(0.75,0,0);
  const fronds=new THREE.InstancedMesh(frondG,mats.leaf,palms.length*7);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S3=new THREE.Vector3(),P=new THREE.Vector3(),E=new THREE.Euler();
  let ti=0;
  normal.forEach((t,i)=>{const s=t.r/16;M.compose(P.set(t.x*U,0,t.y*U),Q.identity(),S3.set(1,1.6*s,1));trunks.setMatrixAt(ti++,M);
    M.compose(P.set(t.x*U,1.6*s+0.55*s,t.y*U),Q.setFromEuler(E.set(0,t.x,0)),S3.set(0.85*s,0.75*s,0.85*s));crowns.setMatrixAt(i,M);crowns.setColorAt(i,C(t.c));});
  palms.forEach((t,i)=>{M.compose(P.set(t.x*U,0,t.y*U),Q.setFromEuler(E.set(0.08,t.r,0.05)),S3.set(0.8,3.2,0.8));trunks.setMatrixAt(ti++,M);
    for(let k=0;k<7;k++){M.compose(P.set(t.x*U+0.1,3.15,t.y*U),Q.setFromEuler(E.set(0,t.r+k*Math.PI*2/7,-0.35-(k%2)*0.15,'YXZ')),S3.set(1,1,1));fronds.setMatrixAt(i*7+k,M);fronds.setColorAt(i*7+k,C(k%2?'#3f8f3a':'#2f7a33'));}});
  for(const m of [trunks,crowns,fronds]){m.castShadow=true;m.receiveShadow=false;scene.add(m);}

  // postes
  const poleG=new THREE.CylinderGeometry(0.05,0.07,2.6,5);poleG.translate(0,1.3,0);
  const headG=new THREE.BoxGeometry(0.5,0.12,0.25);
  const poles=new THREE.InstancedMesh(poleG,mats.pole,lamps.length), heads=new THREE.InstancedMesh(headG,mats.lampHead,lamps.length);
  lamps.forEach((l,i)=>{M.compose(P.set(l.x*U,0,l.y*U),Q.identity(),S3.set(1,1,1));poles.setMatrixAt(i,M);M.compose(P.set(l.x*U,2.6,l.y*U),Q.identity(),S3.set(1,1,1));heads.setMatrixAt(i,M);});
  scene.add(poles);scene.add(heads);
  // poça de luz no chão em volta dos postes (só de noite)
  const poolG=new THREE.PlaneGeometry(1,1);poolG.rotateX(-Math.PI/2);
  const pools=new THREE.InstancedMesh(poolG,mats.lightPool,lamps.length);
  lamps.forEach((l,i)=>{M.compose(P.set(l.x*U,0.03,l.y*U),Q.identity(),S3.set(8,1,8));pools.setMatrixAt(i,M);});
  pools.renderOrder=2;scene.add(pools);

  // guarda-sóis da praia
  const umb=decor.filter(d=>d.type==='guarda-sol');
  const umbTop=new THREE.InstancedMesh(new THREE.ConeGeometry(0.75,0.35,8),mats.umbrella,umb.length);
  const umbPole=new THREE.InstancedMesh(poleG,mats.pole,umb.length);
  umb.forEach((d,i)=>{M.compose(P.set(d.x*U,1.25,d.y*U),Q.identity(),S3.set(1,1,1));umbTop.setMatrixAt(i,M);umbTop.setColorAt(i,C(d.c));
    M.compose(P.set(d.x*U,0,d.y*U),Q.identity(),S3.set(0.6,0.5,0.6));umbPole.setMatrixAt(i,M);});
  for(const m of [umbTop,umbPole]){m.castShadow=true;scene.add(m);}

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
  const tlPole=new THREE.InstancedMesh(poleG,mats.pole,heads3.length);
  const tlBox=new THREE.InstancedMesh(new THREE.BoxGeometry(0.3,0.9,0.3),mats.dark,heads3.length);
  const bulbG=new THREE.SphereGeometry(0.1,6,4);
  const bulbs=['r','y','g'].map(()=>new THREE.InstancedMesh(bulbG,mats.bulb,heads3.length));
  heads3.forEach((h,k)=>{const x=h.x*U,z=h.y*U;
    M.compose(P.set(x,0,z),Q.identity(),S3.set(1,1.1,1));tlPole.setMatrixAt(k,M);
    M.compose(P.set(x,3.1,z),Q.identity(),S3.set(1,1,1));tlBox.setMatrixAt(k,M);
    bulbs.forEach((bm,c)=>{M.compose(P.set(x+h.face[0]*0.16,3.38-c*0.28,z+h.face[1]*0.16),Q.identity(),S3.set(1,1,1));bm.setMatrixAt(k,M);bm.setColorAt(k,C('#222'));});});
  for(const m of [tlPole,tlBox,...bulbs])scene.add(m);

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
  const fieldLight=new THREE.PointLight('#fff8e0',0,60,1.4);fieldLight.position.set((ix0+ix1)/2,H+8,(iz0+iz1)/2);
  return {mesh,crowd,lightBoxes,fieldLight,b};
}
