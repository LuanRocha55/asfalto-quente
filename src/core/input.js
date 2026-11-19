// Teclado e mouse
import { cv } from './canvas.js';
import { AU, initAudio, sfxHorn } from '../audio/audio.js';
import { msg } from '../game/world.js';
import { enterExit, punch } from '../game/player.js';
import { S, keys, player, mouse } from './state.js';
import { cycleWeapon, selectWeapon } from '../game/weapons.js';
import { toggleJob } from '../game/jobs.js';

window.addEventListener('keydown',e=>{
  if(['Space','KeyX','ControlLeft','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
  if(e.repeat){keys[e.code]=true;return;}
  keys[e.code]=true;
  if(!S.started){if(e.code==='Enter'||e.code==='Space'){S.started=true;initAudio();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();}return;}
  if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();S.paused=!S.paused;return;}
  if(S.paused){if(e.code==='Enter'||e.code==='Space')S.paused=false;return;}
  if(e.code==='KeyF'||e.code==='Enter')enterExit();
  if(e.code==='Space'&&!player.car&&player.weapon==='punho')punch();
  if(e.code==='KeyQ')cycleWeapon(-1);
  if(e.code==='KeyE')cycleWeapon(1);
  const num={Digit1:'punho',Digit2:'pistola',Digit3:'escopeta',Digit4:'smg'}[e.code];
  if(num)selectWeapon(num);
  if(e.code==='KeyH')sfxHorn();
  if(e.code==='KeyJ')toggleJob();
  if(e.code==='KeyN'){AU.muted=!AU.muted;msg(AU.muted?'Som desligado':'Som ligado',1.5);}
});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true;});
cv.addEventListener('pointerdown',e=>{
  mouse.x=e.clientX;mouse.y=e.clientY;
  if(!S.started){S.started=true;initAudio();return;}   // primeiro clique só começa o jogo
  if(S.paused){S.paused=false;return;}
  mouse.active=true;
  if(e.button===0){mouse.down=true;if(!player.car&&player.weapon==='punho')punch();}
  else if(e.button===2)enterExit();
});
window.addEventListener('pointerup',e=>{if(e.button===0)mouse.down=false;});
cv.addEventListener('wheel',e=>{e.preventDefault();if(S.started&&!S.paused)cycleWeapon(e.deltaY>0?1:-1);},{passive:false});
