// Ações do jogador: entrar/sair do carro, soco, morte e prisão
import { hyp } from '../core/utils.js';
import { solidAt } from '../world/map.js';
import { sfxNoise, sfxFail } from '../audio/audio.js';
import { Ped } from '../entities/peds.js';
import { addHeat, msg, big } from './world.js';
import { recoverCar } from '../ai/traffic.js';
import { killPed } from './effects.js';
import { failMission } from './missions.js';
import { S, player, cam } from '../core/state.js';

export function nearestCar(r){let bst=null,bd=r;for(const c of S.cars){if(c.wreck||c.burnT>0)continue;const d=hyp(c.x-player.x,c.y-player.y)-c.t.wid/2;if(d<bd){bd=d;bst=c;}}return bst;}
export function enterExit(){
  if(player.state!=='play')return;
  if(player.car){
    const c=player.car; if(c.speed>60){msg('Freia primeiro!');return;}
    const cs=Math.cos(c.a),sn=Math.sin(c.a);
    const tries=[[-1,0],[1,0],[0,-1],[0,1]];
    for(const [sd,fd] of tries){
      const ox=c.x+sn*(c.t.wid/2+12)*sd+cs*(c.t.len/2+12)*fd, oy=c.y-cs*(c.t.wid/2+12)*sd+sn*(c.t.len/2+12)*fd;
      if(!solidAt(ox,oy)){player.x=ox;player.y=oy;break;}
    }
    c.driver=null;c.ai=null;player.car=null;
    return;
  }
  const c=nearestCar(26); if(!c)return;
  if(c.driver==='ai'){
    const p=new Ped(c.x-Math.sin(c.a)*20,c.y+Math.cos(c.a)*20);p.state='flee';p.flee={x:player.x,y:player.y};p.t=5;S.peds.push(p);
    if(c.ai==='police'){addHeat(130);msg('Roubou uma viatura?! Tá doido!');}
    else{addHeat(c.mission?0:28);}
    sfxNoise(0.15,0.2,1500);
  }
  if(c.mission&&c.mission.onEnter)c.mission.onEnter(c);
  c.driver='player';c.ai=null;c.plan=null;player.car=c;
  msg('Pegou: '+c.t.name);
}
export function punch(){
  if(player.punchCd>0||player.car||player.state!=='play')return;player.punchCd=0.4;
  const fx=Math.cos(player.a),fy=Math.sin(player.a);sfxNoise(0.08,0.15,2000);
  for(const p of S.peds){if(p.state==='dead')continue;const dx=p.x-player.x,dy=p.y-player.y;const f=dx*fx+dy*fy;
    if(f>0&&f<24&&Math.abs(-dx*fy+dy*fx)<14){p.hits++;
      if(p.hits>=3)killPed(p,true);else{p.state='down';p.t=2.5;if(!p.robber)addHeat(18);}
      if(p.mission&&p.mission.onPedHit)p.mission.onPedHit(p);
      sfxNoise(0.12,0.35,700);break;}}
}
export function wasted(){if(player.state!=='play')return;player.state='wasted';player.stateT=3.2;
  if(player.car){player.car.driver=null;player.car=null;}
  player.ammo={};player.weapon='punho';
  big('VOCÊ SE LASCOU','-$300 de hospital e as armas','#ff5050',3.2);sfxFail();failMission('Missão falhou.');}
export function busted(){if(player.state!=='play')return;player.state='busted';player.stateT=3.2;
  if(player.car){player.car.driver=null;player.car.vx*=0.2;player.car.vy*=0.2;player.car=null;}
  player.ammo={};player.weapon='punho';
  big('EM CANA!','-$500 de fiança e as armas','#5aa0ff',3.2);sfxFail();failMission('Missão falhou.');}
export function respawn(where){
  player.armor=player.skills.socorros?50:0;
  player.x=where.x;player.y=where.y;player.health=100;player.heat=0;player.state='play';player.inv=2;player.bustT=0;
  for(const c of S.cars)if(c.ai==='police'){c.ai='traffic';recoverCar(c);}
  cam.x=player.x;cam.y=player.y;
}
