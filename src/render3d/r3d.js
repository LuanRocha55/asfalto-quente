// Renderizador 3D (Three.js). A lógica do jogo continua em 2D; aqui só desenha.
import * as THREE from '../../vendor/three/three.module.min.js';
import { ctx, CW, CH, DPR } from '../core/canvas.js';
import { clamp, lerp, hyp } from '../core/utils.js';
import { T, W, H } from '../world/map.js';
import { CHUNK, getChunk, makeLowres } from '../world/chunks.js';
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
export const DBG={};
export const getRenderer=()=>renderer;
let renderer,scene,camera,sun,hemi,ground={},mats,city,overlay,overlayTex,overlayMesh,water;
const tmpV=new THREE.Vector3();

// ---------- inicialização ----------
export function init3D(){
  try{
    const canvas=document.getElementById('gl');
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    if(!renderer.getContext())throw new Error('sem WebGL');
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    scene=new THREE.Scene();
    scene.fog=new THREE.Fog('#9cc9f0',70,150);
    camera=new THREE.PerspectiveCamera(42,1,0.5,170);
    hemi=new THREE.HemisphereLight('#dfefff','#5a6b4a',0.9);scene.add(hemi);
    sun=new THREE.DirectionalLight('#fff4e0',2.2);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-34;sc.right=34;sc.top=34;sc.bottom=-34;sc.near=1;sc.far=160;sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;
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
      fieldGlow:new THREE.MeshBasicMaterial({map:radialTex('255,250,225'),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}),
      detail:new THREE.MeshLambertMaterial({vertexColors:true}),
    };
    city=buildCity(scene,mats);
    for(const s of city.special3d){scene.add(s.mesh);scene.add(s.crowd);scene.add(s.lightBoxes);scene.add(s.fieldLight);}
    // mar em volta
    const wg=new THREE.PlaneGeometry(W*3,H*3);wg.rotateX(-Math.PI/2);
    water=new THREE.Mesh(wg,new THREE.MeshLambertMaterial({color:'#1f5f8b'}));water.position.set(W/2,-0.08,H/2);scene.add(water);
    // LOD do chão: o mapa todo em baixa resolução, por baixo dos pedaços detalhados (nunca aparece buraco)
    const lt=new THREE.CanvasTexture(makeLowres());lt.colorSpace=THREE.SRGBColorSpace;lt.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const lg=new THREE.PlaneGeometry(W,H);lg.rotateX(-Math.PI/2);
    const low=new THREE.Mesh(lg,new THREE.MeshLambertMaterial({map:lt}));low.position.set(W/2,-0.03,H/2);low.receiveShadow=true;scene.add(low);
    // camada do chão com detalhes dinâmicos (marcas de pneu, zonas, portas, alvo...)
    overlay=document.createElement('canvas');overlay.width=1024;overlay.height=1024;
    overlayTex=new THREE.CanvasTexture(overlay);overlayTex.colorSpace=THREE.SRGBColorSpace;
    const og=new THREE.PlaneGeometry(64,64);og.rotateX(-Math.PI/2);
    overlayMesh=new THREE.Mesh(og,new THREE.MeshLambertMaterial({map:overlayTex,transparent:true,depthWrite:false}));overlayMesh.renderOrder=1;overlayMesh.receiveShadow=true;scene.add(overlayMesh);
    initPeople();initParticles();
    R.ok=true;DBG.renderer=renderer;DBG.scene=scene;
    applyQuality(quality);
    view3d();warmUp();
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
// Streaming do chão: carrega os pedaços que estão (ou vão estar) na tela, os mais perto primeiro,
// no máximo alguns por quadro pra não travar. Enquanto não chega, aparece o chão em baixa resolução.
const groundMats=[];
function updateGround(x0,x1,z0,z1,ahead){
  const want=new Map();
  const add=(xa,xb,za,zb,pri)=>{for(let z=Math.floor(za/CHUNK);z<=Math.floor(zb/CHUNK);z++)for(let x=Math.floor(xa/CHUNK);x<=Math.floor(xb/CHUNK);x++){
    if(x<0||z<0||x*CHUNK>=W||z*CHUNK>=H)continue;const k=x+','+z;if(!want.has(k)||want.get(k).p>pri)want.set(k,{x,z,p:pri});}};
  add(x0,x1,z0,z1,0);                                             // o que está na tela
  if(ahead)add(x0+ahead.x,x1+ahead.x,z0+ahead.z,z1+ahead.z,1);    // pra onde o carro está indo
  const cx=(x0+x1)/2,cz=(z0+z1)/2;
  const missing=[...want.entries()].filter(([k])=>!ground[k]).map(([k,v])=>({k,...v,d:v.p*1e4+Math.hypot((v.x+0.5)*CHUNK-cx,(v.z+0.5)*CHUNK-cz)}));
  missing.sort((a,b)=>a.d-b.d);
  let budget=missing.length&&missing[0].p===0?3:1;
  for(const m of missing){if(budget--<=0)break;
    const tex=new THREE.CanvasTexture(getChunk(m.x,m.z));tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    const geo=new THREE.PlaneGeometry(CHUNK,CHUNK);geo.rotateX(-Math.PI/2);
    const mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:tex}));mesh.position.set(m.x*CHUNK+CHUNK/2,0,m.z*CHUNK+CHUNK/2);mesh.receiveShadow=true;scene.add(mesh);
    ground[m.k]={m:mesh,t:0};}
  for(const k of Object.keys(ground)){if(want.has(k)){ground[k].t=0;continue;}ground[k].t++;
    if(ground[k].t>300){const g=ground[k];scene.remove(g.m);g.m.geometry.dispose();g.m.material.map.dispose();g.m.material.dispose();delete ground[k];}}
}

