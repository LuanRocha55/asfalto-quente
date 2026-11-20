// Renderizador 3D (Three.js). A lógica do jogo continua em 2D; aqui só desenha.
import * as THREE from '../../vendor/three/three.module.min.js';
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { clamp, lerp, hyp } from '../core/utils.js';
import { T, W, H } from '../world/map.js';
import { CHUNK, getChunk } from '../world/chunks.js';
import { darkness, golden } from '../world/time.js';
import { heatStars } from '../game/world.js';
import { nearestCar } from '../game/player.js';
import { doorOf } from '../game/jobs.js';
import { matchOn, match, opponent, HOME } from '../game/stadium.js';
import { drawGround2D, label } from '../render/draw.js';
import { drawHUD, drawKeycap } from '../render/hud.js';
import { ICONS, KIND_ICON } from '../render/icons.js';
import { buildCity, U, bh } from './build.js';
import { S, player, cam, keys, view } from '../core/state.js';

export const R={ok:false,on:false};
let renderer,scene,camera,sun,hemi,ground={},mats,city,overlay,overlayTex,overlayMesh,water;
const tmpV=new THREE.Vector3();

// ---------- inicialização ----------
export function init3D(){
  try{
    const canvas=document.getElementById('gl');
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    if(!renderer.getContext())throw new Error('sem WebGL');
    renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    scene=new THREE.Scene();
    scene.fog=new THREE.Fog('#9cc9f0',70,150);
    camera=new THREE.PerspectiveCamera(42,1,0.5,400);
    hemi=new THREE.HemisphereLight('#dfefff','#5a6b4a',0.9);scene.add(hemi);
    sun=new THREE.DirectionalLight('#fff4e0',2.2);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-45;sc.right=45;sc.top=45;sc.bottom=-45;sc.near=1;sc.far=200;sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;
    scene.add(sun);scene.add(sun.target);
    mats={
      city:new THREE.MeshLambertMaterial({vertexColors:true}),
      glass:new THREE.MeshLambertMaterial({vertexColors:true}),
      lit:new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false}),
      trunk:new THREE.MeshLambertMaterial({color:'#6d4c33'}),
      leaf:new THREE.MeshLambertMaterial({color:'#ffffff',flatShading:true}),
      pole:new THREE.MeshLambertMaterial({color:'#4a4a50'}),
      lampHead:new THREE.MeshLambertMaterial({color:'#cfcfc7',emissive:'#fff1b8',emissiveIntensity:0}),
      lightPool:new THREE.MeshBasicMaterial({map:radialTex('255,214,140'),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}),
      umbrella:new THREE.MeshLambertMaterial({color:'#ffffff'}),
      dark:new THREE.MeshLambertMaterial({color:'#1d1d1f'}),
      bulb:new THREE.MeshBasicMaterial({color:'#ffffff'}),
      crowd:new THREE.MeshLambertMaterial({color:'#ffffff'}),
    };
    city=buildCity(scene,mats);
    for(const s of city.special3d){scene.add(s.mesh);scene.add(s.crowd);scene.add(s.lightBoxes);scene.add(s.fieldLight);}
    // mar em volta
    const wg=new THREE.PlaneGeometry(W*3,H*3);wg.rotateX(-Math.PI/2);
    water=new THREE.Mesh(wg,new THREE.MeshLambertMaterial({color:'#1f5f8b'}));water.position.set(W/2,-0.06,H/2);water.receiveShadow=true;scene.add(water);
    // camada do chão com detalhes dinâmicos (marcas de pneu, zonas, portas, alvo...)
    overlay=document.createElement('canvas');overlay.width=1024;overlay.height=1024;
    overlayTex=new THREE.CanvasTexture(overlay);overlayTex.colorSpace=THREE.SRGBColorSpace;
    const og=new THREE.PlaneGeometry(64,64);og.rotateX(-Math.PI/2);
    overlayMesh=new THREE.Mesh(og,new THREE.MeshLambertMaterial({map:overlayTex,transparent:true,depthWrite:false}));overlayMesh.renderOrder=1;overlayMesh.receiveShadow=true;scene.add(overlayMesh);
    R.ok=true;
    view3d();
  }catch(e){console.warn('3D indisponível:',e);R.ok=false;}
  return R.ok;
}
function radialTex(rgb){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba('+rgb+',1)');gr.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}

// troca entre 3D e clássico
export function set3D(on){
  R.on=on&&R.ok;
  document.getElementById('gl').style.display=R.on?'block':'none';
  if(R.on)view3d();else{view.project=(x,y)=>({x:(x-cam.x)*cam.zoom+CW/2,y:(y-cam.y)*cam.zoom+CH/2});view.unproject=(sx,sy)=>({x:cam.x+(sx-CW/2)/cam.zoom,y:cam.y+(sy-CH/2)/cam.zoom});}
}
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),ndc=new THREE.Vector2(),hit=new THREE.Vector3();
function view3d(){
  view.project=(x,y,h)=>{tmpV.set(x*U,h||0,y*U).project(camera);return{x:(tmpV.x+1)/2*CW,y:(1-tmpV.y)/2*CH,behind:tmpV.z>1};};
  view.unproject=(sx,sy)=>{ndc.set(sx/CW*2-1,-(sy/CH*2-1));ray.setFromCamera(ndc,camera);if(!ray.ray.intersectPlane(plane,hit))return{x:cam.x,y:cam.y};return{x:hit.x*T,y:hit.z*T};};
}

