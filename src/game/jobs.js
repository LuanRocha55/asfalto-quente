// Empregos: taxista, motoboy, motorista de busão, guincho e vigilante noturno
import { rand, pick, clamp, hyp, fmtMoney } from '../core/utils.js';
import { T, VL, HL, NV, NH, segH, segV, laneCoords, buildings, special, zones, solidAt, tileAt, SIDE, GRASS, PARK, SAND } from '../world/map.js';
import { Car } from '../entities/vehicles.js';
import { Ped } from '../entities/peds.js';
import { sfxTone, sfxNoise } from '../audio/audio.js';
import { heatStars, msg, big } from './world.js';
import { roadPointFar, sidewalkPointFar, inZone } from './missions.js';
import { darkness, DAY_SECONDS } from '../world/time.js';
import { fire, WEAPONS } from './weapons.js';
import { S, player } from '../core/state.js';
import { isOpenAt } from './blitz.js';
import { saveGame } from './save.js';

// ---------- carreira (nível sobe a cada 5 serviços) ----------
const CAREER_KEY='aq_career';
export const career={taxi:0,motoboy:0,onibus:0,guincho:0,vigilante:0};
try{Object.assign(career,JSON.parse(localStorage.getItem(CAREER_KEY)||'{}'));}catch(e){}
function saveCareer(){try{localStorage.setItem(CAREER_KEY,JSON.stringify(career));}catch(e){}}
export const levelOf=type=>Math.min(5,1+Math.floor((career[type]||0)/5));
const mult=type=>1+0.25*(levelOf(type)-1);

export const JOBS={
  taxi:     {title:'TAXISTA',            vehicle:['taxi']},
  motoboy:  {title:'MOTOBOY',            vehicle:['moto']},
  onibus:   {title:'MOTORISTA DE BUSÃO', vehicle:['busao']},
  guincho:  {title:'GUINCHO',            vehicle:['guincho']},
  vigilante:{title:'VIGILANTE NOTURNO',  vehicle:null},
};

// ---------- lugares dos empregos ----------
const openB=b=>isOpenAt((b.x0+b.x1)/2,(b.y0+b.y1)/2);
export const lanchonetes=()=>buildings.filter(b=>b.kind==='lanchonete'&&openB(b));
// emprego que depende de lugar em bairro fechado: devolve o motivo (ou '' se dá pra trabalhar)
function jobBlocked(type){
  if(type==='motoboy'&&!lanchonetes().length)return 'Motoboy parado: as lanchonetes estão fechadas pela operação.';
  if(type==='guincho'&&!towZones().length)return 'Guincho parado: posto e Oficina do Zé estão fechados pela operação.';
  return '';
}
export const lojas=()=>buildings.filter(b=>(b.kind==='mercadinho'||b.kind==='farmacia')&&openB(b));
const walkable=(x,y)=>{const t=tileAt(x,y);return t===SIDE||t===GRASS||t===PARK||t===SAND;};
// ponto de calçada na frente de um prédio (porta)
export function doorOf(b){
  if(b.door)return b.door;
  if(b._door)return b._door;
  const cx=(b.x0+b.x1)/2, cy=(b.y0+b.y1)/2;
  for(const [x,y] of [[cx,b.y1+18],[cx,b.y0-18],[b.x0-18,cy],[b.x1+18,cy],[cx,b.y1+50],[cx,b.y0-50]]){if(walkable(x,y)){b._door={x,y};return b._door;}}
  b._door={x:cx,y:b.y1+18};return b._door;
}
// pontos de ônibus: volta nas avenidas 3 e 11 (sentido horário)
export const BUS_STOPS=(()=>{
  // volta no retângulo formado pelas duas primeiras avenidas verticais e horizontais (sentido horário)
  const va=VL.filter(l=>l.type==='ave'), ha=HL.filter(l=>l.type==='ave');
  const L1=va[0],L2=va[1],H1=ha[0],H2=ha[1],st=[];
  const outer=(L,d)=>{const c=laneCoords(L,d);return c[c.length-1];};
  const between=(lines,from,to)=>lines.filter(l=>l.px>=Math.min(from,to)&&l.px<=Math.max(from,to)).map(l=>l.px).sort((a,b)=>from<to?a-b:b-a);
  const add=(pts,fixed,horiz,d,side)=>{for(let k=0;k<pts.length-1;k++){const m=(pts[k]+pts[k+1])/2;if(Math.abs(pts[k+1]-pts[k])<300)continue;
      const lane=outer(horiz?fixed:fixed,d);st.push(horiz?{x:m,y:lane,side,off:fixed.w*T/2-(Math.abs(lane-fixed.px))+18}:{x:lane,y:m,side,off:fixed.w*T/2-(Math.abs(lane-fixed.px))+18});}};
  const vx=between(VL.filter(l=>l.type!=='beco'),L1.px,L2.px), vy=between(HL.filter(l=>l.type!=='beco'),H1.px,H2.px);
  add(vx,H1,true,0,{x:0,y:1});                                   // leste pela avenida de cima
  add(vy,L2,false,1,{x:-1,y:0});                                 // sul pela avenida da direita
  add([...vx].reverse(),H2,true,2,{x:0,y:-1});                   // oeste pela avenida de baixo
  add([...vy].reverse(),L1,false,3,{x:1,y:0});                   // norte pela avenida da esquerda
  return st;})();