// ---------- carros ----------
// Cada carro = poucas malhas: carroceria (cor do carro), detalhes fundidos numa malha só (rodas, cabine, vidros),
// luz de freio, faróis, sirene e facho. A malha de detalhes é a mesma pra todos os carros do mesmo tipo.
const carMeshes=new Map(), matCache={};
const mat=(col,opt)=>{const k=col+(opt||'');if(!matCache[k])matCache[k]=opt==='e'?new THREE.MeshBasicMaterial({color:col}):new THREE.MeshLambertMaterial({color:col});return matCache[k];};
const boxG=new THREE.BoxGeometry(1,1,1);
// junta várias caixas (com cor) numa geometria só
function mergeBoxes(list){
  const pos=[],nor=[],col=[],c=new THREE.Color(),src=boxG.toNonIndexed(),P=src.attributes.position,N=src.attributes.normal;
  for(const [hex,sx,sy,sz,x,y,z] of list){c.set(hex);
    for(let i=0;i<P.count;i++){pos.push(P.getX(i)*sx+x,P.getY(i)*sy+y,P.getZ(i)*sz+z);nor.push(N.getX(i),N.getY(i),N.getZ(i));col.push(c.r,c.g,c.b);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.computeBoundingSphere();return g;}
const HEIGHTS={busao:1.15,caminhao:1.25,camin:0.5,suv:0.55,moto:0.3,guincho:0.55,viatura:0.42,swat:0.85,fbi:0.4,exercito:0.45,blindado:0.8};
const carGeo={};
function carParts(c){
  const key=c.type+'|'+c.t.len+'|'+c.t.wid;if(carGeo[key])return carGeo[key];
  const L=c.t.len*U, Wd=c.t.wid*U, h=HEIGHTS[c.type]||0.42, D=[];let body,brake=null,head=null,siren=null;
  if(c.type==='moto'){D.push(['#222',L,0.25,0.12,0,0.25,0],['#e53935',0.22,0.22,0.22,-L*0.1,0.75,0]);body=[L*0.55,0.22,Wd*0.6,0,0.42,0];}
  else{
    body=[L,h,Wd,0,0.18+h/2,0];
    if(c.type==='swat'){D.push(['#9fd3e8',0.05,h*0.4,Wd*0.85,L/2-0.02,0.18+h*0.7,0],['#2a2e36',L*0.7,0.06,Wd*0.9,-L*0.08,0.18+h+0.03,0],['#e0e0e0',L*0.3,0.12,0.02,-L*0.05,0.18+h*0.55,Wd/2+0.005],['#e0e0e0',L*0.3,0.12,0.02,-L*0.05,0.18+h*0.55,-Wd/2-0.005]);
      siren=[[0.16,0.1,Wd*0.35,L*0.3,0.18+h+0.1,-Wd*0.2],[0.16,0.1,Wd*0.35,L*0.3,0.18+h+0.1,Wd*0.2]];}
    else if(c.type==='blindado'){D.push(['#2e3313',L*0.35,0.35,Wd*0.6,-L*0.05,0.18+h+0.17,0],['#23270e',L*0.45,0.12,0.12,L*0.2,0.18+h+0.25,0],['#9fd3e8',0.04,0.12,Wd*0.5,L/2-0.01,0.18+h*0.75,0]);
      for(const sx of[-0.36,-0.12,0.12,0.36])for(const sz of[-1,1])D.push(['#111',0.36,0.36,0.12,sx*L,0.18,sz*Wd*0.5]);}
    else if(c.type==='exercito'){D.push(['#3d4419',L*0.08,0.4,Wd*0.92,-L*0.05,0.18+h+0.2,0],['#86c5da',0.04,0.22,Wd*0.8,L*0.18,0.18+h+0.11,0],['#2e3313',L*0.3,0.08,Wd*0.92,-L*0.3,0.18+h+0.4,0]);}
    else if(c.type==='busao'||c.type==='caminhao'){D.push(['#9fd3e8',0.06,h*0.45,Wd*0.85,L/2-0.02,0.18+h*0.65,0]);if(c.type==='busao')for(let k=0;k<6;k++)D.push(['#cfe9f5',L*0.09,h*0.3,Wd*1.01,-L/2+L*0.12+k*L*0.14,0.18+h*0.7,0]);}
    else if(c.type==='camin'||c.type==='guincho'){D.push(['#2c3e50',L*0.32,0.32,Wd*0.92,L*0.12,0.18+h+0.15,0],['#86c5da',0.05,0.25,Wd*0.85,L*0.28,0.18+h+0.13,0]);}
    else if(c.type!=='bugue'){const cw=c.type==='suv'?0.55:0.42;if(c.type==='fbi')siren=[[0.08,0.06,0.12,L*0.08,0.18+h+0.2,-Wd*0.15],[0.08,0.06,0.12,L*0.08,0.18+h+0.2,Wd*0.15]];D.push([c.type==='viatura'?'#f4f4f4':'#263238',L*cw,0.3,Wd*0.88,-L*0.04,0.18+h+0.14,0],['#86c5da',0.05,0.24,Wd*0.82,L*cw/2-L*0.04+0.02,0.18+h+0.12,0]);}
    else D.push(['#333',L*0.5,0.06,Wd*0.9,-0.05,0.18+h+0.4,0]);
    if(c.type==='taxi')D.push(['#e53935',0.3,0.12,0.18,-L*0.05,0.18+h+0.35,0]);
    if(c.type!=='blindado')for(const sx of[-1,1])for(const sz of[-1,1])D.push(['#111',0.32,0.32,0.12,sx*L*0.32,0.16,sz*Wd*0.5]);
    brake=mergeBoxes([['#fff',0.04,0.1,0.18,-L/2-0.01,0.18+h*0.65,-Wd*0.32],['#fff',0.04,0.1,0.18,-L/2-0.01,0.18+h*0.65,Wd*0.32]]);
    head=mergeBoxes([['#fff',0.04,0.1,0.18,L/2+0.01,0.18+h*0.6,-Wd*0.32],['#fff',0.04,0.1,0.18,L/2+0.01,0.18+h*0.6,Wd*0.32]]);
    if(c.type==='viatura')siren=[[0.18,0.1,Wd*0.4,-L*0.05,0.18+h+0.34,-Wd*0.22],[0.18,0.1,Wd*0.4,-L*0.05,0.18+h+0.34,Wd*0.22]];
  }
  return carGeo[key]={detail:D.length?mergeBoxes(D):null,body,brake,head,siren,L};
}
function part(g,col,dims,opt){const m=new THREE.Mesh(boxG,mat(col,opt));m.scale.set(dims[0],dims[1],dims[2]);m.position.set(dims[3],dims[4],dims[5]);g.add(m);return m;}
function makeCar(c){
  const g=new THREE.Group(), P=carParts(c);
  g.userData.col=c.color;
  const body=part(g,c.color,P.body);body.castShadow=true;g.userData.body=body;
  if(P.detail){const d=new THREE.Mesh(P.detail,mats.detail);d.castShadow=true;g.add(d);}
  if(P.brake){const b=new THREE.Mesh(P.brake,brakeOff);g.add(b);g.userData.brake=b;}
  if(P.head){g.add(new THREE.Mesh(P.head,headMat));}
  if(P.siren){g.userData.sirenR=part(g,'#7a1010',P.siren[0]);g.userData.sirenB=part(g,'#0e1f66',P.siren[1]);}
  if(c.type!=='moto'){const beam=new THREE.Mesh(beamG,beamMat);beam.position.set(P.L/2+2.4,0.04,0);beam.renderOrder=2;g.add(beam);g.userData.beam=beam;}
  scene.add(g);return g;
}
const beamG=(()=>{const g=new THREE.PlaneGeometry(4.5,2.6);g.rotateX(-Math.PI/2);return g;})();
const beamMat=new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,128,0);gr.addColorStop(0,'rgba(255,250,215,0.9)');gr.addColorStop(1,'rgba(255,250,215,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,26);g.lineTo(128,0);g.lineTo(128,64);g.lineTo(0,38);g.fill();return new THREE.CanvasTexture(c);})(),
  transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
const brakeOn=new THREE.MeshBasicMaterial({color:'#ff2a2a'}), brakeOff=new THREE.MeshLambertMaterial({color:'#5a0a0a'}), headMat=new THREE.MeshBasicMaterial({color:'#fffbe6'});
const sirR=[new THREE.MeshBasicMaterial({color:'#ff2020'}),new THREE.MeshLambertMaterial({color:'#5a1010'})], sirB=[new THREE.MeshBasicMaterial({color:'#3060ff'}),new THREE.MeshLambertMaterial({color:'#101a50'})];
const wreckMat=new THREE.MeshLambertMaterial({color:'#2b2724'});
function syncCars(night){
  const seen=new Set();
  beamMat.opacity=0.55*night;
  for(const c of S.cars){
    let g=carMeshes.get(c);if(!g){g=makeCar(c);carMeshes.set(c,g);}
    seen.add(c);
    g.position.set(c.x*U,0,c.y*U);g.rotation.y=-c.a;
    const b=g.userData.body;
    if(c.wreck){if(b.material!==wreckMat)b.material=wreckMat;}
    else if(g.userData.col!==c.color||b.material===wreckMat){b.material=mat(c.color);g.userData.col=c.color;}
    if(g.userData.brake)g.userData.brake.material=c.brakeLight&&!c.wreck?brakeOn:brakeOff;
    if(g.userData.sirenR){const on=heatStars()>0&&(c.ai==='police'||c.ai==='block'),f=Math.floor(S.gameTime*8)%2;g.userData.sirenR.material=on&&f?sirR[0]:sirR[1];g.userData.sirenB.material=on&&!f?sirB[0]:sirB[1];}
    if(g.userData.beam)g.userData.beam.visible=night>0.05&&!!c.driver&&!c.wreck;
  }
  for(const [c,g] of carMeshes)if(!seen.has(c)){scene.remove(g);carMeshes.delete(c);}
}

// ---------- pessoas ----------
// Todo mundo desenhado de uma vez (instanciado): 5 chamadas pra GPU, não importa quantas pessoas.
const MAXP=320;
const legG=new THREE.BoxGeometry(0.1,0.36,0.1);legG.translate(0,-0.18,0);
const bodyG=new THREE.CylinderGeometry(0.17,0.15,0.5,7);
const headG=new THREE.SphereGeometry(0.13,8,6);
let PI_={};
const hexCache={};const hexCol=h=>hexCache[h]||(hexCache[h]=new THREE.Color(h));
function initPeople(){
  const mk=(geo,color,cast)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color}),MAXP);m.count=0;m.frustumCulled=false;m.castShadow=cast;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);return m;};
  PI_={l1:mk(legG,'#2b2f45',false),l2:mk(legG,'#2b2f45',false),body:mk(bodyG,'#ffffff',true),head:mk(headG,'#ffffff',false),hair:mk(headG,'#ffffff',false)};
  for(const k of ['body','head','hair'])PI_[k].setColorAt(0,hexCol('#fff'));
}
const _B=new THREE.Matrix4(),_L=new THREE.Matrix4(),_M=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_p=new THREE.Vector3(),_s=new THREE.Vector3();
const L_BODY=new THREE.Matrix4().makeTranslation(0,0.6,0), L_HEAD=new THREE.Matrix4().makeTranslation(0,0.98,0),
  L_HAIR=new THREE.Matrix4().compose(new THREE.Vector3(-0.02,1.04,0),new THREE.Quaternion(),new THREE.Vector3(1.05,0.6,1.05));
