// Teclado e mouse
import { cv } from './canvas.js';
import { AU, initAudio, sfxHorn } from '../audio/audio.js';
import { msg } from '../game/world.js';
import { enterExit, punch, nearestCar } from '../game/player.js';
import { doorOf } from '../game/jobs.js';
import { S, keys, player, mouse } from './state.js';
import { cycleWeapon, selectWeapon } from '../game/weapons.js';
import { toggleJob } from '../game/jobs.js';
import { nearestDoor, openPlace, menuKey, menuMouse, closeMenu } from '../game/interiors.js';
import { enterInterior, interactInterior } from '../game/interior.js';
import { skipTutorial } from '../game/tutorial.js';
import { titleKey, titleMouse, startGame } from '../game/titlemenu.js';
import { mapClick } from '../render/overlays.js';

// F / Enter / clique direito: porta do prédio tem prioridade sobre carro quando está mais perto
function interact(){
  if(S.interior){interactInterior();return;}
  if(!player.car&&player.state==='play'){
    const b=nearestDoor(40);
    if(b){ // porta só ganha se estiver mais perto que o carro
      const d=doorOf(b), c=nearestCar(26);
      const dd=Math.hypot(d.x-player.x,d.y-player.y), dc=c?Math.hypot(c.x-player.x,c.y-player.y)-c.t.wid/2:1e9;
      if(dd<=dc){if(b.kind==='estadio')openPlace(b);else enterInterior(b);return;}
    }
  }
  enterExit();
}
const toggleMap=()=>{S.mapOpen=!S.mapOpen;if(S.mapOpen)S.mapOpenedOnce=true;};

window.addEventListener('keydown',e=>{
  if(['Space','KeyX','ControlLeft','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab','Backspace'].includes(e.code))e.preventDefault();
  if(e.repeat){keys[e.code]=true;return;}
  keys[e.code]=true;
  if(!S.started){titleKey(e.code);return;}
  if(S.menu){menuKey(e.code);return;}
  if(S.mapOpen){if(e.code==='KeyM'||e.code==='Tab'||e.code==='Escape')S.mapOpen=false;return;}
  if(S.paused){titleKey(e.code);return;}
  if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();S.paused=true;return;}
  if(e.code==='KeyT')skipTutorial();
  if(S.interior){if(e.code==='KeyF'||e.code==='Enter'||e.code==='KeyE')interactInterior();return;}
  if(e.code==='KeyM'||e.code==='Tab'){toggleMap();return;}
  if(e.code==='KeyF'||e.code==='Enter')interact();
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
cv.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true;if(S.menu)menuMouse(e.clientX,e.clientY,false);else if(!S.started||S.paused)titleMouse(e.clientX,e.clientY,false);});
cv.addEventListener('pointerdown',e=>{
  mouse.x=e.clientX;mouse.y=e.clientY;
  if(!S.started){titleMouse(e.clientX,e.clientY,true);return;}
  if(S.menu){if(e.button===0)menuMouse(e.clientX,e.clientY,true);else closeMenu();return;}
  if(S.mapOpen){mapClick(e.clientX,e.clientY,e.button);return;}
  if(S.paused){titleMouse(e.clientX,e.clientY,true);return;}
  mouse.active=true;
  if(S.interior){if(e.button===2)interactInterior();return;}
  if(e.button===0){mouse.down=true;if(!player.car&&player.weapon==='punho')punch();}
  else if(e.button===2)interact();
});
window.addEventListener('pointerup',e=>{if(e.button===0)mouse.down=false;});
cv.addEventListener('wheel',e=>{e.preventDefault();if(S.started&&!S.paused&&!S.menu&&!S.mapOpen)cycleWeapon(e.deltaY>0?1:-1);},{passive:false});