// ---------- veículos de trabalho estacionados (reaparecem se sumirem) ----------
const spots=[];
export function setupJobSpots(){
  spots.length=0;
  // motocas só em algumas lanchonetes (no máximo 6, espalhadas)
  buildings.filter(b=>b.kind==='lanchonete').filter((b,i,arr)=>i%Math.max(1,Math.ceil(arr.length/6))===0).forEach(b=>{const d=doorOf(b);b.hasMoto=true;spots.push({type:'moto',x:d.x+56,y:d.y,a:0});});
  for(const k of ['posto','posto2']){const z=special[k];if(z)spots.push({type:'guincho',x:(z.x0+z.x1)/2,y:z.y1-24,a:0});}
  if(special.estac3)spots.push({type:'busao',x:special.estac3.x,y:special.estac3.y,a:0,terminal:true});
  if(special.estac)spots.push({type:'taxi',x:special.estac.x,y:special.estac.y,a:0,ponto:true});
  for(const s of spots)s.car=null;
}
let spotT=0;
function maintainSpots(dt){
  spotT-=dt;if(spotT>0)return;spotT=5;
  for(const s of spots){
    const ok=s.car&&!s.car.wreck&&S.cars.includes(s.car);
    if(ok)continue;
    if(hyp(s.x-player.x,s.y-player.y)<700&&s.car)continue; // não aparece na frente do jogador
    const c=new Car(s.type,s.x,s.y,s.a);c.keep=true;S.cars.push(c);s.car=c;
  }
}
export const jobSpots=()=>spots;

