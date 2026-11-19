// Som sintetizado com Web Audio (motor, sirene, efeitos)
import { ctx } from '../core/canvas.js';

export const AU={ctx:null,muted:false};
export function initAudio(){
  if(AU.ctx)return; try{
  const a=new (window.AudioContext||window.webkitAudioContext)(); AU.ctx=a;
  AU.master=a.createGain();AU.master.gain.value=0.5;AU.master.connect(a.destination);
  AU.eng=a.createOscillator();AU.eng.type='sawtooth';AU.engF=a.createBiquadFilter();AU.engF.type='lowpass';AU.engF.frequency.value=400;
  AU.engG=a.createGain();AU.engG.gain.value=0;AU.eng.connect(AU.engF);AU.engF.connect(AU.engG);AU.engG.connect(AU.master);AU.eng.start();
  AU.sir=a.createOscillator();AU.sir.type='square';AU.sirG=a.createGain();AU.sirG.gain.value=0;
  const sf=a.createBiquadFilter();sf.type='lowpass';sf.frequency.value=1800;AU.sir.connect(sf);sf.connect(AU.sirG);AU.sirG.connect(AU.master);AU.sir.start();
  const len=a.sampleRate*1.5;AU.noise=a.createBuffer(1,len,a.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  }catch(e){AU.ctx=null;}
}
export function sfxNoise(dur,vol,freq){if(!AU.ctx||AU.muted)return;const a=AU.ctx;const s=a.createBufferSource();s.buffer=AU.noise;
  const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;const g=a.createGain();
  g.gain.setValueAtTime(vol,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
  s.connect(f);f.connect(g);g.connect(AU.master);s.start();s.stop(a.currentTime+dur);}
export function sfxTone(freq,dur,vol,type,delay){if(!AU.ctx||AU.muted)return;const a=AU.ctx;const t0=a.currentTime+(delay||0);const o=a.createOscillator();o.type=type||'square';o.frequency.value=freq;
  const g=a.createGain();g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(vol,t0+0.01);g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
  o.connect(g);g.connect(AU.master);o.start(t0);o.stop(t0+dur+0.05);}
export function sfxWin(){[523,659,784,1046].forEach((f,i)=>sfxTone(f,0.25,0.12,'square',i*0.11));}
export function sfxFail(){[392,330,262].forEach((f,i)=>sfxTone(f,0.35,0.12,'triangle',i*0.15));}
export function sfxHorn(){sfxTone(420,0.25,0.08,'square');sfxTone(530,0.25,0.06,'square');}