// ---------- chão: as mesmas texturas do 2D em placas ----------
function updateGround(cx0,cz0,radius){
  const n=Math.ceil(radius/CHUNK)+1, ccx=Math.floor(cx0/CHUNK), ccz=Math.floor(cz0/CHUNK);
  const want=new Set();
  for(let dz=-n;dz<=n;dz++)for(let dx=-n;dx<=n;dx++){
    const x=ccx+dx,z=ccz+dz;if(x<0||z<0||x*CHUNK>=W||z*CHUNK>=H)continue;
    const k=x+','+z;want.add(k);
    if(!ground[k]){const tex=new THREE.CanvasTexture(getChunk(x,z));tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
      const geo=new THREE.PlaneGeometry(CHUNK,CHUNK);geo.rotateX(-Math.PI/2);
      const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:tex}));m.position.set(x*CHUNK+CHUNK/2,0,z*CHUNK+CHUNK/2);m.receiveShadow=true;scene.add(m);ground[k]={m,t:0};}
    ground[k].t=0;
  }
  for(const k of Object.keys(ground)){if(want.has(k))continue;ground[k].t++;if(ground[k].t>120){const g=ground[k];scene.remove(g.m);g.m.geometry.dispose();g.m.material.map.dispose();g.m.material.dispose();delete ground[k];}}
}

