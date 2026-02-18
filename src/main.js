import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UNIVERSE_JOURNEY, BLACKHOLE_JOURNEY } from './config.js';
import { createBigBang } from './stages/cosmic/bigbang.js';
import { createPlasma } from './stages/cosmic/plasma.js';
import { createRecombination } from './stages/cosmic/recombination.js';
import { createDarkAges } from './stages/cosmic/darkages.js';
import { createFirstStars } from './stages/cosmic/firststars.js';
import { createGalaxy } from './stages/cosmic/galaxy.js';
import { createSolarNebula } from './stages/solar/nebula.js';
import { createSun } from './stages/solar/sun.js';
import { createPlanetesimals } from './stages/solar/planetesimals.js';
import { createPlanets } from './stages/solar/planets.js';
import { createStage1 } from './stages/stage1-nursery.js';
import { createStage2 } from './stages/stage2-seed.js';
import { createStage3 } from './stages/stage3-awakening.js';
import { createStage4 } from './stages/stage4-active.js';
import { createStage5 } from './stages/stage5-quiescent.js';
import { BlackHoleShader } from './shaders/BlackHoleShader.js';
import { ChromaticAberrationShader } from './shaders/ChromaticAberrationShader.js';
import { FilmGrainShader } from './shaders/FilmGrainShader.js';

// Creator map
const CREATORS = {
  bigbang: createBigBang,
  plasma: createPlasma,
  recombination: createRecombination,
  darkages: createDarkAges,
  firststars: createFirstStars,
  galaxy: createGalaxy,
  nebula: createSolarNebula,
  sun: createSun,
  planetesimals: createPlanetesimals,
  planets: createPlanets,
  'bh-nursery': createStage1,
  'bh-seed': createStage2,
  'bh-awakening': createStage3,
  'bh-active': createStage4,
  'bh-quiescent': createStage5,
};

// ─── Scene setup ───────────────────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.5;
controls.maxDistance = 180;
controls.maxPolarAngle = Math.PI * 0.995;
controls.enablePan = true;
controls.panSpeed = 0.8;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 1.2;
controls.target.set(0, 0, 0);
controls.enabled = false;

// Starfield
const starCount = 6000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const r = 50 + Math.pow(Math.random(), 0.6) * 200;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = r * Math.cos(phi);
  const warm = 0.85 + Math.random() * 0.3;
  starColors[i * 3] = warm;
  starColors[i * 3 + 1] = warm * 0.95;
  starColors[i * 3 + 2] = 0.9 + Math.random() * 0.2;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
}));
stars.visible = false; // Shown only after journey starts (and past plasma)
scene.add(stars);

// Black hole overlay
const overlayGeometry = new THREE.PlaneGeometry(2, 2);
const overlayMaterial = new THREE.ShaderMaterial({
  ...BlackHoleShader,
  depthTest: false,
  depthWrite: false,
});
const blackHoleOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
blackHoleOverlay.frustumCulled = false;
blackHoleOverlay.renderOrder = 999;
blackHoleOverlay.visible = false;
scene.add(blackHoleOverlay);

function updateBlackHoleOverlay() {
  const dist = 0.4;
  const vFov = (camera.fov * Math.PI) / 180;
  const h = 2 * Math.tan(vFov / 2) * dist;
  const viewDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  blackHoleOverlay.position.copy(camera.position).add(viewDir.multiplyScalar(dist));
  blackHoleOverlay.lookAt(camera.position);
  blackHoleOverlay.scale.set((camera.aspect * h) / 2, h / 2, 1);
}

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.6, 0.12);
composer.addPass(bloomPass);
composer.addPass(new ShaderPass(ChromaticAberrationShader));
const filmGrainPass = new ShaderPass(FilmGrainShader);
filmGrainPass.uniforms.uAmount.value = 0.035;
composer.addPass(filmGrainPass);

// ─── State ─────────────────────────────────────────────────────────────────
let currentMode = 'universe'; // 'universe' | 'blackhole'
let currentStage = -1;
let stageObjects = [];
let stageEnterTime = 0; // When current stage was entered (for time-relative animations)
let cameraPosition = new THREE.Vector3(0, 0, 25);
let cameraTarget = new THREE.Vector3(0, 0, 0);
let isPlaying = false;
let playInterval = null;
let cinematicMode = false;
let journeyStarted = false;
let isTransitioning = false;

function getCurrentJourney() {
  return currentMode === 'blackhole' ? BLACKHOLE_JOURNEY : UNIVERSE_JOURNEY;
}

function setObjectOpacity(obj, opacity) {
  if (obj.material) {
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      if (m && 'opacity' in m) {
        m.transparent = true;
        m.opacity = opacity;
      }
    });
  }
  if (obj.children) obj.children.forEach((c) => setObjectOpacity(c, opacity));
}

function destroyObjects(objects) {
  objects.forEach((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
    scene.remove(obj);
  });
}

function destroyCurrentStage() {
  destroyObjects(stageObjects);
  stageObjects = [];
}

const TRANSITION_DURATION = 2200;