// ---------- início e fim de turno ----------
export function toggleJob(){
  if(S.job){endJob('Turno encerrado.');return;}
  if(S.mission){msg('Termina a missão primeiro.',2);return;}
  if(player.state!=='play')return;
  const c=player.car;
  if(c){
    const type=Object.keys(JOBS).find(k=>JOBS[k].vehicle&&JOBS[k].vehicle.includes(c.type));
    if(!type){msg('Esse veículo não tem emprego. Tenta táxi, motoca, busão ou guincho.',2.5);return;}
    const why=jobBlocked(type);if(why){msg(why,3);return;}
    startJob(type,c);return;
  }
  // a pé: vigilante na porta de mercadinho ou farmácia
  const loja=lojas().find(b=>{const d=doorOf(b);return hyp(d.x-player.x,d.y-player.y)<60;});
  if(!loja){openJobMenu();return;}
  if(darkness()<0.5){msg('Vigilante só trabalha de noite (das 20h às 5h).',2.5);return;}
  if(dawn()){msg('Já tá amanhecendo, o turno da noite acabou. Volta de noite.',2.5);return;}
  startJob('vigilante',null,loja);
}
function startJob(type,car,loja){
  S.job={type,car,stage:'',streak:0,earned:0,text:'',target:null,time:undefined,data:{}};
  const j=S.job;
  if(type==='taxi')nextTaxi(j);
  else if(type==='motoboy')nextMoto(j);
  else if(type==='onibus'){let bi=0,bd=1e9;BUS_STOPS.forEach((s,i)=>{const d=hyp(s.x-car.x,s.y-car.y);if(d<bd){bd=d;bi=i;}});j.data.stop=bi;j.data.count=0;nextBus(j);}
  else if(type==='guincho')nextTow(j);
  else if(type==='vigilante'){j.data.loja=loja;j.data.door=doorOf(loja);j.data.robbed=0;j.data.spawnT=4;j.data.shiftT=0;j.text='Protege a loja! Derruba os assaltantes antes de chegarem na porta.';}
  big(JOBS[type].title,'Nível '+levelOf(type)+' · J encerra o turno','#7fd8ff',2.2);sfxTone(520,0.12,0.1);sfxTone(780,0.18,0.1,'square',0.1);
}
export function endJob(reason){
  const j=S.job;if(!j)return;
  cleanup(j);
  big('FIM DO TURNO','Ganhou '+fmtMoney(j.earned)+' de '+JOBS[j.type].title.toLowerCase(),'#7fd8ff',2.6);
  if(reason)msg(reason,3);
  S.job=null;
  saveGame(true);
}
function cleanup(j){
  if(j.data.ped){j.data.ped.job=null;if(j.data.ped.state==='wait')j.data.ped.state='walk';}
  if(j.data.towed){j.data.towed.towed=false;}
  if(j.data.broken&&!j.data.towed){j.data.broken.keep=false;}
  for(const p of S.peds)if(p.robber&&p.state!=='dead'){p.robber=false;p.state='flee';p.flee={x:player.x,y:player.y};p.t=4;}
}
function pay(j,base,label){
  const v=Math.round(base*mult(j.type));
  j.streak++;j.earned+=v;player.money+=v;career[j.type]=(career[j.type]||0)+1;saveCareer();
  floater('+'+fmtMoney(v),'#7dff6b');
  let extra='';
  if(j.streak%5===0){const b=Math.round(150*mult(j.type));player.money+=b;j.earned+=b;extra='  +'+fmtMoney(b)+' de bônus ('+j.streak+' seguidos)';floater('BÔNUS +'+fmtMoney(b),'#ffe14a',1);}
  msg((label||'Serviço feito')+': +'+fmtMoney(v)+extra,3);
  if(career[j.type]%5===0&&levelOf(j.type)<=5)big('NÍVEL '+levelOf(j.type),JOBS[j.type].title+' agora paga mais','#ffe14a',2);
  sfxTone(660,0.1,0.1);sfxTone(990,0.15,0.1,'square',0.08);
}
function failService(j,why){j.streak=0;msg(why+' A sequência zerou.',3);sfxTone(220,0.25,0.1,'triangle');}
function floater(t,col,off){S.floaters.push({x:player.x,y:player.y-20-(off||0)*18,t,col,life:1.6});}

// ---------- TAXISTA ----------
function nextTaxi(j){
  const p=sidewalkPointFar(350,900);const ped=new Ped(p.x,p.y);ped.state='wait';ped.job=j;ped.shirt=pick(['#ffeb3b','#80deea','#ffab91']);S.peds.push(ped);
  j.stage='buscar';j.data.ped=ped;j.target=ped;j.time=undefined;j.text='Busca o passageiro acenando na calçada.';
}
function updTaxi(j,dt){
  const c=player.car,ped=j.data.ped;
  if(j.stage==='buscar'){
    if(!ped||ped.state==='dead'||!S.peds.includes(ped)){nextTaxi(j);return;}
    if(hyp(c.x-ped.x,c.y-ped.y)<70&&c.speed<45){
      ped.state='gone';j.stage='levar';j.data.dest=roadPointFar(700,1800);j.data.hp=c.health;
      const d=hyp(j.data.dest.x-c.x,j.data.dest.y-c.y);j.data.dist=d;j.time=d/150+14;j.target=j.data.dest;j.text='Leva o passageiro pro destino marcado.';sfxTone(880,0.1,0.08);}
  }else{
    j.time-=dt;
    if(heatStars()>=2){ped.state='walk';ped.x=c.x+20;ped.y=c.y;failService(j,'O passageiro desceu com medo da polícia.');nextTaxi(j);return;}
    if(j.time<=0){failService(j,'Demorou demais, o passageiro desistiu.');nextTaxi(j);return;}
    if(hyp(c.x-j.data.dest.x,c.y-j.data.dest.y)<65&&c.speed<70){
      let v=50+j.data.dist/9+Math.max(0,j.time)*3;
      const dmg=j.data.hp-c.health; let label='Corrida';
      if(dmg>25){v*=0.6;label='Corrida (passageiro reclamou das batidas)';}
      pay(j,v,label);nextTaxi(j);}
  }
}

