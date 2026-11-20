// Identidade visual "97": fontes, cores e peças de interface desenhadas em canvas
// (visor LCD de 7 segmentos, blocos de vida, estrela em pixel, moldura chanfrada, bip, letra de impacto).

// Fontes (vendor/fonts, licença OFL). VT323 é bem menor que o Courier no mesmo tamanho, por isso o fator.
export const PXFONT='"VT323","Courier New",monospace';
export const LOGOFONT='"Anton",Impact,"Arial Narrow",sans-serif';
export const pf=size=>Math.round(size*1.38)+'px '+PXFONT;
export const lf=size=>Math.round(size)+'px '+LOGOFONT;
export function loadFonts(){
  if(!document.fonts||!document.fonts.load)return Promise.resolve();
  const t=new Promise(r=>setTimeout(r,2500));
  return Promise.race([Promise.all([document.fonts.load('20px "VT323"'),document.fonts.load('20px "Anton"')]).catch(()=>{}),t]);
}

export const C97={
  breu:'#0b0b0d', chapa:'#202026', chapaClara:'#5b5b66', chapaEscura:'#050506',
  cal:'#ece8df', cinza:'#a3a09a', sodio:'#ffae2b', orelhao:'#ffd21f',
  lcd:'#a6ff5c', lcdOff:'rgba(166,255,92,0.09)', lcdFundo:'#0e170b',
  sirene:'#ff3b30', giroflex:'#3d6bff', grana:'#7dff6b', perigo:'#ff5040',
  papel:'#eee2c3', tinta:'#2a2216', carimbo:'#c7261b',
};