function transitionToStage(nextIndex) {
  const journey = getCurrentJourney();
  if (nextIndex < 0 || nextIndex >= journey.length || nextIndex === currentStage || isTransitioning) return;

  isTransitioning = true;
  const prevIndex = currentStage;
  const prevObjects = [...stageObjects];
  const prevHideStars = currentMode === 'universe' && prevIndex >= 0 &&
    (journey[prevIndex]?.id === 'bigbang' || journey[prevIndex]?.id === 'plasma');
  const nextInfo = journey[nextIndex];
  const nextHideStars = currentMode === 'universe' &&
    (nextInfo.id === 'bigbang' || nextInfo.id === 'plasma');

  currentStage = nextIndex;
  stageObjects = [];
  stageEnterTime = performance.now();

  const creator = CREATORS[nextInfo.creator];
  const isBlackHoleActive = currentMode === 'blackhole' && nextInfo.creator === 'bh-active';
  blackHoleOverlay.visible = isBlackHoleActive;

  if (creator) {
    const result = creator(scene);
    if (result?.objects) {
      result.objects.forEach((o) => {
        setObjectOpacity(o, 0);
        scene.add(o);
        stageObjects.push(o);
      });
    }
    cameraPosition.copy(result?.cameraPos || new THREE.Vector3(0, 0, 25));
    cameraTarget.copy(result?.cameraTarget || new THREE.Vector3(0, 0, 0));
  } else if (isBlackHoleActive) {
    cameraPosition.set(10, 3, 14);
    cameraTarget.set(0, 0, 0);
  }

  stars.visible = !nextHideStars;
  if (stars.visible) stars.material.opacity = nextHideStars ? 0 : 0.9;

  updateStageUI();

  const startTime = performance.now();

  function tick() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(1, elapsed / TRANSITION_DURATION);
    const eased = 1 - Math.pow(1 - t, 1.5);

    prevObjects.forEach((o) => setObjectOpacity(o, 1 - eased));
    stageObjects.forEach((o) => setObjectOpacity(o, eased));

    if (stars.visible && prevHideStars !== nextHideStars) {
      stars.material.opacity = nextHideStars ? 0 : eased * 0.9;
    }

    if (t < 1) requestAnimationFrame(tick);
    else {
      destroyObjects(prevObjects);
      isTransitioning = false;
    }
  }
  requestAnimationFrame(tick);

  animateCamera(TRANSITION_DURATION);
}

function updateStageUI() {
  const journey = getCurrentJourney();
  const stageInfo = journey[currentStage];

  document.getElementById('stage-number').textContent = currentStage + 1;
  document.getElementById('stage-total').textContent = journey.length;
  document.getElementById('stage-name').textContent = stageInfo.name;
  document.getElementById('stage-desc').textContent = stageInfo.desc;
  document.getElementById('stage-era').textContent = stageInfo.era || '';
  document.getElementById('stage-era').style.display = stageInfo.era ? 'block' : 'none';
  document.getElementById('progress-fill').style.width = `${((currentStage + 1) / journey.length) * 100}%`;

  const container = document.getElementById('timeline');
  container.innerHTML = '';
  journey.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `timeline-dot ${i === currentStage ? 'active' : ''}`;
    dot.dataset.stage = String(i);
    dot.textContent = i + 1;
    dot.title = journey[i].name;
    dot.addEventListener('click', () => { transitionToStage(i); });
    container.appendChild(dot);
  });

  document.getElementById('journey-panel').classList.toggle('blackhole-mode', currentMode === 'blackhole');
  const btnBh = document.getElementById('btn-blackhole');
  btnBh?.classList.toggle('active', currentMode === 'blackhole');
  const sub = btnBh?.querySelector('.portal-sublabel');
  if (sub) sub.textContent = currentMode === 'blackhole' ? '← Exit to Universe' : 'Enter the Singularity';
}

function goToStage(index, instant = false) {
  const journey = getCurrentJourney();
  if (index < 0 || index >= journey.length) return;

  if (!instant && stageObjects.length > 0) {
    transitionToStage(index);
    return;
  }

  currentStage = index;
  destroyCurrentStage();
  stageEnterTime = performance.now();
  const stageInfo = journey[index];
  const creator = CREATORS[stageInfo.creator];
  const isBlackHoleActive = currentMode === 'blackhole' && stageInfo.creator === 'bh-active';

  blackHoleOverlay.visible = isBlackHoleActive;

  if (creator) {
    const result = creator(scene);
    if (result?.objects) {
      result.objects.forEach((o) => {
        scene.add(o);
        stageObjects.push(o);
      });
    }
    cameraPosition.copy(result?.cameraPos || new THREE.Vector3(0, 0, 25));
    cameraTarget.copy(result?.cameraTarget || new THREE.Vector3(0, 0, 0));
  } else if (isBlackHoleActive) {
    cameraPosition.set(10, 3, 14);
    cameraTarget.set(0, 0, 0);
  }

  const hideStars = currentMode === 'universe' && (stageInfo.id === 'bigbang' || stageInfo.id === 'plasma');
  stars.visible = !hideStars;

  updateStageUI();

  if (cinematicMode) {
    camera.position.copy(cameraPosition);
    controls.target.copy(cameraTarget);
  }
}