// ---------- MOTOBOY ----------
function nextMoto(j){
  const ls=lanchonetes();if(!ls.length){endJob('As lanchonetes estão fechadas pela operação.');return;}
  let best=ls[0],bd=1e9;for(const b of ls){const d=doorOf(b);const dd=hyp(d.x-player.x,d.y-player.y);if(dd<bd&&dd>150){bd=dd;best=b;}}
  j.stage='pegar';j.data.loja=best;j.target=doorOf(best);j.time=undefined;j.text='Pega o pedido na lanchonete.';
}
function updMoto(j,dt){
  const c=player.car;
  if(j.stage==='pegar'){
    if(hyp(c.x-j.target.x,c.y-j.target.y)<60&&c.speed<45){
      const d=sidewalkPointFar(600,1500);j.stage='entregar';j.data.dest=d;j.data.dist=hyp(d.x-c.x,d.y-c.y);j.time=j.data.dist/190+12;j.data.total=j.time;
      j.target=d;j.text='Entrega o lanche no endereço antes de esfriar!';sfxTone(880,0.1,0.08);}
  }else{
    j.time-=dt;
    if(j.time<=0){failService(j,'O lanche chegou frio, o cliente cancelou.');nextMoto(j);return;}
    if(hyp(c.x-j.target.x,c.y-j.target.y)<55&&c.speed<60){
      let v=35+j.data.dist/11;let label='Entrega';
      if(j.time>j.data.total*0.4){v+=30;label='Entrega rápida (com gorjeta)';}
      pay(j,v,label);nextMoto(j);}
  }
}

// ---------- BUSÃO ----------
function nextBus(j){
  const s=BUS_STOPS[j.data.stop];j.stage='ponto';j.target=s;j.data.hold=0;j.time=undefined;
  j.text='Para no ponto de ônibus marcado ('+(j.data.count%BUS_STOPS.length+1)+'/'+BUS_STOPS.length+').';
}
function updBus(j,dt){
  const c=player.car,s=j.target;
  if(hyp(c.x-s.x,c.y-s.y)<70&&c.speed<25){
    j.data.hold+=dt;j.text='Embarcando passageiros...';
    if(j.data.hold>1.4){
      const n=1+Math.floor(Math.random()*5);j.data.count++;
      pay(j,n*14,n+(n>1?' passageiros':' passageiro'));
      if(j.data.count%BUS_STOPS.length===0){const b=Math.round(200*mult('onibus'));player.money+=b;j.earned+=b;big('VOLTA COMPLETA','+'+fmtMoney(b),'#7fd8ff',2);}
      j.data.stop=(j.data.stop+1)%BUS_STOPS.length;nextBus(j);}
  }else if(j.data.hold>0){j.data.hold=0;nextBus(j);}
}

// ---------- GUINCHO ----------
function nextTow(j){
  const p=sidewalkPointFar(600,1500);
  const car=new Car(pick(['jegue','taxi','camin','brisa']),p.x,p.y,Math.random()*Math.PI*2);
  car.health=car.t.hp*0.2;car.keep=true;car.broken=true;S.cars.push(car);
  j.stage='buscar';j.data.broken=car;j.data.towed=null;j.target=car;j.time=undefined;j.text='Vai buscar o carro quebrado (encosta a traseira do guincho nele).';
}
const towZones=()=>zones.filter(z=>(z.type==='posto'||z.type==='ze')&&isOpenAt((z.x0+z.x1)/2,(z.y0+z.y1)/2));
function rearOf(c){return {x:c.x-Math.cos(c.a)*c.t.len/2,y:c.y-Math.sin(c.a)*c.t.len/2};}
function updTow(j,dt){
  const c=player.car, car=j.data.broken;
  if(!car||car.wreck||car.burnT>0||!S.cars.includes(car)){if(j.data.towed){j.data.towed.towed=false;}failService(j,'O carro do serviço foi destruído.');nextTow(j);return;}
  if(j.stage==='buscar'){
    const r=rearOf(c);
    if(hyp(r.x-car.x,r.y-car.y)<car.t.len/2+30&&c.speed<40){
      const zs=towZones();if(!zs.length){endJob('Não tem posto nem Oficina do Zé aberto pra levar o carro.');return;}
      car.towed=true;j.data.towed=car;j.stage='levar';
      let best=zs[0],bd=1e9;for(const z of zs){const d=hyp((z.x0+z.x1)/2-c.x,(z.y0+z.y1)/2-c.y);if(d<bd){bd=d;best=z;}}
      j.data.zone=best;j.data.dist=bd;j.target={x:(best.x0+best.x1)/2,y:(best.y0+best.y1)/2};j.text='Leva o carro pro posto ou pra Oficina do Zé.';sfxNoise(0.2,0.2,600);}
  }else{
    // carro rebocado vai atrás do guincho
    const back=c.t.len/2+car.t.len/2+4;
    car.x=c.x-Math.cos(c.a)*back;car.y=c.y-Math.sin(c.a)*back;car.a=c.a;car.vx=c.vx;car.vy=c.vy;
    if(inZone(car,j.data.zone)||inZone(c,j.data.zone)){
      pay(j,150+j.data.dist/7,'Reboque');car.towed=false;const i=S.cars.indexOf(car);if(i>=0)S.cars.splice(i,1);j.data.broken=null;j.data.towed=null;nextTow(j);}
  }
}

