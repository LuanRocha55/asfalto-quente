// IA do trânsito: seguir faixas e virar nos cruzamentos
import { clamp, normA } from '../core/utils.js';
import { T, NI, O, PX, ROAD, roadPx, LANE_OFF, DX, DY, tileAt } from '../world/map.js';
import { sfxHorn } from '../audio/audio.js';
import { onScreen } from '../game/world.js';
import { signalized, signalState } from '../world/districts.js';
import { S, player } from '../core/state.js';

export function alongOf(c){return c.dir%2===0?c.x:c.y;}
export function sgn(d){return(d===0||d===1)?1:-1;}
export function planCar(c){
  const a=alongOf(c), s=sgn(c.dir), horiz=c.dir%2===0;
  const perpIdx=clamp(Math.round((c.lane-LANE_OFF[c.dir]-O*T)/PX),0,NI-1);
  const k0=Math.floor((a-O*T)/PX);
  for(let step=0;step<3;step++){
    const k=k0+step*s; if(k<0||k>=NI)continue;
    const ix=horiz?k:perpIdx, iy=horiz?perpIdx:k; const key=ix+iy*NI;
    if(key===c.lastInter)continue;
    const base=roadPx(k);
    const opts=[];
    for(const [nd,w] of [[c.dir,0.55],[(c.dir+1)%4,0.25],[(c.dir+3)%4,0.2]]){
      const nx=ix+DX[nd], ny=iy+DY[nd]; if(nx<0||ny<0||nx>=NI||ny>=NI)continue;
      const tp=nd===c.dir?base+64:base+LANE_OFF[nd];
      if((tp-a)*s<6)continue;
      opts.push({nd,w,tp});
    }
    if(!opts.length)continue;
    let tot=opts.reduce((q,o)=>q+o.w,0),r=Math.random()*tot,ch=opts[0];
    for(const o of opts){r-=o.w;if(r<=0){ch=o;break;}}
    c.plan={nd:ch.nd,tp:ch.tp,key};return;
  }
  c.plan=null;
}
export function recoverCar(c){
  let d=((Math.round(c.a/(Math.PI/2))%4)+4)%4; c.dir=d;
  const perp=d%2===0?c.y:c.x;
  const j=clamp(Math.round((perp-O*T-LANE_OFF[d])/PX),0,NI-1);
  c.lane=roadPx(j)+LANE_OFF[d];c.plan=null;c.lastInter=-1;
}
export function obstacleAhead(c,range){
  const fx=Math.cos(c.a),fy=Math.sin(c.a);let bst=Infinity;
  const check=(x,y,rad)=>{const rx=x-c.x,ry=y-c.y;const f=rx*fx+ry*fy;if(f<=0||f>range)return;const l=-rx*fy+ry*fx;if(Math.abs(l)<14+rad){const d=f-c.t.len/2-rad;if(d<bst)bst=d;}};
  for(const o of S.cars){if(o===c)continue;const dx=o.x-c.x,dy=o.y-c.y;if(dx*dx+dy*dy>(range+60)**2)continue;
    for(const ci of o.circles())check(ci[0],ci[1],ci[2]);}
  if(!player.car&&player.state==='play')check(player.x,player.y,8);
  for(const p of S.peds){const dx=p.x-c.x,dy=p.y-c.y;if(dx*dx+dy*dy<range*range&&tileAt(p.x,p.y)===ROAD)check(p.x,p.y,6);}
  return bst;
}
export function driveTo(c,tx,ty,desired,dt,hbAllowed){
  const da=normA(Math.atan2(ty-c.y,tx-c.x)-c.a);
  let steer=clamp(da*2.6,-1,1); const vF=c.fwdSpeed();
  let thr=clamp((desired-vF)/40,-1,1);
  let hb=false;
  if(hbAllowed&&Math.abs(da)>0.9&&vF>170)hb=true;
  if(Math.abs(da)>1.4&&vF>120)thr=-0.7;
  // ré se travado
  if(c.revT>0){c.revT-=dt;thr=-1;steer=-steer;hb=false;}
  else if(desired>30&&Math.abs(vF)<8){c.stuckT+=dt;if(c.stuckT>(c.ai==='police'?1.0:2.2)){c.revT=c.ai==='police'?0.8:1.1;c.stuckT=0;}}
  else c.stuckT=Math.max(0,c.stuckT-dt);
  c.physics(thr,steer,hb,dt);
  return {da};
}
export function updateTraffic(c,dt){
  if(!c.plan)planCar(c);
  const s=sgn(c.dir), horiz=c.dir%2===0; let desired=c.cruise;
  const perpPos=horiz?c.y:c.x;
  if(Math.abs(perpPos-c.lane)>90&&c.revT<=0)recoverCar(c);
  if(c.plan){
    const a=alongOf(c), dist=(c.plan.tp-a)*s;
    const turning=c.plan.nd!==c.dir;
    const lead=!turning?0:(c.plan.nd===(c.dir+1)%4?18:30);
    if(turning&&dist<130)desired=Math.min(desired,75);
    if(dist<=lead){c.lastInter=c.plan.key;if(turning){c.dir=c.plan.nd;c.lane=c.plan.tp;}c.plan=null;planCar(c);}
    else if(dist<-60){c.plan=null;planCar(c);}
  }
  const sp=Math.max(0,c.fwdSpeed());
  const obs=obstacleAhead(c,Math.max(40+sp*0.7,260));
  // próximo cruzamento: semáforo e "não trancar o cruzamento"
  if(c.plan){const key=c.plan.key, ix=key%NI, iy=Math.floor(key/NI);
    const base=roadPx(horiz?ix:iy), entry=s>0?base:base+128;
    const df=(entry-alongOf(c))*s-c.t.len/2;
    if(df>-4&&df<95){
      let stop=false;
      if(signalized(ix,iy)){const st=signalState(ix,iy,horiz?'h':'v');if(st==='r'||(st==='y'&&df>28))stop=true;}
      // fila do outro lado: só entra se couber depois do cruzamento
      if(obs<Infinity&&obs>df&&obs<df+128+c.t.len*0.8)stop=true;
      if(stop)desired=Math.min(desired,Math.max(0,(df-8)*2.2));
    }}
  // engarrafamento travado: fora da tela o carro some (outro nasce em outro lugar)
  if(c.blockT>12&&!onScreen(c.x,c.y,200))c.remove=true;
  if(obs<40+sp*0.7+60){desired=Math.min(desired,Math.max(0,(obs-12)*2.2));
    if(obs<40&&sp<10){c.blockT+=dt;if(c.blockT>1.4&&c.honkCd<=0&&onScreen(c.x,c.y)){sfxHorn();c.honkCd=4;}}}
  else c.blockT=0;
  c.honkCd-=dt;
  const L=48+sp*0.35; let tx,ty;
  const h2=c.dir%2===0;
  if(h2){tx=c.x+s*L;ty=c.lane;}else{tx=c.lane;ty=c.y+s*L;}
  if(desired<5&&c.revT<=0){c.physics(sp>3?-1:0,0,false,dt);return;}
  driveTo(c,tx,ty,desired,dt,false);
}
