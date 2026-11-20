// Interiores em 3D: a mesma planta em texto de game/interior.js vira uma sala 3D.
// Câmera fixa enquadrando o cômodo inteiro, olhando da porta; a parede da frente é cortada baixinha pra dar pra ver dentro.
import * as THREE from '../../vendor/three/three.module.min.js';
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { clamp } from '../core/utils.js';
import { ITS, THEME, NPC_SHIRT, nearestPoint, interiorTitle } from '../game/interior.js';
import { drawKeycap } from '../render/hud.js';
import { S, player } from '../core/state.js';
import { Geo } from './build.js';
import { getRenderer } from './r3d.js';

let scene=null, camera=null, built=null, rings=[], people=[];
const WALL={farmacia:'#e7efe9',mercadinho:'#efe2c8',padaria:'#f0dcc0',lojaposto:'#e6e6e6',lanchonete:'#f6e7b5',hospital:'#eef4f7',policia:'#cfd9e6',armas:'#6d5646',escola:'#e9dcc0',casa:'#e8d2b4'};
const C=h=>new THREE.Color(h);
function hash(x,y){const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);}

// pessoa simples (poucas por sala)
const legG=new THREE.BoxGeometry(0.1,0.36,0.1);legG.translate(0,-0.18,0);
const bodyG=new THREE.CylinderGeometry(0.17,0.15,0.5,8), headG=new THREE.SphereGeometry(0.13,10,8);
const mc={};const lam=c=>mc[c]||(mc[c]=new THREE.MeshLambertMaterial({color:c}));
function person(shirt,skin,hair,scale){
  const g=new THREE.Group();
  const l1=new THREE.Mesh(legG,lam('#2b2f45'));l1.position.set(0,0.36,-0.08);const l2=new THREE.Mesh(legG,lam('#2b2f45'));l2.position.set(0,0.36,0.08);
  const b=new THREE.Mesh(bodyG,lam(shirt));b.position.y=0.6;const h=new THREE.Mesh(headG,lam(skin));h.position.y=0.98;
  const hr=new THREE.Mesh(headG,lam(hair));hr.scale.set(1.05,0.6,1.05);hr.position.set(-0.02,1.04,0);
  for(const m of [l1,l2,b,h,hr]){m.castShadow=true;g.add(m);}
  g.userData={l1,l2};g.scale.setScalar(scale);scene.add(g);return g;
}
function pose(g,px,py,a,anim,moving,sit){
  g.position.set(px/ITS,sit?-0.18:0,py/ITS);g.rotation.y=-a;
  const s=moving?Math.sin(anim*10)*0.6:0;g.userData.l1.rotation.z=s;g.userData.l2.rotation.z=-s;
}

