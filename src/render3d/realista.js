// Gráficos "3D realista" (qualidade 3). A cidade continua com os mesmos modelos; o que muda é a luz:
//  - materiais com reflexo (PBR): lataria com verniz, vidro e mar refletindo o céu, asfalto fosco
//  - o céu da hora do dia vira um mapa de ambiente (ilumina e aparece nos reflexos, do sol do meio-dia à noite)
//  - sombras de borda suave
//  - brilho (bloom) em neon, faróis e postes à noite, e tone mapping de cinema (ACES)
// Os outros níveis de qualidade não passam por aqui: os materiais Lambert originais ficam guardados
// e voltam quando sai do realista.
import * as THREE from '../../vendor/three/three.module.min.js';
import { EffectComposer } from '../../vendor/three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../../vendor/three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../../vendor/three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../../vendor/three/addons/postprocessing/OutputPass.js';

// ---------- materiais: Lambert/Phong -> Standard (ou Physical com verniz, na lataria) ----------
// Quem cria o material pode marcar userData.pbr = { r: rugosidade, m: metal } ou { car: true }.
const DEF = { r: 0.85, m: 0 };
const conv = new WeakMap(), live = new Set();
const COPY = ['map', 'vertexColors', 'transparent', 'opacity', 'alphaTest', 'depthWrite', 'depthTest', 'side', 'flatShading', 'fog', 'alphaMap', 'emissiveMap',
  'polygonOffset', 'polygonOffsetFactor', 'polygonOffsetUnits'];
function toPBR(src) {
  if (!src || !(src.isMeshLambertMaterial || src.isMeshPhongMaterial)) return src;
  let m = conv.get(src); if (m) return m;
  const p = src.userData.pbr || DEF;
  m = p.car ? new THREE.MeshPhysicalMaterial({ clearcoat: 1, clearcoatRoughness: 0.06, roughness: 0.45, metalness: 0.2 })
    : new THREE.MeshStandardMaterial({ roughness: p.r ?? DEF.r, metalness: p.m ?? DEF.m });
  for (const k of COPY) m[k] = src[k];
  m.color.copy(src.color); m.emissive.copy(src.emissive); m.emissiveIntensity = src.emissiveIntensity;
  if (p.env !== undefined) m.envMapIntensity = p.env;
  // shader modificado (o mar): os mesmos trechos existem no shader PBR
  if (Object.prototype.hasOwnProperty.call(src, 'onBeforeCompile')) { m.onBeforeCompile = src.onBeforeCompile; m.customProgramCacheKey = () => 'pbr-' + src.uuid; }
  m.userData.src = src; conv.set(src, m); live.add(m);
  return m;
}
const back = m => (m && m.userData && m.userData.src) || m;
function swap(o, f) {
  const cur = o.material;
  if (Array.isArray(cur)) { if (cur.some(x => f(x) !== x)) o.material = cur.map(f); }
  else { const n = f(cur); if (n !== cur) o.material = n; }
}
// troca todos os materiais da cena (o jogo pode ter trocado algum neste quadro: freio, carro queimado, repintura...)
export function swapScene(scene, on) {
  const f = on ? toPBR : back;
  scene.traverse(o => { if (o.material) swap(o, f); });
  // o que muda com a hora/eventos no material original passa pra cópia
  if (on) for (const m of live) { const s = m.userData.src; m.color.copy(s.color); m.emissiveIntensity = s.emissiveIntensity; m.opacity = s.opacity; m.visible = s.visible; }
}

// ---------- céu como mapa de ambiente ----------
let pmrem = null, envRT = null, envScene = null, envU = null, lastKey = '';
function makeEnvScene() {
  envU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() } };
  const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: envU,
    vertexShader: 'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform vec3 top,hor,bot,sunDir,sunCol;varying vec3 vDir;
      void main(){vec3 d=normalize(vDir);float h=d.y;
        vec3 c=h>0.?mix(hor,top,pow(h,0.55)):mix(hor,bot,pow(min(1.,-h*3.),0.5));
        float s=max(dot(d,sunDir),0.);c+=sunCol*(pow(s,900.)*12.+pow(s,32.)*0.06);
        gl_FragColor=vec4(c,1.);}` });
  envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat));
}
const _c = new THREE.Color();
// sky = cores da hora (bg, chão), sun = DirectionalLight. Refaz só quando a luz muda de verdade.
export function updateEnv(renderer, scene, sky, sun) {
  if (!pmrem) { pmrem = new THREE.PMREMGenerator(renderer); makeEnvScene(); }
  const dir = _v.copy(sun.position).sub(sun.target.position).normalize();
  const key = sky.bg.getHexString() + sun.color.getHexString() + sun.intensity.toFixed(2) + dir.x.toFixed(2) + dir.y.toFixed(2);
  if (key === lastKey && envRT) { scene.environment = envRT.texture; return; }
  lastKey = key;
  envU.hor.value.copy(sky.bg).lerp(_c.setRGB(1, 1, 1), 0.18);
  envU.top.value.copy(sky.bg).multiplyScalar(0.55);
  envU.bot.value.copy(sky.hg).multiplyScalar(0.45);
  envU.sunDir.value.copy(dir);
  envU.sunCol.value.copy(sun.color).multiplyScalar(sun.intensity);
  const rt = pmrem.fromScene(envScene, 0, 0.1, 100);
  if (envRT) envRT.dispose();
  envRT = rt; scene.environment = rt.texture;
}
const _v = new THREE.Vector3();

// ---------- pós-processamento ----------
// (oclusão de ambiente em tela, GTAO, foi testada e saiu: apagava as sombras, manchava os letreiros
// e desenhava a cidade duas vezes por quadro)
let composer = null, bloom = null;
function makeComposer(renderer, scene, camera) {
  const sz = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(sz.x, sz.y, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(sz.x, sz.y), 0.2, 0.5, 2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
}
let sizeKey = '';
// desenha a cidade no modo realista. dk = escuridão (0 dia, 1 noite)
export function renderReal(renderer, scene, camera, dk) {
  if (!composer) makeComposer(renderer, scene, camera);
  const pr = renderer.getPixelRatio(), sz = renderer.getSize(_s), k = sz.x + 'x' + sz.y + '@' + pr;
  if (k !== sizeKey) { sizeKey = k; composer.setPixelRatio(pr); composer.setSize(sz.x, sz.y); }
  // de dia só o que é bem mais forte que o sol brilha; de noite neon, faróis e postes
  bloom.threshold = THREE.MathUtils.lerp(2.4, 0.95, dk);
  bloom.strength = THREE.MathUtils.lerp(0.15, 0.6, dk);
  // tone mapping só na saída do composer (o interior e o Filtro 97 continuam como eram)
  const tm = renderer.toneMapping, ex = renderer.toneMappingExposure;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = THREE.MathUtils.lerp(0.9, 1.15, dk);
  // o painel F3 conta as chamadas de todos os passes, não só a do último
  renderer.info.autoReset = false; renderer.info.reset();
  composer.render();
  renderer.info.autoReset = true;
  renderer.toneMapping = tm; renderer.toneMappingExposure = ex;
}
const _s = new THREE.Vector2();
