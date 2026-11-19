// Estado mutável do jogo, compartilhado entre os módulos
export const S={
  cars:[], peds:[], parts:[], skids:[], decals:[],
  messages:[], bigMsg:null,
  shake:0, gameTime:0, started:false, paused:false,
  flowT:0, spawnT:0, zoneCd:0,
  mission:null, missionIdx:0, phoneCd:0,
  best:0, NEXT_ID:1, errCount:0, lastErr:'',
  tod:16.5, tracers:[], shopCd:0,
};
try{S.best=+localStorage.getItem('aq_best')||0;}catch(e){}
export const player={x:0,y:0,a:0,health:100,car:null,money:0,heat:0,anim:0,punchCd:0,state:'play',stateT:0,bustT:0,inv:0,
  weapon:'pistola', ammo:{pistola:12}, fireCd:0, triggerLatch:false};
export const cam={x:0,y:0,zoom:1};
export const keys={};