// ---------- VIGILANTE ----------
function spawnRobber(j){
  const d=j.data.door;
  for(let k=0;k<40;k++){
    const a=Math.random()*Math.PI*2,r=rand(330,560),x=d.x+Math.cos(a)*r,y=d.y+Math.sin(a)*r;
    if(!walkable(x,y)&&tileAt(x,y)!==2)continue;
    if(!clearLine(x,y,d.x,d.y))continue;
    const p=new Ped(x,y);p.robber=true;p.state='robber';p.shirt='#222';p.hair='#111';p.spd=72;p.shootCd=rand(1.5,2.5);p.hp=2;S.peds.push(p);return;
  }
}
function clearLine(ax,ay,bx,by){const d=hyp(bx-ax,by-ay),n=Math.ceil(d/12);for(let i=1;i<n;i++){const t=i/n;if(solidAt(ax+(bx-ax)*t,ay+(by-ay)*t))return false;}return true;}
const dawn=()=>S.tod>=5&&S.tod<7;
const GUARD_MIN_SHIFT=DAY_SECONDS/12; // 2 horas de jogo de turno pra ganhar o bônus do amanhecer
function updGuard(j,dt){
  const d=j.data.door;
  j.data.shiftT=(j.data.shiftT||0)+dt;
  if(dawn()){const b=j.data.shiftT>=GUARD_MIN_SHIFT?Math.round(300*mult('vigilante')):0;player.money+=b;j.earned+=b;endJob(b?'Amanheceu! Bônus do turno: +'+fmtMoney(b):'Amanheceu.');return;}
  const dist=hyp(player.x-d.x,player.y-d.y);
  if(player.car||dist>520){endJob('Tu abandonou o posto de vigilante.');return;}
  if(dist>300)j.text='Volta pra perto da loja!';else j.text='Protege a loja! Assaltos: '+j.data.robbed+'/3';
  j.target=d;
  j.data.spawnT-=dt;
  const alive=S.peds.filter(p=>p.robber&&p.state!=='dead').length;
  if(j.data.spawnT<=0&&alive<3){spawnRobber(j);j.data.spawnT=rand(9,16)/(1+0.2*(levelOf('vigilante')-1));}
  for(const p of S.peds){
    if(!p.robber)continue;
    if(p.state==='dead'){if(!p.paid){p.paid=true;pay(j,110,'Assaltante derrubado');}continue;}
    if(p.state!=='robber')continue;
    const dx=d.x-p.x,dy=d.y-p.y,l=hyp(dx,dy)||1;
    p.a=Math.atan2(dy,dx);p.anim+=dt;
    const nx=p.x+dx/l*p.spd*dt,ny=p.y+dy/l*p.spd*dt;if(!solidAt(nx,p.y))p.x=nx;if(!solidAt(p.x,ny))p.y=ny;
    // atira no vigilante quando ele está perto
    p.shootCd-=dt;
    const pd=hyp(player.x-p.x,player.y-p.y);
    if(pd<230&&p.shootCd<=0&&clearLine(p.x,p.y,player.x,player.y)){p.a=Math.atan2(player.y-p.y,player.x-p.x);fire(p.x,p.y,p.a+rand(-0.15,0.15),WEAPONS.pistola,false,null);p.shootCd=rand(1.6,2.6);}
    if(l<26){p.state='gone';p.robber=false;j.data.robbed++;msg('Assaltaram a loja! ('+j.data.robbed+'/3)',2.5);sfxTone(200,0.3,0.12,'sawtooth');
      if(j.data.robbed>=3){endJob('A loja foi assaltada 3 vezes. Tu foi demitido do turno.');return;}}
  }
}

