// Procurado, mensagens, câmera auxiliar e spawn de carros/pedestres
import { CW, CH } from '../core/canvas.js';
import { rand, randi, pick, clamp, hyp } from '../core/utils.js';
import { T, NI, PX, SAND, SIDE, GRASS, roadPx, LANE_OFF, DX, DY, hospitalSpot, tileAt } from '../world/map.js';
import { CT, TRAFFIC_MIX, Car } from '../entities/vehicles.js';
import { Ped } from '../entities/peds.js';
import { S, player, cam } from '../core/state.js';

export function heatStars(){return clamp(Math.floor((player.heat+50)/100),0,5);}
export function addHeat(v){const before=heatStars();player.heat=clamp(player.heat+v,0,560);if(heatStars()>before&&before===0)msg('A polícia tá de olho em tu!');}
export function msg(t,dur){S.messages.push({t,life:dur||3.5});if(S.messages.length>4)S.messages.shift();}
export function big(t,sub,col,dur){S.bigMsg={t,sub,col:col||'#ffd84a',life:dur||3,max:dur||3};}
export function onScreen(x,y,m){m=m||80;const hw=CW/2/cam.zoom+m, hh=CH/2/cam.zoom+m;return Math.abs(x-cam.x)<hw&&Math.abs(y-cam.y)<hh;}
export function viewR(){return hyp(CW,CH)/2/cam.zoom+70;}

export function resetWorld(){
  S.cars=[];S.peds=[];S.parts=[];S.skids=[];S.decals=[];
  player.x=hospitalSpot.x;player.y=hospitalSpot.y;player.car=null;player.health=100;player.heat=0;player.state='play';
  const c=new Car('jegue',hospitalSpot.x+60,hospitalSpot.y+T*0.2,0,'#d35400');S.cars.push(c); // carro na calçada
  cam.x=player.x;cam.y=player.y;
  for(let i=0;i<40;i++)spawnTraffic(150,1600,true);
  for(let i=0;i<55;i++)spawnPed(60,1100,true);
}

export function spawnTraffic(rmin,rmax,ignoreView,type,ai){
  for(let tries=0;tries<14;tries++){
    const horiz=Math.random()<.5; const j=randi(0,NI-1), k=randi(0,NI-2);
    let dir=horiz?(Math.random()<.5?0:2):(Math.random()<.5?1:3);
    const along=roadPx(k)+128+20+Math.random()*(PX-128-40);
    let x,y,lane;
    if(horiz){lane=roadPx(j)+LANE_OFF[dir];x=along;y=lane;}else{lane=roadPx(j)+LANE_OFF[dir];x=lane;y=along;}
    const d=hyp(x-player.x,y-player.y); if(d<rmin||d>rmax)continue;
    if(!ignoreView&&d<viewR())continue;
    const ty=type||pick(TRAFFIC_MIX);
    if(ty==='busao'&&S.cars.filter(c=>c.type==='busao').length>4)continue;
    let ok=true;for(const c of S.cars)if(hyp(c.x-x,c.y-y)<(c.t.len+CT[ty].len)/2+20){ok=false;break;}
    if(!ok)continue;
    const c=new Car(ty,x,y,dir*Math.PI/2);c.dir=dir;c.lane=lane;c.driver='ai';c.ai=ai||'traffic';
    const sp=Math.min(c.cruise,120);c.vx=DX[dir]*sp;c.vy=DY[dir]*sp;
    if(ty==='busao')c.cruise=rand(90,115);
    S.cars.push(c);return c;
  }
  return null;
}
export function spawnPed(rmin,rmax,ignoreView){
  for(let tries=0;tries<12;tries++){
    const ang=Math.random()*Math.PI*2, d=rand(rmin,rmax);
    const x=player.x+Math.cos(ang)*d, y=player.y+Math.sin(ang)*d;
    const t=tileAt(x,y); if(t!==SIDE&&!(t===SAND&&Math.random()<.6)&&!(t===GRASS&&Math.random()<.3))continue;
    if(!ignoreView&&onScreen(x,y,40))continue;
    const p=new Ped(x,y);S.peds.push(p);return p;
  }
}