function build(it){
  if(scene){scene.traverse(o=>{if(o.geometry&&o.geometry!==legG&&o.geometry!==bodyG&&o.geometry!==headG)o.geometry.dispose();});}
  scene=new THREE.Scene();scene.background=new THREE.Color('#0d0d12');
  scene.add(new THREE.HemisphereLight('#ffffff','#8a7a68',1.15));
  const sun=new THREE.DirectionalLight('#fff6e6',1.6);sun.position.set(it.W*0.35,9,it.H*0.9);sun.target.position.set(it.W/2,0,it.H/2);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);const sc=sun.shadow.camera;const r=Math.max(it.W,it.H)*0.75;sc.left=-r;sc.right=r;sc.top=r;sc.bottom=-r;sc.near=1;sc.far=40;sun.shadow.bias=-0.0008;sun.shadow.normalBias=0.02;
  scene.add(sun);scene.add(sun.target);
  const th=THEME[it.kind]||THEME.mercadinho, wallCol=WALL[it.kind]||'#e8e2d6';
  const G=new Geo(), F=new Geo();
  const box=(x0,y0,z0,x1,y1,z1,col,top)=>G.box(x0,z0,x1,z1,y0,y1,top||col,col);
  const W=it.W,H=it.H,P=it.plan;
  const isWall=(x,y)=>x<0||y<0||x>=W||y>=H||P[y][x]==='#';
  const extra=[]; // malhas avulsas (cilindros, plantas...)
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const ch=P[y][x], x0=x,x1=x+1,z0=y,z1=y+1,cx=x+.5,cz=y+.5;
    if(ch==='#'){
      const border=x===0||y===0||x===W-1||y===H-1;
      const h=y===H-1?0.22:border?2.3:1.25;               // parede da frente cortada, internas mais baixas
      box(x0,0,z0,x1,h,z1,wallCol,new THREE.Color(wallCol).multiplyScalar(0.7).getStyle());
      // rodapé
      if(!isWall(x,y+1)&&h>1)box(x0,0,z1-0.001,x1,0.12,z1+0.03,'#5d4a3a');
      continue;}
    F.quad([x0,0,z1],[x1,0,z1],[x1,0,z0],[x0,0,z0],0,1,0,C((x+y)%2?th.floor:th.floor2));
    const prodCol=k=>th.prod.length?th.prod[Math.floor(hash(x,y+k)*th.prod.length)]:'#999';
    switch(ch){
      case 'E':box(x0+0.04,0,z0+0.1,x1-0.04,0.02,z1,'#7a2e2e');break;
      case 'S':{box(x0+0.08,0,z0+0.15,x1-0.08,1.55,z1-0.15,th.shelf);
        for(let lv=0;lv<3;lv++)for(let k=0;k<3;k++)for(const side of [-1,1]){const px=x0+0.17+k*0.24,y0=0.25+lv*0.45,z=side<0?z0+0.08:z1-0.22;
          box(px,y0,z,px+0.17,y0+0.26,z+0.14,prodCol(k+lv*3+(side>0?9:0)));}break;}
      case 'F':box(x0+0.05,0,z0+0.05,x1-0.05,1.95,z1-0.3,'#dfe7ea');box(x0+0.12,0.3,z1-0.31,x1-0.12,1.8,z1-0.27,'#9fd3e8');
        for(let k=0;k<4;k++)box(x0+0.18+k*0.17,0.4+(k%2)*0.5,z1-0.36,x0+0.3+k*0.17,0.62+(k%2)*0.5,z1-0.31,['#e53935','#fdd835','#43a047','#1e88e5'][k]);break;
      case 'C':box(x0,0,z0,x1,0.95,z1,'#8d6e63','#bcaaa4');break;
      case 'T':{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.06,16),lam('#a1887f'));m.position.set(cx,0.75,cz);extra.push(m);
        const l=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.09,0.75,8),lam('#5d4037'));l.position.set(cx,0.375,cz);extra.push(l);
        const p=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.1,0.03,12),lam('#ffffff'));p.position.set(cx-0.1,0.8,cz-0.05);extra.push(p);break;}
      case 'c':box(cx-0.2,0.42,cz-0.2,cx+0.2,0.48,cz+0.2,'#795548');box(cx-0.2,0,cz-0.2,cx-0.16,0.42,cz-0.16,'#4e342e');box(cx+0.16,0,cz+0.16,cx+0.2,0.42,cz+0.2,'#4e342e');
        box(cx+0.16,0,cz-0.2,cx+0.2,0.42,cz-0.16,'#4e342e');box(cx-0.2,0,cz+0.16,cx-0.16,0.42,cz+0.2,'#4e342e');break;
      case 'B':{ // camas vizinhas viram uma cama só (de casal)
        const nb=(dx,dy)=>!isWall(x+dx,y+dy)&&P[y+dy][x+dx]==='B';
        const a0=nb(-1,0)?x0:x0+0.05,a1=nb(1,0)?x1:x1-0.05,b0=nb(0,-1)?z0:z0+0.05,b1=nb(0,1)?z1:z1-0.05;
        box(a0,0,b0,a1,0.45,b1,'#eceff1');
        if(!nb(0,-1)){box(a0,0,b0-0.02,a1,0.9,b0+0.06,'#6d4c41');box(a0+0.12,0.45,b0+0.1,a1-0.12,0.6,b0+0.36,'#ffffff');box(a0,0.45,b0+0.4,a1,0.54,b1,'#90caf9');}
        else box(a0,0.45,b0,a1,0.54,b1,'#90caf9');break;}
      case 'D':box(x0+0.05,0.7,z0+0.08,x1-0.05,0.78,z1-0.08,'#6d4c41');box(x0+0.08,0,z0+0.1,x0+0.14,0.7,z1-0.1,'#4e342e');box(x1-0.14,0,z0+0.1,x1-0.08,0.7,z1-0.1,'#4e342e');
        if(it.kind==='escola'){box(cx-0.2,0.78,cz-0.12,cx+0.1,0.83,cz+0.12,prodCol(1));box(cx+0.12,0.78,cz-0.1,cx+0.32,0.8,cz+0.1,'#ffffff');}
        else{box(cx-0.25,0.78,z0+0.18,cx+0.25,1.15,z0+0.24,'#263238');box(cx-0.22,0.81,z0+0.241,cx+0.22,1.12,z0+0.25,'#4fc3f7');}break;
      case 'K':box(x0,0.85,z0,x1,1.75,z0+0.06,'#2e4a32');box(x0,0.83,z0,x1,0.87,z0+0.12,'#8d6e63');
        box(x0+0.1+hash(x,y)*0.3,1.4,z0+0.061,x0+0.5+hash(x,y)*0.3,1.43,z0+0.065,'#e0e0e0');box(x0+0.1,1.15,z0+0.061,x0+0.75,1.18,z0+0.065,'#e0e0e0');break;
      case 'P':{const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.15,0.35,10),lam('#8d6e63'));pot.position.set(cx,0.175,cz);extra.push(pot);
        const lf=new THREE.Mesh(new THREE.IcosahedronGeometry(0.38,0),new THREE.MeshLambertMaterial({color:'#2e7d32',flatShading:true}));lf.position.set(cx,0.7,cz);lf.scale.set(1,1.3,1);extra.push(lf);break;}
      case 'V':box(x0,0,z0+0.15,x1,0.42,z1-0.05,'#5c6bc0');box(x0,0.42,z0+0.15,x1,0.85,z0+0.35,'#3f51b5');break;
      case 'R':box(x0,0.7,z0,x1,1.8,z0+0.08,'#4e342e');for(let k=0;k<3;k++)box(x0+0.08,0.9+k*0.3,z0+0.08,x1-0.12-(k%2)*0.2,0.98+k*0.3,z0+0.16,'#212121');break;
      case 'G':{for(const [r,c,d] of [[0.42,'#fafafa',0],[0.29,'#e53935',0.01],[0.15,'#fafafa',0.02]]){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,0.03,20),lam(c));m.rotation.x=Math.PI/2;m.position.set(cx,1.15,z0+0.3+d);extra.push(m);}
        box(cx-0.03,0,z0+0.25,cx+0.03,0.75,z0+0.29,'#616161');break;}
      case '-':box(x0,0,cz-0.03,x1,0.012,cz+0.03,'#ffffff');break;
      case 'J':{ // grade da cela: barras na direção em que a grade continua
        const hz=(!isWall(x-1,y)&&P[y][x-1]==='J')||(!isWall(x+1,y)&&P[y][x+1]==='J');
        const vt=(!isWall(x,y-1)&&P[y-1][x]==='J')||(!isWall(x,y+1)&&P[y+1][x]==='J');
        if(hz||!vt){for(let k=0;k<4;k++){const px=x0+0.1+k*0.25;box(px,0,cz-0.03,px+0.05,2.0,cz+0.03,'#9e9e9e');}box(x0,1.0,cz-0.04,x1,1.06,cz+0.04,'#9e9e9e');box(x0,1.94,cz-0.04,x1,2.0,cz+0.04,'#9e9e9e');}
        if(vt){for(let k=0;k<4;k++){const pz=z0+0.1+k*0.25;box(cx-0.03,0,pz,cx+0.03,2.0,pz+0.05,'#9e9e9e');}box(cx-0.04,1.0,z0,cx+0.04,1.06,z1,'#9e9e9e');box(cx-0.04,1.94,z0,cx+0.04,2.0,z1,'#9e9e9e');}
        break;}
    }
  }
  const room=G.mesh(new THREE.MeshLambertMaterial({vertexColors:true}));room.castShadow=true;room.receiveShadow=true;scene.add(room);
  const floor=F.mesh(new THREE.MeshLambertMaterial({vertexColors:true}));floor.receiveShadow=true;scene.add(floor);
  for(const m of extra){m.castShadow=true;m.receiveShadow=true;scene.add(m);}
  // anéis dos pontos de interação
  rings=it.points.map(p=>{const m=new THREE.Mesh(new THREE.RingGeometry(0.34,0.44,28),new THREE.MeshBasicMaterial({color:'#ffe9a0',transparent:true,opacity:0.4,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.set(p.x/ITS,0.02,p.y/ITS);m.userData.p=p;scene.add(m);return m;});
  // pessoas
  const sh=NPC_SHIRT[it.kind]||'#ffffff';
  people=[];
  if(it.att){const g=person(sh,'#e0ac69','#2b1b10',1.1);pose(g,it.att.x,it.att.y,Math.PI/2,0,false);}
  if(it.teacher){const g=person(sh,'#c68642','#111',1.1);pose(g,it.teacher.x,it.teacher.y,Math.PI/2,0,false);}
  for(const n of it.npcs)people.push({n,g:person(n.shirt,n.skin,n.hair,1)});
  built={it,me:person('#ff7a1a','#c68642','#111',1.15)};
  // câmera: da porta, inclinada, enquadrando tudo
  camera=new THREE.PerspectiveCamera(40,1,0.3,100);
}

const _v=new THREE.Vector3();
function frameCamera(it){
  camera.aspect=CW/CH;
  const vf=THREE.MathUtils.degToRad(camera.fov), tilt=THREE.MathUtils.degToRad(58);
  const needW=(it.W/2+0.6)/(Math.tan(vf/2)*camera.aspect), needH=(it.H*Math.sin(tilt)/2+1.4)/Math.tan(vf/2);
  const L=Math.max(needW,needH)+1.5;
  const tx=it.W/2, tz=it.H/2+0.3;
  camera.position.set(tx,Math.sin(tilt)*L,tz+Math.cos(tilt)*L);camera.lookAt(tx,0,tz-0.2);camera.updateProjectionMatrix();
}
const proj=(x,y,h)=>{_v.set(x/ITS,h,y/ITS).project(camera);return{x:(_v.x+1)/2*CW,y:(1-_v.y)/2*CH};};

export function renderInterior3D(){
  const it=S.interior;if(!it)return;
  if(!built||built.it!==it)build(it);
  const renderer=getRenderer();
  const sz=new THREE.Vector2();renderer.getSize(sz);if(sz.x!==CW||sz.y!==CH)renderer.setSize(CW,CH,false);
  frameCamera(it);
  pose(built.me,it.px,it.py,it.pa,it.anim,it.moving);
  for(const {n,g} of people)pose(g,n.x,n.y,n.a,n.anim,n.moving,n.sit);
  const near=nearestPoint(it);
  for(const r of rings){const on=r.userData.p===near;r.material.opacity=on?0.95:0.4;const s=on?1+Math.sin(S.gameTime*6)*0.08:1;r.scale.set(s,s,s);}
  if(renderer.shadowMap.enabled)renderer.shadowMap.needsUpdate=true;
  renderer.render(scene,camera);
  // HUD por cima
  const g=ctx;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,CW*DPR,CH*DPR);g.setTransform(DPR,0,0,DPR,0,0);
  g.font='bold 22px "Courier New",monospace';g.textAlign='center';g.fillStyle='rgba(0,0,0,0.8)';g.fillText(interiorTitle(),CW/2+2,38);g.fillStyle='#ffe9a0';g.fillText(interiorTitle(),CW/2,36);
  if(near){const q=near.exit?proj(it.px,it.py,1.9):proj(near.x,near.y,1.5);drawKeycap(g,'F',q.x-60,q.y,near.label);}
  else{g.font='bold 13px "Courier New",monospace';g.fillStyle='rgba(255,255,255,0.7)';g.fillText('Anda com WASD · o tapete vermelho é a saída',CW/2,CH-24);}
  const money='$ '+Math.floor(player.money).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  g.textAlign='right';g.font='bold 26px "Courier New",monospace';g.fillStyle='rgba(0,0,0,0.75)';g.fillText(money,CW-18,38);g.fillStyle='#7dff6b';g.fillText(money,CW-20,36);
  g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(18,18,184,16);g.fillStyle='#e53935';g.fillRect(20,20,180*clamp(player.health/100,0,1),12);
}
