// Carros com cara dos anos 90: carroceria arredondada feita do perfil lateral (extrudado com chanfro),
// cabine com vidros, rodas com calota, para-choque, faróis e lanternas. Nomes e formas são próprios do jogo,
// só lembram os modelos da época (hatch quadrado, sedã de três volumes, perua, picape, bugue, busão).
// Unidade: 1 = 1 tile. X = comprimento (frente em +X), Y = altura, Z = largura.
import * as THREE from '../../vendor/three/three.module.min.js';

// ---------- utilidades de geometria ----------
// junta geometrias (cada uma com uma cor) numa só, com cor por vértice
export function mergeColored(list){
  const pos=[],nor=[],col=[],c=new THREE.Color();
  for(const [geo,hex] of list){
    const g=geo.index?geo.toNonIndexed():geo;if(!g.attributes.normal)g.computeVertexNormals();
    const P=g.attributes.position,N=g.attributes.normal;c.set(hex);
    for(let i=0;i<P.count;i++){pos.push(P.getX(i),P.getY(i),P.getZ(i));nor.push(N.getX(i),N.getY(i),N.getZ(i));col.push(c.r,c.g,c.b);}
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));out.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  out.computeBoundingSphere();return out;
}
export function mergePlain(list){const g=mergeColored(list.map(x=>[x,'#ffffff']));g.deleteAttribute('color');return g;}
// polígono com cantos arredondados (raio por canto)
function roundedShape(pts,r){
  const s=new THREE.Shape(),n=pts.length;
  const at=(i)=>pts[(i+n)%n];
  for(let i=0;i<n;i++){
    const p=at(i),a=at(i-1),b=at(i+1),rr=Array.isArray(r)?r[i]:r;
    const da=Math.hypot(a[0]-p[0],a[1]-p[1]),db=Math.hypot(b[0]-p[0],b[1]-p[1]),k=Math.min(rr,da*0.45,db*0.45);
    const p1=[p[0]+(a[0]-p[0])/da*k,p[1]+(a[1]-p[1])/da*k],p2=[p[0]+(b[0]-p[0])/db*k,p[1]+(b[1]-p[1])/db*k];
    if(i===0)s.moveTo(p1[0],p1[1]);else s.lineTo(p1[0],p1[1]);
    s.quadraticCurveTo(p[0],p[1],p2[0],p2[1]);
  }
  s.closePath();return s;
}
// perfil lateral -> sólido com laterais chanfradas (fica "polido", sem quina viva)
function extrude(pts,width,r,bevel){
  const bt=bevel===undefined?0.035:bevel;
  const g=new THREE.ExtrudeGeometry(roundedShape(pts,r),{depth:Math.max(0.01,width-2*bt),bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt*0.8,bevelSegments:2,curveSegments:3});
  g.translate(0,0,-(width-2*bt)/2);return g;
}
const box=(sx,sy,sz,x,y,z)=>{const g=new THREE.BoxGeometry(sx,sy,sz);g.translate(x,y,z);return g;};
const cyl=(r,h,x,y,z,axis,seg)=>{const g=new THREE.CylinderGeometry(r,r,h,seg||12);if(axis==='z')g.rotateX(Math.PI/2);else if(axis==='x')g.rotateZ(Math.PI/2);g.translate(x,y,z);return g;};
function quad(a,b,c,d){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));g.computeVertexNormals();return g;}
function quad2(a,b,c,d){return [quad(a,b,c,d),quad(d,c,b,a)];} // dos dois lados
// polígono plano (vidro lateral) no plano z
function sidePoly(pts,z){const s=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],p[1])));const g=new THREE.ShapeGeometry(s);g.translate(0,0,z);if(z<0){g.scale(1,1,1);const idx=g.index.array;for(let i=0;i<idx.length;i+=3){const t=idx[i];idx[i]=idx[i+2];idx[i+2]=t;}g.computeVertexNormals();}return g;}
function inset(poly,m){const cx=poly.reduce((s,p)=>s+p[0],0)/poly.length,cy=poly.reduce((s,p)=>s+p[1],0)/poly.length;return poly.map(p=>{const dx=p[0]-cx,dy=p[1]-cy,d=Math.hypot(dx,dy)||1;return [p[0]-dx/d*m,p[1]-dy/d*m];});}

