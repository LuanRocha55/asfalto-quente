// Funções utilitárias (aleatório, matemática, cores)


export function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
export let rng = mulberry(1337);
export const rand = (a,b)=>a+Math.random()*(b-a);
export const randi = (a,b)=>Math.floor(rand(a,b+1));
export const pick = arr=>arr[Math.floor(Math.random()*arr.length)];
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const lerp=(a,b,t)=>a+(b-a)*t;
export function normA(a){if(!isFinite(a))return 0;a=(a+Math.PI)%(2*Math.PI);if(a<0)a+=2*Math.PI;return a-Math.PI;}
export const hyp=Math.hypot;
export function fmtMoney(v){return '$ '+Math.floor(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
export function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=clamp(Math.round(r*f),0,255);g=clamp(Math.round(g*f),0,255);b=clamp(Math.round(b*f),0,255);
  return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