function animateCamera(duration = 2500) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = cameraPosition.clone();
  const endTarget = cameraTarget.clone();
  const startTime = performance.now();
  function tick() {
    const t = Math.min(1, (performance.now() - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 2);
    camera.position.lerpVectors(startPos, endPos, eased);
    controls.target.lerpVectors(startTarget, endTarget, eased);
    if (t < 1) requestAnimationFrame(tick);
  }
  tick();
}

function enterBlackHoleMode() {
  currentMode = 'blackhole';
  currentStage = 0;
  goToStage(0, true);
  animateCamera(2000);
}

function exitBlackHoleMode() {
  currentMode = 'universe';
  currentStage = 0;
  goToStage(0, true);
  animateCamera(2000);
}

// Intro
function runIntro() {
  const overlay = document.getElementById('intro-overlay');
  const title = document.getElementById('intro-title');
  if (!overlay || !title) return;
  overlay.classList.add('visible');
  setTimeout(() => title.classList.add('visible'), 400);
  setTimeout(() => {
    title.classList.remove('visible');
    setTimeout(() => {
      overlay.style.pointerEvents = 'none';
      overlay.style.background = 'transparent';
      overlay.classList.remove('visible');
    }, 1800);
  }, 3500);
}

// UI bindings
document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

document.getElementById('btn-prev').addEventListener('click', () => transitionToStage(currentStage - 1));
document.getElementById('btn-next').addEventListener('click', () => transitionToStage(currentStage + 1));
document.getElementById('btn-play').addEventListener('click', () => {
  isPlaying = !isPlaying;
  document.getElementById('btn-play').textContent = isPlaying ? '⏸ Pause' : '▶ Play';
  if (isPlaying) {
    const advance = () => {
      if (!isPlaying) return;
      const journey = getCurrentJourney();
      if (currentStage < journey.length - 1) {
        transitionToStage(currentStage + 1);
        playInterval = setTimeout(advance, TRANSITION_DURATION + 4000);
      } else {
        isPlaying = false;
        document.getElementById('btn-play').textContent = '▶ Play';
      }
    };
    playInterval = setTimeout(advance, 6500);
  } else if (playInterval) clearTimeout(playInterval);
});

document.getElementById('btn-cinematic')?.addEventListener('click', () => {
  cinematicMode = !cinematicMode;
  document.getElementById('btn-cinematic').textContent = cinematicMode ? '🔒 Locked' : '🖱️ Free Look';
  document.getElementById('btn-cinematic').title = cinematicMode ? 'Lock camera to stage' : 'Free orbit, zoom, pan';
  controls.enabled = !cinematicMode;
  if (cinematicMode) {
    camera.position.copy(cameraPosition);
    controls.target.copy(cameraTarget);
  }
});

document.getElementById('btn-blackhole')?.addEventListener('click', () => {
  if (currentMode === 'blackhole') exitBlackHoleMode();
  else enterBlackHoleMode();
});

// Init — no stage loaded until user clicks
camera.position.copy(cameraPosition);
controls.target.copy(cameraTarget);

let hasInteracted = false;
const startJourney = () => {
  if (!hasInteracted) {
    hasInteracted = true;
    journeyStarted = true;
    goToStage(0);
    controls.enabled = !cinematicMode;
    runIntro();
    document.getElementById('ui')?.classList.add('journey-started');
    document.getElementById('btn-blackhole')?.classList.add('visible');
    document.body.classList.add('journey-started');
    document.removeEventListener('click', startJourney);
    document.removeEventListener('keydown', startJourney);
  }
};
document.addEventListener('click', startJourney);
document.addEventListener('keydown', startJourney);

function animate(time) {
  requestAnimationFrame(animate);

  const stageTime = currentStage >= 0 ? Math.max(0, time - stageEnterTime) : 0;
  const dt = 0.016;
  stageObjects.forEach((obj) => {
    if (obj.userData?.update) obj.userData.update(obj, stageTime);
    if (obj.rotation && !obj.userData?.orbitDist) obj.rotation.y += (obj.userData?.rotSpeed ?? 0) * dt;
  });

  const journey = getCurrentJourney();
  const stageInfo = currentStage >= 0 ? journey[currentStage] : null;
  const isBlackHoleActive = currentMode === 'blackhole' && stageInfo?.creator === 'bh-active';

  if (isBlackHoleActive) {
    updateBlackHoleOverlay();
    overlayMaterial.uniforms.uTime.value = time * 0.001;
    overlayMaterial.uniforms.uCameraPos.value.copy(camera.position);
    overlayMaterial.uniforms.uCameraTarget.value.copy(controls.target);
  }

  filmGrainPass.uniforms.uTime.value = time * 0.001;
  controls.update();
  composer.render();
}

animate(0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  bloomPass.resolution.set(window.innerWidth, window.innerHeight);
});