// ---------- cores comuns ----------
const GLASS='#24323d',GLASS2='#3b5262',TIRE='#141414',HUB='#b9bcc0',CHROME='#d7d9db',PLASTIC='#26272b',GRILLE='#18191c',INNER='#2a2420';

// ---------- receitas ----------
// x em fração do comprimento (-0.5 traseira .. 0.5 frente); alturas em unidades
const SPEC={
  hatch: {g:0.11,hb:0.25,nose:[0.17,0.10],tail:[0.23,0.02],cab:[-0.46,-0.41,0.07,0.22],hc:0.21,cw:0.86,wr:0.13,wb:0.33,bump:PLASTIC,head:'sq'},
  coupe: {g:0.09,hb:0.2,nose:[0.10,0.22],tail:[0.18,0.06],cab:[-0.33,-0.17,0.05,0.22],hc:0.165,cw:0.84,wr:0.13,wb:0.33,bump:PLASTIC,head:'thin',spoiler:true},
  sedan: {g:0.11,hb:0.25,nose:[0.17,0.08],tail:[0.2,0.05],cab:[-0.27,-0.18,0.12,0.25],hc:0.2,cw:0.86,wr:0.13,wb:0.34,bump:PLASTIC,head:'sq'},
  luxo:  {g:0.11,hb:0.26,nose:[0.2,0.04],tail:[0.22,0.04],cab:[-0.24,-0.16,0.10,0.21],hc:0.19,cw:0.86,wr:0.13,wb:0.35,bump:CHROME,head:'twin'},
  wagon: {g:0.15,hb:0.3,nose:[0.22,0.07],tail:[0.3,0.0],cab:[-0.48,-0.47,0.11,0.24],hc:0.26,cw:0.88,wr:0.16,wb:0.33,bump:CHROME,head:'round'},
  pickup:{g:0.14,hb:0.27,nose:[0.2,0.07],tail:[0.27,0.0],cab:[-0.03,-0.01,0.15,0.27],hc:0.23,cw:0.88,wr:0.15,wb:0.33,bump:PLASTIC,head:'sq',bed:true},
  buggy: {g:0.1,hb:0.17,nose:[0.07,0.26],tail:[0.2,0.05],cab:null,cw:0.8,wr:0.16,wb:0.32,bump:null,head:'round',rollbar:true},
  jeep:  {g:0.16,hb:0.28,nose:[0.26,0.02],tail:[0.28,0.0],cab:null,cw:0.9,wr:0.17,wb:0.32,bump:'#2b2e18',head:'round',canvas:true},
};
const TYPE_SPEC={jegue:'hatch',brisa:'coupe',taxi:'sedan',viatura:'sedan',luxo:'luxo',fbi:'luxo',suv:'wagon',swat:'wagon',camin:'pickup',bugue:'buggy',exercito:'jeep'};

