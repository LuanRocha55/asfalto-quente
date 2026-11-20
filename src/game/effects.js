// Efeitos: marcas de pneu, explosões, atropelamentos, dano ao jogador
import { rand, pick, hyp } from '../core/utils.js';
import { sfxNoise } from '../audio/audio.js';
import { addHeat, onScreen } from './world.js';
import { wasted } from './player.js';
import { S, player } from '../core/state.js';

export function addSkid(c,sand){const cs=Math.cos(c.a),sn=Math.sin(c.a),b=-c.t.len*0.35,w=c.t.wid*0.4;
  for(const sd of[-1,1]){const x=c.x+cs*b-sn*w*sd,y=c.y+sn*b+cs*w*sd;
    const key='s'+c.id+sd;const last=c[key];
    if(last&&hyp(last.x-x,last.y-y)<30)S.skids.push({x1:last.x,y1:last.y,x2:x,y2:y,life:12,sand});
    c[key]={x,y,t:S.gameTime};}
  if(S.skids.length>700)S.skids.splice(0,S.skids.length-700);
  if(Math.random()<0.3)S.parts.push({x:c.x-cs*c.t.len/2,y:c.y-sn*c.t.len/2,vx:rand(-20,20),vy:rand(-20,20),life:0.6,max:0.6,size:rand(5,9),col:sand?'rgba(220,200,140,':'rgba(200,200,200,',smoke:true});
}
export function explode(x,y,src){
  S.shake=Math.max(S.shake,onScreen(x,y)?16:0);
  if(onScreen(x,y,300))sfxNoise(1.2,0.7,500);
  for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,s=rand(30,260);S.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(0.4,1),max:1,size:rand(6,16),col:pick(['rgba(255,200,60,','rgba(255,120,30,','rgba(255,60,20,']),fire:true});}
  for(let i=0;i<25;i++){const a=Math.random()*Math.PI*2,s=rand(10,80);S.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(1.5,3),max:3,size:rand(12,26),col:'rgba(40,40,40,',smoke:true,up:true});}
  S.decals.push({x,y,r:40,type:'scorch',life:40});
  for(const c of S.cars){if(c.wreck)continue;const d=hyp(c.x-x,c.y-y);if(d<100&&d>1){const f=(100-d)/100;c.vx+=(c.x-x)/d*300*f;c.vy+=(c.y-y)/d*300*f;c.damage(70*f,src);}}
  for(const p of S.peds){const d=hyp(p.x-x,p.y-y);if(d<80)killPed(p,src==='player');}
  if(!player.car&&player.state==='play'){const d=hyp(player.x-x,player.y-y);if(d<90)hurtPlayer(60*(90-d)/90);}
}
export function killPed(p,byPlayer){if(p.state==='dead')return;p.state='dead';S.decals.push({x:p.x,y:p.y,r:9,type:'splat',life:25});
  if(byPlayer&&p.cop)addHeat(120);else if(byPlayer&&!p.robber)addHeat(55); if(p.mission&&p.mission.onPedDead)p.mission.onPedDead(p);}
export function hurtPlayer(v){if(player.inv>0||player.state!=='play')return;
  if(player.armor>0){const a=Math.min(player.armor,v*0.75);player.armor-=a;v-=a;}
  player.health-=v;S.shake=Math.max(S.shake,6);if(player.health<=0){player.health=0;wasted();}}
