// @ts-nocheck
// VKS BOOST · cena 3D da página inicial (rolagem conduz a câmera e as peças)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const DARK = new THREE.Color('#0a0a0b');
const LIGHT = new THREE.Color('#ececee');
const STAGE = new THREE.Color('#050506');

// Quadros-chave: p = progresso da rolagem (0 a 1). São só 3 cenas fixas:
// 0–0.30 placa de vídeo · 0.40–0.64 memória · 0.76–1 placa no pedestal.
const KEYS = {
  gpu: [
    { p: 0.0, x: 1.85, y: -0.15, z: 0, rx: 0.12, ry: -0.55, rz: 0, s: 0.92 },
    { p: 0.3, x: 1.7, y: 0.0, z: 0.3, rx: 0.1, ry: -0.2, rz: 0, s: 0.95 },
    { p: 0.38, x: 4.2, y: 2.6, z: -1, rx: 0.3, ry: 0.5, rz: 0.1, s: 0 },
    { p: 0.65, x: 2.6, y: 3.4, z: -1, rx: 0.3, ry: -0.6, rz: 0, s: 0 },
    { p: 0.74, x: 1.15, y: 0.28, z: 0, rx: 0.1, ry: -0.35, rz: 0, s: 0.62 },
    { p: 1.0, x: 1.15, y: 0.28, z: 0, rx: 0.1, ry: -0.35, rz: 0, s: 0.62 },
  ],
  ram: [
    { p: 0.3, x: 0, y: -4.4, z: 0, rx: 0.3, ry: -0.8, rz: 0, s: 0 },
    { p: 0.4, x: 0.4, y: -0.8, z: 0, rx: 0.2, ry: -0.5, rz: 0, s: 0.78 },
    { p: 0.63, x: 0.4, y: -0.8, z: 0.3, rx: 0.14, ry: 0.35, rz: 0, s: 0.8 },
    { p: 0.69, x: 0.4, y: -4.6, z: 0, rx: 0.3, ry: 0.9, rz: 0, s: 0 },
  ],
};

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function sample(keys, p) {
  if (p <= keys[0].p) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (p <= b.p) {
      const t = smooth((p - a.p) / (b.p - a.p));
      const o = {};
      for (const k of ['x', 'y', 'z', 'rx', 'ry', 'rz', 's']) o[k] = a[k] + (b[k] - a[k]) * t;
      return o;
    }
  }
  return keys[keys.length - 1];
}

function backgroundAt(p) {
  if (p < 0.31) return DARK;
  if (p < 0.37) return DARK.clone().lerp(LIGHT, smooth((p - 0.31) / 0.06));
  if (p < 0.65) return LIGHT;
  if (p < 0.7) return LIGHT.clone().lerp(STAGE, smooth((p - 0.65) / 0.05));
  return STAGE;
}

/**
 * @param {{ canvas: HTMLCanvasElement, story: HTMLElement, background: HTMLElement, words?: Record<string, HTMLElement | null>, modelsBase?: string, onReady?: () => void }} opts
 */