// ---------- loop ----------
export function updateJobs(dt){
  for(const f of S.floaters){f.life-=dt;f.y-=dt*30;}
  S.floaters=S.floaters.filter(f=>f.life>0);
  maintainSpots(dt);
  const j=S.job;if(!j)return;
  if(player.state!=='play'){endJob('Turno perdido.');return;}
  if(j.type!=='vigilante'){
    if(!player.car||player.car!==j.car){endJob('Tu saiu do veículo de trabalho.');return;}
    if(j.car.wreck||j.car.burnT>0){endJob('O veículo de trabalho foi destruído.');return;}
  }
  if(j.type==='taxi')updTaxi(j,dt);
  else if(j.type==='motoboy')updMoto(j,dt);
  else if(j.type==='onibus')updBus(j,dt);
  else if(j.type==='guincho')updTow(j,dt);
  else if(j.type==='vigilante')updGuard(j,dt);
}
// ---- menu de empregos (J a pé): explica cada um e marca no mapa onde começar ----
const JOB_INFO={
  taxi:{short:'qualquer táxi na rua',how:'Qualquer táxi serve. Entra e aperta J.',pay:'por corrida'},
  motoboy:{short:'Motoca na lanchonete',how:'Pega uma Motoca parada numa lanchonete e aperta J.',pay:'por entrega'},
  onibus:{short:'busão no Terminal',how:'Pega o busão no Terminal e aperta J.',pay:'por passageiro'},
  guincho:{short:'guincho no posto',how:'Pega o guincho num posto e aperta J.',pay:'por reboque'},
  vigilante:{short:'loja, só de noite',how:'De noite, na porta de mercadinho ou farmácia, aperta J.',pay:'por assaltante'},
};
function whereJob(type){
  const near=list=>{let b=null,bd=1e9;for(const p of list){if(!p||!isOpenAt(p.x,p.y))continue;const d=hyp(p.x-player.x,p.y-player.y);if(d<bd){bd=d;b=p;}}return b;};
  if(type==='taxi')return near([...S.cars.filter(c=>c.type==='taxi'&&!c.wreck),...spots.filter(s=>s.type==='taxi')]);
  if(type==='motoboy')return near(spots.filter(s=>s.type==='moto').map(s=>s.car||s));
  if(type==='onibus')return near(spots.filter(s=>s.type==='busao').map(s=>s.car||s));
  if(type==='guincho')return near(spots.filter(s=>s.type==='guincho').map(s=>s.car||s));
  return near(lojas().map(doorOf));
}
export function openJobMenu(){
  const items=Object.keys(JOBS).map(k=>({
    label:JOBS[k].title.charAt(0)+JOBS[k].title.slice(1).toLowerCase()+' (nív. '+levelOf(k)+') · '+JOB_INFO[k].short,
    price:0,tag:'marcar',
    run:()=>{const p=whereJob(k);S.menu=null;if(!p){msg('Não achei nenhum agora. Tenta de novo daqui a pouco.',2.5);return;}
      S.waypoint={x:p.x,y:p.y};msg('Marquei no mapa: '+JOB_INFO[k].how,4);},
  }));
  S.menu={title:'EMPREGOS',sub:'Escolhe um e eu marco no mapa onde começar',kind:'emprego',items,sel:0,rects:[]};
}

// dica de emprego quando o jogador está num veículo de trabalho (ou na porta de uma loja à noite)
export function jobHint(){
  if(S.job||S.mission||player.state!=='play')return '';
  const c=player.car;
  if(c){const type=Object.keys(JOBS).find(k=>JOBS[k].vehicle&&JOBS[k].vehicle.includes(c.type));
    if(!type)return '';const why=jobBlocked(type);
    return why||'Começar turno de '+JOBS[type].title.toLowerCase()+' (nível '+levelOf(type)+')';}
  const loja=lojas().find(b=>{const d=doorOf(b);return hyp(d.x-player.x,d.y-player.y)<60;});
  if(loja)return darkness()>=0.5&&!dawn()?'Começar turno de vigilante noturno (nível '+levelOf('vigilante')+')':'Vigilante: volta aqui de noite (20h às 5h)';
  return '';
}