// devolve {body (geometria pintada com a cor do carro), detail (cor por vértice), brake, head, siren:[vermelho,azul]|null, L}
export function buildCarParts(type,lenPx,widPx,U){
  const L=lenPx*U,W=widPx*U;
  if(type==='busao')return bus(L,W);
  if(type==='caminhao'||type==='guincho')return truck(L,W,type);
  if(type==='blindado')return apc(L,W);
  if(type==='moto')return moto(L,W);
  const s=SPEC[TYPE_SPEC[type]||'hatch'];
  const x=f=>f*L, y0=s.g, y1=s.g+s.hb;
  // carroceria: perfil lateral (traseira -> frente)
  const prof=[[x(-0.5),y0],[x(0.5),y0],[x(0.5),y0+s.nose[0]],[x(0.5)-x(s.nose[1])-0.0001,y1],[x(-0.5)+x(s.tail[1])+0.0001,y1],[x(-0.5),y0+s.tail[0]]];
  const parts=[extrude(prof,W,[0.05,0.05,0.06,0.09,0.09,0.06])];
  const D=[],H=[],B=[];
  let roofY=y1;
  if(s.cab){
    const [r0,r1,f1,f0]=s.cab.map(x),cw=W*s.cw;roofY=y1+s.hc;
    const cab=[[r0,y1-0.01],[f0,y1-0.01],[f1,roofY],[r1,roofY]];
    parts.push(extrude(cab,cw,[0.02,0.02,0.05,0.05],0.03));
    // vidros laterais (com coluna do meio) e para-brisas
    const z=cw/2+0.006, top=roofY-0.035, bot=y1+0.03;
    const lerpX=(a,b,t)=>a+(b-a)*t;
    const sideR=[[lerpX(r0,r1,(bot-y1)/s.hc)+0.03,bot],[lerpX(f0,f1,(bot-y1)/s.hc)-0.03,bot],[lerpX(f0,f1,(top-y1)/s.hc)-0.03,top],[lerpX(r0,r1,(top-y1)/s.hc)+0.03,top]];
    for(const zz of [z,-z])D.push([sidePoly(sideR,zz),GLASS]);
    const mid=(sideR[0][0]+sideR[1][0])/2;
    for(const zz of [z+0.002,-z-0.002])D.push([box(0.035,top-bot+0.01,0.004,mid,(top+bot)/2,zz),'#1a1a1a']);
    const wz=cw/2-0.03,ws=0.012,nf=[(f1-f0),(roofY-y1)],nl=Math.hypot(nf[0],nf[1]),ox=nf[1]/nl*ws,oy=-nf[0]/nl*ws;
    D.push(...quad2([f0+ox,y1+0.025+oy,-wz],[f0+ox,y1+0.025+oy,wz],[f1+ox,roofY-0.025+oy,wz],[f1+ox,roofY-0.025+oy,-wz]).map(q=>[q,GLASS2]));
    const nr=[(r1-r0),(roofY-y1)],rl=Math.hypot(nr[0],nr[1]),rx=-nr[1]/rl*ws,ry=nr[0]/rl*ws;
    D.push(...quad2([r0+rx,y1+0.03+ry,wz],[r0+rx,y1+0.03+ry,-wz],[r1+rx,roofY-0.03+ry,-wz],[r1+rx,roofY-0.03+ry,wz]).map(q=>[q,GLASS]));
  }
  // rodas com calota
  const wt=0.1;
  for(const sx of [-1,1])for(const sz of [-1,1]){const wx=sx*L*s.wb,wz=sz*(W/2-wt/2+0.015);
    D.push([cyl(s.wr,wt,wx,s.wr,wz,'z',14),TIRE]);D.push([cyl(s.wr*0.55,wt+0.012,wx,s.wr,wz,'z',10),HUB]);}
  // para-choques, grade, faróis e lanternas
  if(s.bump){D.push([box(0.05,0.07,W*0.98,L/2+0.01,y0+0.05,0),s.bump]);D.push([box(0.05,0.07,W*0.98,-L/2-0.01,y0+0.05,0),s.bump]);}
  const fy=y0+s.nose[0]*0.62, fx=L/2+0.004;
  D.push([box(0.02,s.nose[0]*0.32,W*0.36,fx,fy,0),GRILLE]);
  for(const sz of [-1,1]){const lz=sz*W*0.32;
    if(s.head==='round'){H.push(cyl(0.055,0.03,fx,fy,lz,'x',12));}
    else if(s.head==='twin'){H.push(cyl(0.04,0.03,fx,fy,lz,'x',10));H.push(cyl(0.04,0.03,fx,fy,lz-sz*0.09,'x',10));}
    else if(s.head==='thin'){H.push(box(0.03,0.05,0.16,fx,fy,lz));}
    else H.push(box(0.03,0.08,0.15,fx,fy,lz));
    B.push(box(0.03,0.075,0.13,-L/2-0.004,y0+s.tail[0]*0.7,lz));}
  // extras por tipo
  if(s.spoiler)D.push([box(0.06,0.03,W*0.8,-L/2+0.06,y1+0.05,0),PLASTIC],[box(0.03,0.05,0.03,-L/2+0.06,y1+0.025,W*0.3),PLASTIC],[box(0.03,0.05,0.03,-L/2+0.06,y1+0.025,-W*0.3),PLASTIC]);
  if(s.bed){const bx0=-L/2+0.04,bx1=x(-0.04),bl=bx1-bx0;D.push([box(bl,0.02,W*0.86,(bx0+bx1)/2,y1-0.02,0),INNER]);}
  if(s.rollbar){D.push([box(0.05,0.32,0.05,x(-0.12),y1+0.16,W*0.36),'#cfcfcf'],[box(0.05,0.32,0.05,x(-0.12),y1+0.16,-W*0.36),'#cfcfcf'],[box(0.05,0.05,W*0.77,x(-0.12),y1+0.32,0),'#cfcfcf'],
    [box(0.16,0.14,0.16,x(-0.02),y1+0.04,W*0.18),INNER],[box(0.16,0.14,0.16,x(-0.02),y1+0.04,-W*0.18),INNER],[box(0.02,0.14,W*0.7,x(0.16),y1+0.06,0),GLASS2]);}
  if(s.canvas){D.push([box(L*0.5,0.24,W*0.92,x(-0.2),y1+0.12,0),'#3f4720'],[box(0.03,0.2,W*0.8,x(0.08),y1+0.1,0),GLASS2],[box(0.04,0.06,W*0.9,x(0.08),y1+0.2,0),'#3f4720'],
    [cyl(0.13,0.08,-L/2-0.04,y1-0.1,0,'x',12),TIRE]);}
  // pintura de época: táxi (faixa e luminoso), viatura (portas escuras, faixa e giroflex), FBI (antena)
  let siren=null;
  if(type==='taxi'){D.push([box(L*0.92,0.035,W+0.012,0,y0+s.hb*0.55,0),'#c62828'],[box(0.24,0.08,0.14,x(-0.03),roofY+0.045,0),'#f5f5f0'],[box(0.25,0.03,0.15,x(-0.03),roofY+0.09,0),'#c62828']);}
  if(type==='viatura'){
    D.push([box(L*0.42,s.hb*0.62,W+0.014,x(-0.05),y0+s.hb*0.48,0),'#1d2a4d'],[box(L*0.96,0.03,W+0.02,0,y0+s.hb*0.86,0),'#f2f2ee'],[box(0.12,0.03,0.1,x(-0.05),roofY+0.015,0),'#222']);
    siren=[mergePlain([cyl(0.055,0.075,x(-0.05),roofY+0.065,-0.07,'y',10)]),mergePlain([cyl(0.055,0.075,x(-0.05),roofY+0.065,0.07,'y',10)])];}
  if(type==='swat'){D.push([box(L*0.96,0.05,W+0.014,0,y0+s.hb*0.5,0),'#c9a227'],[box(L*0.55,0.04,W*0.8,x(-0.15),roofY+0.03,0),'#222']);
    siren=[mergePlain([cyl(0.05,0.07,x(0.02),roofY+0.08,-0.08,'y',10)]),mergePlain([cyl(0.05,0.07,x(0.02),roofY+0.08,0.08,'y',10)])];}
  if(type==='fbi'){D.push([box(0.01,0.18,0.01,x(-0.35),y1+0.09,W*0.3),'#111']);
    siren=[mergePlain([box(0.05,0.035,0.08,fx-0.01,fy+0.06,-0.08)]),mergePlain([box(0.05,0.035,0.08,fx-0.01,fy+0.06,0.08)])];}
  if(type==='exercito')D.push([box(0.02,0.1,W*0.3,L/2+0.01,y1-0.06,0),'#2b2e18']);
  return {body:mergePlain(parts),detail:mergeColored(D),brake:mergePlain(B),head:mergePlain(H),siren,L,top:roofY};
}
// busão de cidade dos anos 90: caixa com cantos bem arredondados, faixa de janelas, para-brisa grande
function bus(L,W){
  const g=0.14,h=1.12,y1=g+h;
  const body=extrude([[-L/2,g],[L/2,g],[L/2,y1-0.12],[L/2-0.08,y1],[-L/2,y1]],W,[0.06,0.08,0.1,0.2,0.08],0.06);
  const D=[],H=[],B=[];
  const z=W/2+0.004;
  for(let k=0;k<7;k++){const cx=-L/2+0.35+k*(L-0.8)/7,w=(L-0.8)/7-0.06;for(const zz of [z,-z])D.push([sidePoly([[cx,g+0.55],[cx+w,g+0.55],[cx+w,y1-0.12],[cx,y1-0.12]],zz),GLASS]);}
  D.push(...quad2([L/2+0.012,g+0.45,-W*0.44],[L/2+0.012,g+0.45,W*0.44],[L/2-0.03,y1-0.08,W*0.44],[L/2-0.03,y1-0.08,-W*0.44]).map(q=>[q,GLASS2]));
  D.push([box(0.04,0.18,W*0.6,L/2+0.02,y1-0.02,0),'#111'],[box(L*0.98,0.07,W+0.012,0,g+0.42,0),'#f2f2ee']);
  D.push([box(0.06,0.1,W*0.98,L/2+0.02,g+0.06,0),PLASTIC],[box(0.06,0.1,W*0.98,-L/2-0.02,g+0.06,0),PLASTIC]);
  for(const sx of [-1,1])for(const sz of [-1,1]){const wx=sx*L*0.32,wz=sz*(W/2-0.05);D.push([cyl(0.17,0.11,wx,0.17,wz,'z',14),TIRE],[cyl(0.1,0.12,wx,0.17,wz,'z',10),HUB]);}
  for(const sz of [-1,1]){H.push(cyl(0.05,0.03,L/2+0.02,g+0.22,sz*W*0.36,'x',10));B.push(box(0.03,0.12,0.12,-L/2-0.02,g+0.3,sz*W*0.38));}
  return {body:mergePlain([body]),detail:mergeColored(D),brake:mergePlain(B),head:mergePlain(H),siren:null,L,top:y1};
}
// caminhão baú e guincho: cabine arredondada na frente
function truck(L,W,type){
  const g=0.16,cl=Math.min(0.75,L*0.3),ch=0.62,x0=L/2-cl;
  const cab=extrude([[x0,g],[L/2,g],[L/2,g+ch*0.55],[L/2-0.14,g+ch],[x0,g+ch]],W*0.96,[0.04,0.05,0.08,0.12,0.05],0.04);
  const D=[],H=[],B=[];
  D.push(...quad2([L/2-0.01,g+ch*0.58,-W*0.4],[L/2-0.01,g+ch*0.58,W*0.4],[L/2-0.13,g+ch-0.03,W*0.4],[L/2-0.13,g+ch-0.03,-W*0.4]).map(q=>[q,GLASS2]));
  for(const zz of [W*0.48+0.004,-W*0.48-0.004])D.push([sidePoly([[x0+0.06,g+ch*0.55],[L/2-0.2,g+ch*0.55],[L/2-0.24,g+ch-0.05],[x0+0.06,g+ch-0.05]],zz),GLASS]);
  D.push([box(0.05,0.09,W*0.98,L/2+0.02,g+0.05,0),PLASTIC]);
  if(type==='caminhao'){D.push([box(L-cl-0.06,0.95,W,-L/2+(L-cl-0.06)/2,g+0.5,0),'#ececec'],[box(L-cl-0.08,0.06,W+0.01,-L/2+(L-cl-0.06)/2,g+0.08,0),'#555']);}
  else{const bl=L-cl-0.04;D.push([box(bl,0.07,W*0.92,-L/2+bl/2,g+0.12,0),'#555'],[box(0.5,0.08,0.08,-L/2+0.12,g+0.35,0),'#333']);
    D.push([box(0.06,0.06,W*0.5,x0+0.1,g+ch+0.04,0),'#ffb300']);}
  D.push([box(L-0.05,0.08,W*0.5,0,g-0.02,0),'#222']);
  for(const sx of [-0.34,0.34])for(const sz of [-1,1]){const wx=sx*L,wz=sz*(W/2-0.05);D.push([cyl(0.16,0.11,wx,0.16,wz,'z',14),TIRE],[cyl(0.09,0.12,wx,0.16,wz,'z',10),HUB]);}
  for(const sz of [-1,1]){H.push(box(0.03,0.08,0.13,L/2+0.01,g+0.2,sz*W*0.34));B.push(box(0.03,0.08,0.1,-L/2-0.01,g+0.22,sz*W*0.4));}
  return {body:mergePlain([cab]),detail:mergeColored(D),brake:mergePlain(B),head:mergePlain(H),siren:null,L,top:g+ch};
}
function apc(L,W){
  const g=0.16,h=0.62;
  const body=extrude([[-L/2,g+0.1],[-L/2+0.15,g],[L/2-0.2,g],[L/2,g+0.2],[L/2-0.3,g+h],[-L/2+0.1,g+h]],W,0.06,0.05);
  const D=[],H=[],B=[];
  D.push([cyl(0.22,0.18,-0.05,g+h+0.09,0,'y',12),'#2e3313'],[box(0.6,0.07,0.07,0.3,g+h+0.12,0),'#23270e'],[box(0.04,0.1,W*0.4,L/2-0.18,g+h-0.12,0),GLASS2]);
  for(const sx of [-0.36,-0.12,0.12,0.36])for(const sz of [-1,1])D.push([cyl(0.17,0.12,sx*L,0.17,sz*(W/2-0.04),'z',12),TIRE],[cyl(0.09,0.13,sx*L,0.17,sz*(W/2-0.04),'z',8),'#3d4419']);
  for(const sz of [-1,1]){H.push(box(0.03,0.06,0.1,L/2-0.02,g+0.25,sz*W*0.3));B.push(box(0.03,0.06,0.08,-L/2+0.02,g+0.2,sz*W*0.35));}
  return {body:mergePlain([body]),detail:mergeColored(D),brake:mergePlain(B),head:mergePlain(H),siren:null,L,top:g+h};
}
function moto(L,W){
  const D=[],H=[],B=[];
  const tank=extrude([[-L*0.15,0.36],[L*0.22,0.36],[L*0.18,0.5],[-L*0.1,0.48]],0.16,0.03,0.03);
  D.push([cyl(0.12,0.06,-L*0.33,0.12,0,'z',12),TIRE],[cyl(0.12,0.06,L*0.33,0.12,0,'z',12),TIRE],[box(L*0.66,0.05,0.06,0,0.26,0),'#333'],
    [box(0.04,0.04,0.42,L*0.3,0.62,0),'#bbb'],[box(L*0.3,0.08,0.18,-L*0.18,0.46,0),'#151515'],[box(0.04,0.3,0.04,L*0.31,0.42,0),'#888']);
  H.push(cyl(0.035,0.03,L*0.36,0.52,0,'x',10));B.push(box(0.02,0.04,0.08,-L*0.36,0.42,0));
  return {body:mergePlain([tank]),detail:mergeColored(D),brake:mergePlain(B),head:mergePlain(H),siren:null,L,top:0.6};
}
