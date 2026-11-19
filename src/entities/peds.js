// Pedestres
import { rand, randi, pick } from '../core/utils.js';
import { SAND, SIDE, GRASS, PARK, tileAt } from '../world/map.js';
import { S } from '../core/state.js';

export const SHIRTS=['#e74c3c','#3498db','#f1c40f','#9b59b6','#1abc9c','#ecf0f1','#e67e22','#2ecc71','#ff6b9a','#34495e'];
export const SKINS=['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac','#a0662f'];
export class Ped{
  constructor(x,y){this.id=S.NEXT_ID++;this.x=x;this.y=y;this.dir=randi(0,3);this.a=0;this.spd=rand(28,45);this.shirt=pick(SHIRTS);this.skin=pick(SKINS);
    this.hair=pick(['#222','#3b2314','#6b4423','#111','#c9a15b','#777']);this.state='walk';this.t=0;this.anim=Math.random()*10;this.flee=null;this.mission=null;this.hits=0;}
}
export function pedWalkable(x,y){const t=tileAt(x,y);return t===SIDE||t===GRASS||t===PARK||t===SAND;}