// texto em pixel com sombra dura
export function ptxt(g,t,x,y,size,col,align,shadow){
  g.font=pf(size);g.textAlign=align||'left';
  if(shadow!==false){g.fillStyle='rgba(0,0,0,0.85)';const o=Math.max(1,Math.round(size/9));g.fillText(t,x+o,y+o);}
  g.fillStyle=col;g.fillText(t,x,y);
}
// moldura chanfrada (botão de Windows 95): claro em cima/esquerda, escuro embaixo/direita
export function bevel(g,x,y,w,h,fill,raised,b){
  b=b||2;
  g.fillStyle='#000';g.fillRect(x-1,y-1,w+2,h+2);
  g.fillStyle=raised===false?C97.chapaEscura:C97.chapaClara;g.fillRect(x,y,w,b);g.fillRect(x,y,b,h);
  g.fillStyle=raised===false?C97.chapaClara:C97.chapaEscura;g.fillRect(x,y+h-b,w,b);g.fillRect(x+w-b,y,b,h);
  if(fill){g.fillStyle=fill;g.fillRect(x+b,y+b,w-b*2,h-b*2);}
}
// visor de 7 segmentos. Devolve a largura. Traços apagados aparecem bem fraquinhos atrás.
const SEG={'0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','4':'bcfg','5':'acdfg','6':'acdefg','7':'abc','8':'abcdefg','9':'abcdfg','-':'g',' ':''};
export function lcdWidth(text,H){const dw=H*0.55,gap=H*0.17;let w=0;for(const ch of text)w+=ch==='.'||ch===':'?H*0.24:ch==='$'?H*0.5+gap:dw+gap;return w-gap;}
export function lcd7(g,text,x,y,H,on,off){
  on=on||C97.lcd;off=off===undefined?C97.lcdOff:off;
  const dw=H*0.55,gap=H*0.17,th=Math.max(2,H*0.13);
  const seg=(s,L,col)=>{const R=L+dw,M=y+H/2,B=y+H;g.fillStyle=col;
    const hz=yy=>g.fillRect(L+th*0.55,yy-th/2,dw-th*1.1,th), vt=(xx,y0,y1)=>g.fillRect(xx-th/2,y0+th*0.55,th,y1-y0-th*1.1);
    if(s==='a')hz(y+th/2);else if(s==='g')hz(M);else if(s==='d')hz(B-th/2);
    else if(s==='f')vt(L+th/2,y,M);else if(s==='b')vt(R-th/2,y,M);else if(s==='e')vt(L+th/2,M,B);else if(s==='c')vt(R-th/2,M,B);};
  let cx=x;
  for(const ch of text){
    if(ch==='.'){g.fillStyle=on;g.fillRect(cx+H*0.05,y+H-th,th,th);cx+=H*0.24;continue;}
    if(ch===':'){g.fillStyle=on;g.fillRect(cx+H*0.05,y+H*0.28,th,th);g.fillRect(cx+H*0.05,y+H*0.66,th,th);cx+=H*0.24;continue;}
    if(ch==='$'){g.font=Math.round(H*1.05)+'px '+PXFONT;g.textAlign='left';g.fillStyle=on;g.fillText('$',cx-H*0.04,y+H*0.86);cx+=H*0.5+gap;continue;}
    if(off)for(const s of 'abcdefg')seg(s,cx,off);
    for(const s of (SEG[ch]||''))seg(s,cx,on);
    cx+=dw+gap;}
  return cx-gap-x;
}
// painel LCD com moldura afundada
export function lcdPanel(g,text,rx,y,H,on,align){
  const pad=Math.round(H*0.28),w=lcdWidth(text,H)+pad*2,h=H+pad*2,x=align==='right'?rx-w:rx;
  bevel(g,x,y,w,h,C97.lcdFundo,false,2);
  lcd7(g,text,x+pad,y+pad,H,on);
  return {x,y,w,h};
}
// estrela em pixel 10x10 (1 = contorno, 2 = miolo)
const STAR=['....1.....','...121....','...121....','1111211111','.12222221.','..122221..','..121121..','.121..121.','.11....11.'];
export function pixelStar(g,x,y,px,state){ // state: 0 apagada, 1 acesa, 2 piscando branca
  const fill=state===2?'#ffffff':state===1?C97.orelhao:'#34343a';
  for(let r=0;r<STAR.length;r++)for(let c=0;c<10;c++){const v=STAR[r][c];if(v==='.')continue;
    g.fillStyle=v==='1'?'#000':fill;g.fillRect(Math.round(x+c*px),Math.round(y+r*px),Math.ceil(px),Math.ceil(px));}
}
// barra em blocos (vida/colete/lataria)
export function blocks(g,x,y,n,frac,bw,bh,colOn,colHi,colLo,colOff,blink){
  const gap=Math.max(2,Math.round(bw*0.18)),w=n*bw+(n-1)*gap+6,h=bh+6;
  g.fillStyle='rgba(0,0,0,0.72)';g.fillRect(x,y,w,h);g.fillStyle='rgba(255,255,255,0.10)';g.fillRect(x,y,w,1);g.fillRect(x,y,1,h);
  const lit=Math.ceil(frac*n-0.001);
  for(let i=0;i<n;i++){const bx=x+3+i*(bw+gap),on=i<lit&&!(blink&&i<lit);
    if(on){g.fillStyle=colOn;g.fillRect(bx,y+3,bw,bh);g.fillStyle=colHi;g.fillRect(bx,y+3,bw,Math.max(1,bh*0.22));g.fillStyle=colLo;g.fillRect(bx,y+3+bh*0.72,bw,bh*0.28);}
    else{g.fillStyle=colOff;g.fillRect(bx,y+3,bw,bh);}}
  return w;
}
// letra de impacto: condensada, inclinada, contorno preto e sombra dura
export function impact(g,t,x,y,size,col,align,grad){
  g.save();g.font=lf(size);g.textAlign=align||'center';g.textBaseline='alphabetic';
  g.translate(x,y);g.transform(1,0,-0.12,1,0,0);
  const sh=Math.max(2,size*0.08);
  g.lineJoin='round';g.lineWidth=Math.max(3,size*0.16);g.strokeStyle='#000';
  g.fillStyle='#000';g.strokeText(t,sh,sh);g.fillText(t,sh,sh);
  g.strokeText(t,0,0);
  if(grad){const gr=g.createLinearGradient(0,-size*0.8,0,size*0.05);grad.forEach((c,i)=>gr.addColorStop(i/(grad.length-1),c));g.fillStyle=gr;}else g.fillStyle=col;
  g.fillText(t,0,0);g.restore();
}
export const HEAT_GRAD=['#fff7c2','#ffd21f','#ff9a1f','#e03a17','#8e1508'];
// quebra texto em linhas pela largura
export function wrap(g,text,maxW){const out=[];let line='';for(const w of String(text).split(' ')){const t=line?line+' '+w:w;if(g.measureText(t).width>maxW&&line){out.push(line);line=w;}else line=t;}if(line)out.push(line);return out;}
// o bip (pager): carcaça cinza, visor verde. lines = texto principal; head = [esquerda, direita]
export function pager(g,x,y,w,brand,badge,head,text,opts){
  opts=opts||{};const fs=opts.fs||15,hs=Math.round(fs*0.72);
  g.font=pf(fs);const lines=wrap(g,text,w-30).slice(0,opts.maxLines||3);
  const lh=Math.round(fs*1.1),visH=(head?hs*1.3:0)+lines.length*lh+10,h=visH+30;
  const r=10;
  // carcaça
  g.fillStyle='rgba(0,0,0,0.6)';rr(g,x+4,y+4,w,h,r);g.fill();
  const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#41434b');gr.addColorStop(1,'#22232a');g.fillStyle=gr;rr(g,x,y,w,h,r);g.fill();
  g.strokeStyle='#000';g.lineWidth=2;rr(g,x,y,w,h,r);g.stroke();
  g.strokeStyle='rgba(255,255,255,0.18)';g.lineWidth=1;rr(g,x+2,y+2,w-4,h-4,r-2);g.stroke();
  ptxt(g,brand,x+12,y+15,hs*0.95,'#c9cbd2','left',false);
  if(badge){const on=opts.blink?Math.floor(performance.now()/400)%2===0:true;g.font=pf(hs*0.95);const bw=g.measureText(badge).width;
    ptxt(g,badge,x+w-12,y+15,hs*0.95,'#c9cbd2','right',false);if(on){g.fillStyle=C97.sirene;g.beginPath();g.arc(x+w-18-bw,y+11,3,0,Math.PI*2);g.fill();}}
  // visor
  const vx=x+9,vy=y+21,vw=w-18;
  const vg=g.createLinearGradient(0,vy,0,vy+visH);vg.addColorStop(0,opts.dim?'#6f8a3a':'#acdc56');vg.addColorStop(1,opts.dim?'#5b7330':'#8cbf3e');
  g.fillStyle='#16210c';g.fillRect(vx-1,vy-1,vw+2,visH+2);g.fillStyle=vg;g.fillRect(vx,vy,vw,visH);
  let ty=vy+4;
  if(head){ty+=hs;ptxt(g,head[0]||'',vx+6,ty,hs,'rgba(20,33,10,0.8)','left',false);ptxt(g,head[1]||'',vx+vw-6,ty,hs,'rgba(20,33,10,0.8)','right',false);ty+=hs*0.3;}
  for(const l of lines){ty+=lh;ptxt(g,l,vx+6,ty-3,fs,'#14210a','left',false);}
  return {x,y,w,h};
}
export function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
// linhas de TV por cima (bem fracas)
let scanPat=null;
export function scanlines(g,w,h,a){
  if(!scanPat){const c=document.createElement('canvas');c.width=1;c.height=3;const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,1)';x.fillRect(0,0,1,1);scanPat=g.createPattern(c,'repeat');}
  g.save();g.globalAlpha=a;g.fillStyle=scanPat;g.fillRect(0,0,w,h);g.restore();
}
// pistola, escopeta, submetralhadora e punho em pixel (16x11)
const GUNS={
  pistola:['................','.11111111111111.','.12222222222221.','.11111222111111.','......1221......','.....12221......','.....1221.......','....12221.......','....1221........','....1111........','................'],
  escopeta:['................','................','111111111111111.','122222222222221.','111111122211111.','.........1221111','........12221221','.......12221.111','......12221.....','......1111......','................'],
  smg:['................','..1111111111111.','.112222222222221','.122111222111111','.11..12221.1....','.....1222111....','....122221......','....1221.1......','...12221.1......','...1111..1......','................'],
  punho:['................','....1111111.....','...122212221....','..12221222121...','..122222222221..','..122222222221..','..12222222221...','...122222221....','....1222221.....','.....11111......','................'],
};
export function gunIcon(g,kind,x,y,px){
  const P=GUNS[kind]||GUNS.pistola;
  for(let r=0;r<P.length;r++)for(let c=0;c<16;c++){const v=P[r][c];if(v==='.')continue;g.fillStyle=v==='1'?'#0d0d0f':(kind==='punho'?'#d9a066':'#b8bcc6');g.fillRect(Math.round(x+c*px),Math.round(y+r*px),Math.ceil(px),Math.ceil(px));}
}