// ---------- carros ----------
const carMeshes=new Map(), matCache={};
const mat=(col,opt)=>{const k=col+(opt||'');if(!matCache[k])matCache[k]=opt==='e'?new THREE.MeshBasicMaterial({color:col}):new THREE.MeshLambertMaterial({color:col});return matCache[k];};
const boxG=new THREE.BoxGeometry(1,1,1);
function part(g,col,sx,sy,sz,x,y,z,opt){const m=new THREE.Mesh(boxG,mat(col,opt));m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
const HEIGHTS={busao:1.15,caminhao:1.25,camin:0.5,suv:0.55,moto:0.3,guincho:0.55,viatura:0.42};
function makeCar(c){
  const g=new THREE.Group(), L=c.t.len*U, Wd=c.t.wid*U, h=HEIGHTS[c.type]||0.42;
  g.userData.col=c.color;
  if(c.type==='moto'){part(g,'#222',L,0.25,0.12,0,0.25,0);g.userData.body=part(g,c.color,L*0.55,0.22,Wd*0.6,0,0.42,0);part(g,'#e53935',0.22,0.22,0.22,-L*0.1,0.75,0);}
  else{
    g.userData.body=part(g,c.color,L,h,Wd,0,0.18+h/2,0);
    if(c.type==='busao'||c.type==='caminhao'){part(g,'#9fd3e8',0.06,h*0.45,Wd*0.85,L/2-0.02,0.18+h*0.65,0);if(c.type==='busao')for(let k=0;k<6;k++)part(g,'#cfe9f5',L*0.09,h*0.3,Wd*1.01,-L/2+L*0.12+k*L*0.14,0.18+h*0.7,0);}
    else if(c.type==='camin'||c.type==='guincho'){part(g,'#2c3e50',L*0.32,0.32,Wd*0.92,L*0.12,0.18+h+0.15,0);part(g,'#86c5da',0.05,0.25,Wd*0.85,L*0.28,0.18+h+0.13,0);}
    else if(c.type!=='bugue'){const cw=c.type==='suv'?0.55:0.42;part(g,c.type==='viatura'?'#f4f4f4':'#263238',L*cw,0.3,Wd*0.88,-L*0.04,0.18+h+0.14,0);part(g,'#86c5da',0.05,0.24,Wd*0.82,L*cw/2-L*0.04+0.02,0.18+h+0.12,0);}
    else{part(g,'#333',L*0.5,0.06,Wd*0.9,-0.05,0.18+h+0.4,0);}
    if(c.type==='taxi')part(g,'#e53935',0.3,0.12,0.18,-L*0.05,0.18+h+0.35,0);
    if(c.type==='viatura'){g.userData.sirenR=part(g,'#7a1010',0.18,0.1,Wd*0.4,-L*0.05,0.18+h+0.34,-Wd*0.22);g.userData.sirenB=part(g,'#0e1f66',0.18,0.1,Wd*0.4,-L*0.05,0.18+h+0.34,Wd*0.22);}
    for(const sx of[-1,1])for(const sz of[-1,1])part(g,'#111',0.32,0.32,0.12,sx*L*0.32,0.16,sz*Wd*0.5);
    g.userData.brake=[part(g,'#5a0a0a',0.04,0.1,0.18,-L/2-0.01,0.18+h*0.65,-Wd*0.32),part(g,'#5a0a0a',0.04,0.1,0.18,-L/2-0.01,0.18+h*0.65,Wd*0.32)];
    g.userData.head=[part(g,'#fffbe6',0.04,0.1,0.18,L/2+0.01,0.18+h*0.6,-Wd*0.32,'e'),part(g,'#fffbe6',0.04,0.1,0.18,L/2+0.01,0.18+h*0.6,Wd*0.32,'e')];
    // facho dos faróis no chão (só de noite)
    const beam=new THREE.Mesh(beamG,beamMat);beam.position.set(L/2+2.4,0.04,0);beam.renderOrder=2;g.add(beam);g.userData.beam=beam;
  }
  scene.add(g);return g;
}
const beamG=(()=>{const g=new THREE.PlaneGeometry(4.5,2.6);g.rotateX(-Math.PI/2);return g;})();
const beamMat=new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,128,0);gr.addColorStop(0,'rgba(255,250,215,0.9)');gr.addColorStop(1,'rgba(255,250,215,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,26);g.lineTo(128,0);g.lineTo(128,64);g.lineTo(0,38);g.fill();return new THREE.CanvasTexture(c);})(),
  transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
const brakeOn=new THREE.MeshBasicMaterial({color:'#ff2a2a'}), brakeOff=new THREE.MeshLambertMaterial({color:'#5a0a0a'});
const sirR=[new THREE.MeshBasicMaterial({color:'#ff2020'}),new THREE.MeshLambertMaterial({color:'#5a1010'})], sirB=[new THREE.MeshBasicMaterial({color:'#3060ff'}),new THREE.MeshLambertMaterial({color:'#101a50'})];
const wreckMat=new THREE.MeshLambertMaterial({color:'#2b2724'});
function syncCars(night){
  const seen=new Set();
  for(const c of S.cars){
    let g=carMeshes.get(c);if(!g){g=makeCar(c);carMeshes.set(c,g);}
    seen.add(c);
    g.position.set(c.x*U,0,c.y*U);g.rotation.y=-c.a;
    const b=g.userData.body;
    if(c.wreck){if(b.material!==wreckMat)b.material=wreckMat;}
    else if(g.userData.col!==c.color){b.material=mat(c.color);g.userData.col=c.color;}
    if(g.userData.brake)for(const m of g.userData.brake)m.material=c.brakeLight&&!c.wreck?brakeOn:brakeOff;
    if(g.userData.sirenR){const on=heatStars()>0&&(c.ai==='police'||c.ai==='block'),f=Math.floor(S.gameTime*8)%2;g.userData.sirenR.material=on&&f?sirR[0]:sirR[1];g.userData.sirenB.material=on&&!f?sirB[0]:sirB[1];}
    if(g.userData.beam)g.userData.beam.material.opacity=0.55*night;
    if(g.userData.beam)g.userData.beam.visible=night>0.05&&!!c.driver&&!c.wreck;
  }
  for(const [c,g] of carMeshes)if(!seen.has(c)){scene.remove(g);carMeshes.delete(c);}
}

// ---------- pessoas ----------
const pedMeshes=new Map();
const legG=new THREE.BoxGeometry(0.1,0.36,0.1);legG.translate(0,-0.18,0);
const bodyG=new THREE.CylinderGeometry(0.17,0.15,0.5,7);
const headG=new THREE.SphereGeometry(0.13,8,6);
function makePerson(shirt,skin,hair,scale){
  const g=new THREE.Group();
  const l1=new THREE.Mesh(legG,mat('#2b2f45'));l1.position.set(0,0.36,-0.08);const l2=new THREE.Mesh(legG,mat('#2b2f45'));l2.position.set(0,0.36,0.08);
  const b=new THREE.Mesh(bodyG,mat(shirt));b.position.y=0.6;const h=new THREE.Mesh(headG,mat(skin));h.position.y=0.98;
  const hr=new THREE.Mesh(headG,mat(hair));hr.scale.set(1.05,0.6,1.05);hr.position.set(-0.02,1.04,0);
  for(const m of [l1,l2,b,h,hr]){m.castShadow=true;g.add(m);}
  g.userData={l1,l2};g.scale.setScalar(scale||1);scene.add(g);return g;
}
function poseP(g,x,y,a,anim,moving,down){
  g.position.set(x*U,0,y*U);g.rotation.set(0,-a,0);
  if(down){g.rotation.z=Math.PI/2;g.position.y=0.15;}
  const s=moving?Math.sin(anim*10)*0.6:0;g.userData.l1.rotation.z=s;g.userData.l2.rotation.z=-s;
}
let playerMesh=null;
function syncPeople(){
  const seen=new Set();
  for(const p of S.peds){
    if(p.state==='dead'||p.state==='gone'||p.state==='dead2')continue;
    let g=pedMeshes.get(p);if(!g){g=makePerson(p.shirt,p.skin,p.hair,1);pedMeshes.set(p,g);}
    seen.add(p);poseP(g,p.x,p.y,p.a,p.anim,p.state!=='wait',p.state==='down');
  }
  for(const [p,g] of pedMeshes)if(!seen.has(p)){scene.remove(g);pedMeshes.delete(p);}
  if(!playerMesh)playerMesh=makePerson('#ff7a1a','#c68642','#111',1.15);
  const vis=!player.car&&player.state==='play'&&!(player.inv>0&&Math.floor(S.gameTime*10)%2);
  playerMesh.visible=vis;
  if(vis)poseP(playerMesh,player.x,player.y,player.a,player.anim/10,keys['KeyW']||keys['KeyS']||keys['KeyA']||keys['KeyD']||keys['ArrowUp']||keys['ArrowDown']||keys['ArrowLeft']||keys['ArrowRight'],false);
}

// ---------- partículas e tiros ----------
const dotTex=radialTex('255,255,255');
const pool={add:[],norm:[]};
function sprite(kind){const m=new THREE.SpriteMaterial({map:dotTex,transparent:true,depthWrite:false,blending:kind==='add'?THREE.AdditiveBlending:THREE.NormalBlending});const s=new THREE.Sprite(m);scene.add(s);return s;}
const colCache={};
function parseCol(str){if(colCache[str])return colCache[str];const m=str.match(/rgba?\((\d+),(\d+),(\d+)/);const c=m?new THREE.Color(m[1]/255,m[2]/255,m[3]/255):new THREE.Color(1,1,1);colCache[str]=c;return c;}
function syncParticles(){
  let ia=0,inr=0;
  for(const p of S.parts){
    const add=!!p.fire, list=add?pool.add:pool.norm, idx=add?ia++:inr++;
    if(idx>=350)continue;
    if(!list[idx])list[idx]=sprite(add?'add':'norm');
    const s=list[idx];s.visible=true;
    const a=clamp(p.life/p.max,0,1);
    const hgt=p.smoke?0.6+(1-a)*2.5:0.5;
    s.position.set(p.x*U,hgt,p.y*U);const sz=p.size*U*(p.fire?(a+0.3)*2.2:2.2);s.scale.set(sz,sz,1);
    s.material.color.copy(parseCol(p.col));s.material.opacity=add?a:a*0.55;
  }
  for(let k=ia;k<pool.add.length;k++)pool.add[k].visible=false;
  for(let k=inr;k<pool.norm.length;k++)pool.norm[k].visible=false;
}
const trGeo=new THREE.BufferGeometry();trGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(64*6),3));
const tracers=new THREE.LineSegments(trGeo,new THREE.LineBasicMaterial({color:'#fff2a0',transparent:true,blending:THREE.AdditiveBlending}));
let tracersAdded=false;
function syncTracers(){
  if(!tracersAdded){scene.add(tracers);tracersAdded=true;}
  const arr=trGeo.attributes.position.array;let n=0;
  for(const t of S.tracers){if(n>=64)break;arr.set([t.x1*U,0.7,t.y1*U,t.x2*U,0.7,t.y2*U],n*6);n++;}
  trGeo.setDrawRange(0,n*2);trGeo.attributes.position.needsUpdate=true;
}

