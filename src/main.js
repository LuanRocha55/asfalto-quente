// Ponto de entrada: loop principal com recuperação de erros
import { ctx, CW, CH, DPR } from './core/canvas.js';
import { normA } from './core/utils.js';
import { phones, hospitalSpot } from './world/map.js';
import { enterExit } from './game/player.js';
import { startMission, finishMission, failMission } from './game/missions.js';
import { update } from './game/update.js';
import { render } from './render/draw.js';
import { drawTitle } from './render/hud.js';
import { drawBigMap, drawMenu } from './render/overlays.js';
import { updateInterior } from './game/interior.js';
import { renderInterior } from './render/interiorDraw.js';
import { init3D, set3D, render3D, R } from './render3d/r3d.js';
import { signalState } from './world/districts.js';
import { msg } from './game/world.js';
import { S, player, cam, keys } from './core/state.js';
import { resetWorld } from './game/world.js';
import './core/input.js';

resetWorld();
// gráficos: 3D por padrão; G alterna com o clássico (fica salvo no navegador)
let pref='3d';try{pref=localStorage.getItem('aq_gfx')||'3d';}catch(e){}
init3D();set3D(pref==='3d');
window.addEventListener('keydown',e=>{if(e.code==='KeyG'&&S.started&&!S.menu){const on=!R.on;if(on&&!R.ok){msg('Este navegador não tem suporte a 3D (WebGL).',3);return;}
  set3D(on);try{localStorage.setItem('aq_gfx',on?'3d':'2d');}catch(err){}msg(on?'Gráficos: 3D':'Gráficos: clássico (2D)',2);}});
let last=performance.now();
// remove qualquer coisa que tenha virado NaN/Infinity e destrava o estado
function sanitize(hard){
  const ok=v=>typeof v==='number'&&isFinite(v);
  S.cars=S.cars.filter(c=>ok(c.x)&&ok(c.y)&&ok(c.vx)&&ok(c.vy)&&ok(c.a)&&c.t);
  for(const c of S.cars){if(Math.abs(c.a)>1000)c.a=normA(c.a);}
  S.peds=S.peds.filter(p=>ok(p.x)&&ok(p.y));
  S.parts=S.parts.filter(p=>ok(p.x)&&ok(p.y)&&ok(p.size));
  if(player.car&&S.cars.indexOf(player.car)<0){player.car=null;}
  if(!ok(player.x)||!ok(player.y)){player.x=hospitalSpot.x;player.y=hospitalSpot.y;}
  if(!ok(cam.x)||!ok(cam.y)||!ok(cam.zoom)){cam.x=player.x;cam.y=player.y;cam.zoom=1;}
  if(hard&&S.mission){try{failMission('Missão reiniciada por erro.');}catch(_){S.mission=null;}}
}
function frame(now){
  let dt=Math.min(0.05,(now-last)/1000);last=now;
  requestAnimationFrame(frame); // agenda antes: um erro nunca mais congela o jogo
  try{
    if(S.started&&!S.paused&&!S.menu&&!S.mapOpen){let rem=dt;while(rem>0){const s=Math.min(1/60,rem);if(S.interior)updateInterior(s);else update(s);rem-=s;}}

    else if(!S.started){S.gameTime+=dt;cam.x+=Math.cos(S.gameTime*0.1)*40*dt;cam.y+=Math.sin(S.gameTime*0.13)*40*dt;}
    sanitize();
    const use3D=R.on&&!S.interior;
    document.getElementById('gl').style.visibility=use3D?'visible':'hidden';
    if(S.interior)renderInterior();else if(use3D)render3D(signalState);else render();
    if(S.mapOpen&&!S.interior)drawBigMap();
    if(S.menu)drawMenu();
    if(!S.started||S.paused)drawTitle();
  }catch(e){
    S.errCount++;S.lastErr=(e&&e.message)||String(e);
    console.error(e);
    try{sanitize(true);}catch(_){}
  }
  if(S.lastErr){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,CH-20,CW,20);
    ctx.fillStyle='#ff8080';ctx.fillText('Erro recuperado ('+S.errCount+'x): '+S.lastErr.slice(0,120),8,CH-6);}
}
window.__game={S,player,cam,keys,update,render,enterExit,startMission,finishMission,phones};
requestAnimationFrame(frame);
