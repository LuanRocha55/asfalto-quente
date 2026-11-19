// Canvas principal e tamanho da tela


export const cv = document.getElementById('c');
export const ctx = cv.getContext('2d');
export let CW = 0, CH = 0, DPR = 1;
export function resize(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  CW = window.innerWidth; CH = window.innerHeight;
  cv.width = CW*DPR; cv.height = CH*DPR;
}
window.addEventListener('resize', resize); resize();