// ---------- luz do dia, céu e cidade à noite ----------
const DAY=new THREE.Color('#9cc9f0'),SUNSET=new THREE.Color('#f0a070'),NIGHT=new THREE.Color('#0b1022');
function updateSky(cx,cz){
  const dk=darkness(), gd=golden();
  const bg=DAY.clone().lerp(SUNSET,gd*(1-dk*0.5)).lerp(NIGHT,dk);
  scene.background=bg;scene.fog.color.copy(bg);
  // sol cruza o céu de leste (6h) pra oeste (18h)
  const t=(S.tod-6)/12, ang=Math.PI*clamp(t,0,1);
  const sx=Math.cos(ang)*-60, sy=Math.max(8,Math.sin(ang)*70), sz=30;
  sun.position.set(cx-sx,sy,cz+sz);sun.target.position.set(cx,0,cz);
  sun.intensity=2.3*(1-dk)*(1-gd*0.3)+0.05;
  sun.color.set(gd>0.3?'#ffc890':'#fff4e0');
  hemi.intensity=0.95*(1-dk)+0.28;
  hemi.color.set(dk>0.5?'#5a6fa8':'#dfefff');
  mats.lit.opacity=clamp((dk-0.25)*1.6,0,1);
  mats.lightPool.opacity=0.55*dk;
  mats.lampHead.emissiveIntensity=dk>0.05?1.5*dk:0;
  // estádio: torcida e refletores
  for(const s of city.special3d){
    const live=matchOn();const lit=dk>0.2||live;
    s.fieldLight.intensity=lit?(dk>0.2?60:15):0;
    s.lightBoxes.children.forEach(m=>m.material=lit?mat('#fffde7','e'):mats.lampHead);
    const seats=s.crowd.userData.seats;const opp=opponent();
    if(s._live!==live){s._live=live;const dens=live?0.85:0.08;
      seats.forEach((p,i)=>{const h=Math.abs(Math.sin(i*12.9898)*43758.5453)%1;const hh=Math.abs(Math.sin(i*78.233)*12345.678)%1;
        const col=h>dens?'#5b6670':hh<0.68?HOME.colors[hh<0.4?0:1]:opp.colors[hh<0.84?0:1];s.crowd.setColorAt(i,new THREE.Color(col));});
      s.crowd.instanceColor.needsUpdate=true;}
    s.crowd.position.y=live?Math.abs(Math.sin(S.gameTime*6))*0.06:0;
  }
}
const BULB={r:[new THREE.Color('#ff3b30'),new THREE.Color('#3a1212')],y:[new THREE.Color('#ffcc00'),new THREE.Color('#3a3212')],g:[new THREE.Color('#34c759'),new THREE.Color('#123a1a')]};
let sigT=0;
function updateSignals(signalState){
  sigT-=1;if(sigT>0)return;sigT=6;
  city.heads3.forEach((h,k)=>{const st=signalState(h.i,h.j,h.axis);['r','y','g'].forEach((c,ci)=>city.bulbs[ci].setColorAt(k,BULB[c][st===c?0:1]));});
  for(const b of city.bulbs)b.instanceColor.needsUpdate=true;
}