function putPerson(n,x,y,a,anim,moving,down,scale,shirt,skin,hair){
  _e.set(down?0:0,-a,down?Math.PI/2:0,'YXZ');_q.setFromEuler(_e);
  _B.compose(_p.set(x*U,down?0.15:0,y*U),_q,_s.set(scale,scale,scale));
  const sw=moving?Math.sin(anim*10)*0.6:0;
  _L.makeRotationZ(sw).setPosition(0,0.36,-0.08);PI_.l1.setMatrixAt(n,_M.multiplyMatrices(_B,_L));
  _L.makeRotationZ(-sw).setPosition(0,0.36,0.08);PI_.l2.setMatrixAt(n,_M.multiplyMatrices(_B,_L));
  PI_.body.setMatrixAt(n,_M.multiplyMatrices(_B,L_BODY));PI_.head.setMatrixAt(n,_M.multiplyMatrices(_B,L_HEAD));PI_.hair.setMatrixAt(n,_M.multiplyMatrices(_B,L_HAIR));
  PI_.body.setColorAt(n,hexCol(shirt||'#888'));PI_.head.setColorAt(n,hexCol(skin||'#c68642'));PI_.hair.setColorAt(n,hexCol(hair||'#222'));
}
function syncPeople(){
  let n=0;
  const vis=!player.car&&player.state==='play'&&!(player.inv>0&&Math.floor(S.gameTime*10)%2);
  if(vis){const mv=keys['KeyW']||keys['KeyS']||keys['KeyA']||keys['KeyD']||keys['ArrowUp']||keys['ArrowDown']||keys['ArrowLeft']||keys['ArrowRight'];
    putPerson(n++,player.x,player.y,player.a,player.anim/10,mv,false,1.15,'#ff7a1a','#c68642','#111');}
  // só quem está perto da câmera (o resto não aparece mesmo)
  const r2=(46*T)*(46*T);
  for(const p of S.peds){
    if(n>=MAXP)break;
    if(p.state==='dead'||p.state==='gone'||p.state==='dead2')continue;
    const dx=p.x-cam.x,dy=p.y-cam.y;if(dx*dx+dy*dy>r2)continue;
    putPerson(n++,p.x,p.y,p.a,p.anim,p.state!=='wait',p.state==='down',1,p.shirt,p.skin,p.hair);
  }
  for(const m of Object.values(PI_)){m.count=n;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
}

// ---------- partículas e tiros ----------
const dotTex=radialTex('255,255,255');
// partículas também instanciadas: um quadradinho virado pra câmera, com cor e transparência por partícula
const MAXFX=400;let FX={};
function fxMesh(add){
  const m=new THREE.MeshBasicMaterial({map:dotTex,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});
  m.onBeforeCompile=sh=>{sh.vertexShader='attribute float aAlpha;\nvarying float vAlpha;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvAlpha=aAlpha;');
    sh.fragmentShader='varying float vAlpha;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\ngl_FragColor.a*=vAlpha;');};
  const geo=new THREE.PlaneGeometry(1,1);const al=new THREE.InstancedBufferAttribute(new Float32Array(MAXFX),1);al.setUsage(THREE.DynamicDrawUsage);geo.setAttribute('aAlpha',al);
  const im=new THREE.InstancedMesh(geo,m,MAXFX);im.count=0;im.frustumCulled=false;im.renderOrder=3;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.setColorAt(0,new THREE.Color(1,1,1));scene.add(im);return im;
}
function initParticles(){FX={add:fxMesh(true),norm:fxMesh(false)};}
const colCache={};
function parseCol(str){if(colCache[str])return colCache[str];const m=str.match(/rgba?\((\d+),(\d+),(\d+)/);const c=m?new THREE.Color(m[1]/255,m[2]/255,m[3]/255):new THREE.Color(str&&str[0]==='#'?str:'#fff');colCache[str]=c;return c;}
function syncParticles(){
  const n={add:0,norm:0};
  for(const p of S.parts){
    const k=p.fire?'add':'norm', im=FX[k], i=n[k];
    if(i>=MAXFX)continue;n[k]++;
    const a=clamp(p.life/p.max,0,1);
    const hgt=p.smoke?0.6+(1-a)*2.5:0.5;const sz=p.size*U*(p.fire?(a+0.3)*2.2:2.2);
    _M.compose(_p.set(p.x*U,hgt,p.y*U),camera.quaternion,_s.set(sz,sz,1));im.setMatrixAt(i,_M);
    im.setColorAt(i,parseCol(p.col));im.geometry.attributes.aAlpha.array[i]=k==='add'?a:a*0.55;
  }
  for(const k of ['add','norm']){const im=FX[k];im.count=n[k];if(n[k]){im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.geometry.attributes.aAlpha.needsUpdate=true;}}
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

// ---------- sol e sombras ----------
// A caixa de sombra cobre a área vista (cresce quando a câmera afasta) e anda em passos de 1 pixel do mapa de sombra,
// senão as bordas das sombras ficam tremendo quando o carro anda.
let shadowBox=34;const _d=new THREE.Vector3(),_r=new THREE.Vector3(),_u=new THREE.Vector3(),_c=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
function setShadowBox(half){
  half=Math.ceil(half/6)*6;if(half===shadowBox)return;shadowBox=half;
  const sc=sun.shadow.camera;sc.left=-half;sc.right=half;sc.top=half;sc.bottom=-half;sc.updateProjectionMatrix();
}
function placeSun(cx,cz,dx,dy,dz){
  _d.set(dx,dy,dz).normalize();_r.crossVectors(UP,_d).normalize();_u.crossVectors(_d,_r);
  const texel=2*shadowBox/sun.shadow.mapSize.x;
  _c.set(cx,0,cz);const a=Math.round(_c.dot(_r)/texel)*texel,b=Math.round(_c.dot(_u)/texel)*texel,c=_c.dot(_d);
  _c.copy(_r).multiplyScalar(a).addScaledVector(_u,b).addScaledVector(_d,c);
  sun.target.position.copy(_c);sun.position.copy(_c).addScaledVector(_d,90);
  sun.target.updateMatrixWorld();
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
  placeSun(cx,cz,-sx,sy,sz);
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
    s.fieldLight.visible=lit;mats.fieldGlow.opacity=lit?(dk>0.2?0.55:0.15):0;
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
  for(const b of city.bulbs)b.colorsDirty();
}

// prepara (compila) os efeitos da placa de vídeo antes de precisar, pra não engasgar na 1ª sirene/freio/explosão
function warmUp(){
  try{const g=new THREE.Group();
    for(const m of [brakeOn,brakeOff,headMat,wreckMat,beamMat,mats.detail,...sirR,...sirB,mat('#888')]){const x=new THREE.Mesh(boxG,m);x.castShadow=true;g.add(x);}
    g.position.set(cam.x*U,0,cam.y*U);scene.add(g);renderer.compile(scene,camera);scene.remove(g);}catch(e){}
}
// dados pro painel de diagnóstico (F3)
let gpuName=null;
export function gfxInfo(){
  if(!renderer)return null;
  if(gpuName===null){try{const gl=renderer.getContext(),e=gl.getExtension('WEBGL_debug_renderer_info');gpuName=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);}catch(err){gpuName='?';}}
  const sz=new THREE.Vector2();renderer.getDrawingBufferSize(sz);
  return {gpu:gpuName,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,w:sz.x,h:sz.y,dpr:renderer.getPixelRatio(),shadows:renderer.shadowMap.enabled,quality,chunks:Object.keys(ground).length};
}
// ---------- quadro ----------
// Qualidade: 2 = alta, 1 = média, 0 = leve.
export const QNAMES=['leve','média','alta'];
let frameN=0,camZ=1,lastT=performance.now(),slow=0,quality=2,sizeKey='',autoOK=true;
export function getQuality(){return quality;}
export function applyQuality(q,manual){
  quality=q;if(manual)autoOK=false;if(!renderer)return;
  const dpr=window.devicePixelRatio||1;
  renderer.setPixelRatio(q===2?Math.min(2,dpr):q===1?Math.min(1,dpr):Math.min(0.75,dpr));
  const sh=q>0, ms=q===2?2048:1024;
  if(sun.shadow.mapSize.x!==ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
  if(renderer.shadowMap.enabled!==sh){renderer.shadowMap.enabled=sh;sun.castShadow=sh;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);});[brakeOn,brakeOff,headMat,wreckMat,beamMat,...sirR,...sirB].forEach(m=>m.needsUpdate=true);if(R.ok)warmUp();}
  sizeKey='';
}
// se o computador não aguentar (abaixo de ~35 quadros por segundo por uns 3 s), baixa a qualidade sozinho
function adapt(){
  const now=performance.now(),dt=now-lastT;lastT=now;
  if(!autoOK||!S.started||S.paused||dt>500)return;
  slow=dt>28?slow+1:Math.max(0,slow-2);
  if(slow>100&&quality>0){slow=0;applyQuality(quality-1);
    try{localStorage.setItem('aq_gfx','3d'+quality);}catch(e){}
    R.notice='Gráficos ajustados pra rodar mais leve: qualidade '+QNAMES[quality]+' (G troca).';}
}
export function render3D(signalState){
  frameN++;adapt();
  if(R.notice){S.messages.push({t:R.notice,life:4});R.notice=null;}
  // redimensionar o canvas apaga e recria os buffers da GPU: só faz quando a janela muda
  const sk=CW+'x'+CH+'@'+renderer.getPixelRatio();
  if(sk!==sizeKey){sizeKey=sk;renderer.setSize(CW,CH,false);camera.aspect=CW/CH;camera.updateProjectionMatrix();}
  // sombras: todo quadro na alta, quadro sim quadro não na média
  if(renderer.shadowMap.enabled&&(quality===2||frameN%2===0))renderer.shadowMap.needsUpdate=true;
  // câmera inclinada acima do jogador (afasta com a velocidade)
  const zn=cam.zoom/clamp(CH/820,0.7,1.6);camZ=lerp(camZ,zn,0.1);
  const dist=24/clamp(camZ,0.5,1.3);
  const tx=cam.x*U, tz=cam.y*U;
  const shx=(Math.random()-.5)*S.shake*0.05, shz=(Math.random()-.5)*S.shake*0.05;
  camera.position.set(tx+shx,dist*0.92,tz+dist*0.62+shz);camera.lookAt(tx,0,tz-1);
  const night=darkness();
  // área do chão que aparece na tela (a câmera olha inclinada: mais longe pra cima, perto embaixo)
  const hw=1.62*dist*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect+2;
  const vz0=tz-0.75*dist-2, vz1=tz+0.45*dist+2;
  setShadowBox(Math.max(hw,(vz1-vz0)/2)+2);
  updateSky(tx,(vz0+vz1)/2);
  updateSignals(signalState);
  const pc=player.car, ahead=pc?{x:(pc.vx||0)*U*1.2,z:(pc.vy||0)*U*1.2}:null;
  updateGround(tx-hw,tx+hw,vz0,vz1,ahead&&Math.hypot(ahead.x,ahead.z)>2?ahead:null);
  // camada de detalhes do chão: centrada um pouco à frente da câmera, presa numa grade
  const ocx=Math.round(tx/4)*4, ocz=Math.round((tz-6)/4)*4;
  if(frameN%2===0||!overlayMesh.userData.ok){overlayMesh.userData.ok=true;
    overlayMesh.position.set(ocx,0.025,ocz); // a placa só anda junto com o desenho novo (senão pisca)
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
