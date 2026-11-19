// IA da polícia: campo de fluxo (BFS) até o jogador
import { clamp, lerp, hyp } from '../core/utils.js';
import { T, W, H, ROAD, map, isSolidT, solidAt } from '../world/map.js';
import { heatStars } from '../game/world.js';
import { driveTo } from './traffic.js';
import { player } from '../core/state.js';

export const flow=new Int32Array(W*H); const fq=new Int32Array(W*H);
export function computeFlow(){
  flow.fill(-1);const px=clamp(player.x/T|0,0,W-1),py=clamp(player.y/T|0,0,H-1);
  let h=0,t=0;const s=py*W+px;flow[s]=0;fq[t++]=s;
  while(h<t){const i=fq[h++];const x=i%W,y=(i/W)|0,d=flow[i]+1;if(d>140)continue;
    if(x>0){const n=i-1;if(flow[n]<0&&!isSolidT(map[n])){flow[n]=d+(map[n]===ROAD?0:0);fq[t++]=n;}}
    if(x<W-1){const n=i+1;if(flow[n]<0&&!isSolidT(map[n])){flow[n]=d;fq[t++]=n;}}
    if(y>0){const n=i-W;if(flow[n]<0&&!isSolidT(map[n])){flow[n]=d;fq[t++]=n;}}
    if(y<H-1){const n=i+W;if(flow[n]<0&&!isSolidT(map[n])){flow[n]=d;fq[t++]=n;}}}
}
export function los(ax,ay,bx,by){const d=hyp(bx-ax,by-ay),n=Math.ceil(d/14);for(let i=1;i<n;i++){const t=i/n;if(solidAt(lerp(ax,bx,t),lerp(ay,by,t)))return false;}return true;}
export function updatePolice(c,dt){
  const tgt=player.car||player; const tx0=tgt.x, ty0=tgt.y;
  const d=hyp(tx0-c.x,ty0-c.y); let tx,ty;
  const stars=heatStars();
  if(d<280&&los(c.x,c.y,tx0,ty0)){const pv=player.car?{x:player.car.vx,y:player.car.vy}:{x:0,y:0};tx=tx0+pv.x*0.35;ty=ty0+pv.y*0.35;}
  else{
    let i=(clamp(c.y/T|0,0,H-1))*W+clamp(c.x/T|0,0,W-1);
    if(flow[i]<0){tx=tx0;ty=ty0;}
    else{for(let k=0;k<5;k++){const x=i%W;let bestI=i,bd=flow[i];
        for(const n of [i-1,i+1,i-W,i+W]){if(n<0||n>=W*H)continue;if(Math.abs((n%W)-x)>1)continue;const f=flow[n];if(f>=0&&f<bd){bd=f;bestI=n;}}
        if(bestI===i)break;i=bestI;}
      tx=(i%W+.5)*T;ty=(((i/W)|0)+.5)*T;}
  }
  let desired=200+stars*40;
  if(d<90&&player.car&&player.car.speed<60)desired=60;
  if(!player.car&&d<120)desired=Math.min(desired,d*1.2);
  driveTo(c,tx,ty,desired,dt,true);
}