// ---------- quadro ----------
let frameN=0,camZ=1,lastT=performance.now(),slow=0,quality=2;
// se o computador não aguentar, reduz a qualidade sozinho (primeiro a resolução, depois as sombras)
function adapt(){
  const now=performance.now(),dt=now-lastT;lastT=now;
  if(!S.started||S.paused||dt>500)return;
  slow=dt>40?slow+1:Math.max(0,slow-2);
  if(slow>90&&quality>0){quality--;slow=0;
    if(quality===1)renderer.setPixelRatio(1);
    if(quality===0){renderer.shadowMap.enabled=false;sun.castShadow=false;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});}
    R.notice='Ajustei os gráficos pra rodar mais leve neste computador.';}
}
export function render3D(signalState){
  frameN++;adapt();
  if(R.notice){S.messages.push({t:R.notice,life:4});R.notice=null;}
  renderer.setSize(CW,CH,false);
  camera.aspect=CW/CH;camera.updateProjectionMatrix();
  // câmera inclinada acima do jogador (afasta com a velocidade)
  const zn=cam.zoom/clamp(CH/820,0.7,1.6);camZ=lerp(camZ,zn,0.1);
  const dist=24/clamp(camZ,0.5,1.3);
  const tx=cam.x*U, tz=cam.y*U;
  const shx=(Math.random()-.5)*S.shake*0.05, shz=(Math.random()-.5)*S.shake*0.05;
  camera.position.set(tx+shx,dist*0.92,tz+dist*0.62+shz);camera.lookAt(tx,0,tz-1);
  const night=darkness();
  updateSky(tx,tz);
  updateSignals(signalState);
  updateGround(tx,tz-dist*0.4,dist*1.6);
  // camada de detalhes do chão: centrada um pouco à frente da câmera, presa numa grade
  const ocx=Math.round(tx/4)*4, ocz=Math.round((tz-6)/4)*4;
  overlayMesh.position.set(ocx,0.025,ocz);
  if(frameN%2===0){
    const g=overlay.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1024,1024);
    const k=1024/(64*T); g.setTransform(k,0,0,k,-(ocx-32)*T*k,-(ocz-32)*T*k);
    const vx0=(ocx-32)*T,vy0=(ocz-32)*T;
    R.last=drawGround2D(g,vx0,vx0+64*T,vy0,vy0+64*T,'3d');
    overlayTex.needsUpdate=true;
  }
  syncCars(night);syncPeople();syncParticles();syncTracers();
  renderer.render(scene,camera);
  // HUD e avisos por cima, em 2D
  const g=ctx;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,CW*DPR,CH*DPR);g.setTransform(DPR,0,0,DPR,0,0);
  drawPrompts(g);
  drawHUD(g,(R.last&&R.last.tgt)||null);
}