export function createStoryScene({ canvas, story, background, words = {}, modelsBase = '/models/', modelExt = 'glb', onReady = undefined }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const maxRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 900 ? 1 : 1.25);
  let ratio = maxRatio;
  renderer.setPixelRatio(ratio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // sombra recalculada só quando algo se mexe no pedestal

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 6, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xff1a10, 90, 30, 1.6);
  rim.position.set(5, 2, -3);
  scene.add(rim);
  const rim2 = new THREE.PointLight(0xff2a1a, 40, 30, 1.6);
  rim2.position.set(-5, -1, -2);
  scene.add(rim2);
  const fill = new THREE.HemisphereLight(0xffffff, 0x220000, 0.35);
  scene.add(fill);

  // Pedestal com holofote (cena final)
  const spot = new THREE.SpotLight(0xffffff, 0, 30, 0.42, 0.7, 1.2);
  spot.position.set(0, 7.5, 2.5);
  spot.castShadow = false;
  spot.shadow.mapSize.set(512, 512);
  spot.shadow.bias = -0.0004;
  scene.add(spot, spot.target);
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.85, 0.9, 96),
    new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.45, metalness: 0.3 })
  );
  pedestal.receiveShadow = true;
  pedestal.castShadow = true;
  const pedestalRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.76, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xff1a10 })
  );
  pedestalRing.rotation.x = Math.PI / 2;
  pedestalRing.position.y = 0.45;
  pedestal.add(pedestalRing);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.ShadowMaterial({ opacity: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  const stage = new THREE.Group();
  stage.add(pedestal, floor);
  pedestal.position.y = -1.5;
  floor.position.y = -1.95;
  stage.visible = false;
  scene.add(stage);

  const holders = { gpu: new THREE.Group(), ram: new THREE.Group() };
  Object.values(holders).forEach((h) => { h.visible = false; scene.add(h); });
  const rotors = [];

  const loader = new GLTFLoader();
  const targets = { gpu: 4.3, ram: 3.7, cpu: 2.7 };
  let loaded = 0;
  for (const name of Object.keys(holders)) {
    loader.load(`${modelsBase}${name}.${modelExt}`, (gltf) => {
      const model = gltf.scene;
      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          const m = o.material;
          if (m && 'envMapIntensity' in m) m.envMapIntensity = 1.0;
          // RGB: vermelho puro e intensidade controlada (o export do Blender vem forte demais)
          if (m && m.emissive && m.emissive.getHex() !== 0) {
            const white = m.emissive.r > 0.8 && m.emissive.g > 0.8;
            m.emissive.set(white ? '#ffffff' : '#ff1006');
            m.emissiveIntensity = white ? 1.0 : 1.15;
          }
        }
        if (name === 'gpu' && /^rotor\d/.test(o.name)) rotors.push(o);
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const pivot = new THREE.Group();
      pivot.add(model);
      pivot.scale.setScalar(targets[name] / Math.max(size.x, size.z));
      holders[name].add(pivot);
      loaded++;
      if (loaded === 2 && onReady) onReady();
    });
  }

  let progress = 0;
  let target = 0;
  const applied = { bg: '', words: {} };
  let width = 0, height = 0;
  const mouse = { x: 0, y: 0 };
  let running = true;
  let raf = 0;
  let last = performance.now();

  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }

  function readScroll() {
    const rect = story.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    target = clamp01(-rect.top / Math.max(1, total));
  }

  let lastMove = 0;
  let frameNo = 0;
  let slow = 0;
  function onMouse(e) {
    lastMove = performance.now();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const rawDt = now - last;
    // Parado (sem rolar e sem mexer o mouse): roda a 30 fps para poupar a placa de vídeo
    const idle = Math.abs(target - progress) < 0.0005 && now - lastMove > 400;
    frameNo++;
    if (idle && frameNo % 2) return;
    const dt = Math.min(0.05, rawDt / 1000);
    last = now;
    // PC fraco: se os quadros demoram demais, baixa a resolução da cena aos poucos
    if (!idle) {
      slow = rawDt > 26 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 45 && ratio > 0.7) { ratio = Math.max(0.7, ratio - 0.15); renderer.setPixelRatio(ratio); resize(); slow = 0; }
    }
    const t = now / 1000;
    // Rolagem suavizada: as peças deslizam em vez de pular
    progress += (target - progress) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - progress) < 0.0002) progress = target;
    const narrow = camera.aspect < 1;
    const spread = narrow ? 0.25 : 1;
    const scale = narrow ? 0.62 : 1;

    for (const [name, holder] of Object.entries(holders)) {
      const k = sample(KEYS[name], progress);
      holder.visible = k.s > 0.002;
      if (!holder.visible) continue;
      const float = Math.sin(t * 1.1 + name.length) * 0.06;
      holder.position.set(k.x * spread, k.y + float, k.z);
      const sway = name === 'gpu' && progress > 0.74 ? Math.sin(t * 0.6) * 0.4 : 0;
      holder.rotation.set(k.rx, k.ry + sway, k.rz);
      holder.scale.setScalar(k.s * scale);
    }

    const boost = progress < 0.3 ? 1 + progress * 8 : 1;
    for (const r of rotors) r.rotation.z -= dt * 5.5 * boost;

    const stageT = smooth(clamp01((progress - 0.65) / 0.09));
    const lift = 0.59;
    stage.visible = stageT > 0.001;
    stage.position.y = -4.5 * (1 - stageT) + lift;
    stage.position.x = holders.gpu.position.x;
    spot.castShadow = stageT > 0.01; // sombra só na cena do pedestal
    stage.scale.setScalar(narrow ? 0.62 : 1);
    spot.intensity = 260 * stageT;
    key.intensity = 2.2 * (1 - 0.55 * stageT);

    const bgHex = `#${backgroundAt(progress).getHexString()}`;
    if (bgHex !== applied.bg) { background.style.backgroundColor = bgHex; applied.bg = bgHex; }
    const onLight = progress > 0.34 && progress < 0.68;
    rim.intensity = onLight ? 35 : 90;

    // Palavras gigantes atrás das peças (camada abaixo do canvas)
    const win = (a, b, c, d) => clamp01(Math.min((progress - a) / (b - a), (d - progress) / (d - c)));
    const show = {
      hero: win(-1, 0, 0.24, 0.32),
      fps: win(0.35, 0.41, 0.62, 0.67),
      glow: Math.max(win(-1, 0, 0.26, 0.33), 0.8 * win(0.7, 0.77, 2, 3)),
    };
    for (const [id, el] of Object.entries(words)) {
      if (!el) continue;
      const v = Math.round(smooth(show[id] ?? 0) * 100) / 100;
      if (applied.words[id] === v) continue;
      applied.words[id] = v;
      el.style.opacity = String(v);
      if (id !== 'glow') el.style.translate = `0 ${(1 - v) * 40}px`;
    }

    camera.position.x += (mouse.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    if (stage.visible && frameNo % 3 === 0) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    canvas.style.visibility = running ? 'visible' : 'hidden';
  }, { threshold: 0 });
  io.observe(story);
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('pointermove', onMouse, { passive: true });
  resize();
  readScroll();
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      canvas.style.visibility = '';
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('pointermove', onMouse);
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