// avisos com tecla e textos que flutuam (projetados do 3D pra tela)
function drawPrompts(g){
  const P=(x,y,h)=>view.project(x,y,h);
  const nearB=R.last&&R.last.nearB;
  if(!player.car&&player.state==='play'){
    const nc=nearestCar(26);
    const carCloser=nc&&(!nearB||hyp(nc.x-player.x,nc.y-player.y)-nc.t.wid/2<hyp(doorOf(nearB).x-player.x,doorOf(nearB).y-player.y));
    if(nc&&carCloser){const p=P(nc.x,nc.y,1.6);g.font='bold 12px "Courier New",monospace';const t=(nc.driver==='ai'?'Roubar ':'Entrar: ')+nc.t.name;drawKeycap(g,'F',p.x-(g.measureText(t).width+28)/2,p.y,t,12);}
    else if(nearB){const d=doorOf(nearB);const p=P(d.x,d.y,1.4);const name=ICONS[KIND_ICON[nearB.kind]].name.split(' (')[0].split(' ·')[0];g.font='bold 13px "Courier New",monospace';drawKeycap(g,'F',p.x-(g.measureText('Entrar: '+name).width+30)/2,p.y,'Entrar: '+name,13);}
  }
  // passageiro esperando e carros da missão: setinha amarela em cima
  for(const p of S.peds)if(p.state==='wait'){const q=P(p.x,p.y,1.6+Math.sin(S.gameTime*6)*0.1);arrowDown(g,q.x,q.y);}
  if(S.mission)for(const c of S.cars)if(c.mission===S.mission&&!c.wreck){const q=P(c.x,c.y,1.8+Math.sin(S.gameTime*6)*0.1);arrowDown(g,q.x,q.y);
    if(c.maxHp){const f=clamp(c.health/c.maxHp,0,1);g.fillStyle='rgba(0,0,0,0.6)';g.fillRect(q.x-21,q.y-24,42,7);g.fillStyle=f>0.4?'#4cff6a':'#ff5030';g.fillRect(q.x-20,q.y-23,40*f,5);}}
  for(const f of S.floaters){const q=P(f.x,f.y,1.5);g.globalAlpha=clamp(f.life,0,1);label(g,f.t,q.x,q.y,f.col,15);}g.globalAlpha=1;
  // placar do estádio
  if(matchOn()){const st=city.special3d[0];if(st){const b=st.b,q=P((b.x0+b.x1)/2,b.y0,bh(b)*1.4+1.5);const m=match();if(!q.behind)label(g,HOME.name+' '+m.hs+' x '+m.as+' '+opponent().name,q.x,q.y,'#ffe14a',14);}}
}
function arrowDown(g,x,y){g.fillStyle='#ffe14a';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y+8);g.lineTo(x-7,y-4);g.lineTo(x+7,y-4);g.closePath();g.fill();g.stroke();}
