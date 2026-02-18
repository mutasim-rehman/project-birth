import * as THREE from 'three';

// Organic noise — deterministic, non-periodic variation (avoids mechanical sine waves)
function noise1d(t) {
  const x = Math.sin(t * 12.9898) * 43758.5453;
  return (x - Math.floor(x));
}
function noise2d(t, s) {
  const x = Math.sin(t * 12.9898 + s * 78.233) * 43758.5453;
  return (x - Math.floor(x));
}
// Smoothed noise for less jitter
function smoothNoise(t, scale = 1) {
  const tt = t * scale;
  const n0 = noise1d(Math.floor(tt));
  const n1 = noise1d(Math.floor(tt) + 1);
  const f = tt - Math.floor(tt);
  const smooth = f * f * (3 - 2 * f); // smoothstep
  return n0 + (n1 - n0) * smooth;
}

// Tunable constants
const HORIZON_RADIUS = 0.55;
const HORIZON_SEGMENTS = 64;
const PHOTON_SPHERE_RADIUS = 0.58;
const PHOTON_SPHERE_OPACITY = 0.06;
const DISK_INNER_R = 0.8;
const DISK_OUTER_R = 4;
const DISK_SEGMENTS = 128;
const RIM_INNER = 0.6;
const RIM_OUTER = 1.2;
const RIM_SEGMENTS = 64;
const PARTICLE_COUNT = 2800;
const PARTICLE_R_MIN = 0.9;
const PARTICLE_R_SPAN = 4.5;

// Visual storytelling / comfort:
// we treat time as milliseconds since stage start and fade effects in
// over this duration to avoid harsh pops or flicker.
const AWAKENING_DURATION_MS = 12000;
// Global clamp for how intense / bright the active phase can get
const ACTIVE_INTENSITY = 0.65;

/**
 * Stage 3: Awakening — Ultra-realistic
 * Event horizon emerges, accretion disk forms, first relativistic light
 * @param {THREE.Scene} scene - Scene (accepted for API consistency with other stages)
 */
export function createStage3(scene) {
  const objects = [];

  // Event horizon — pure black
  const horizonGeo = new THREE.SphereGeometry(HORIZON_RADIUS, HORIZON_SEGMENTS, HORIZON_SEGMENTS);
  const horizonMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.FrontSide,
  });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  objects.push(horizon);

  // Photon sphere — subtle edge glow just outside horizon (Interstellar style)
  const photonGeo = new THREE.SphereGeometry(PHOTON_SPHERE_RADIUS, HORIZON_SEGMENTS, HORIZON_SEGMENTS);
  const photonMat = new THREE.MeshBasicMaterial({
    color: 0xfaf5e6,  // Warm white
    side: THREE.FrontSide,
    transparent: true,
    opacity: PHOTON_SPHERE_OPACITY * 1.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const photonSphere = new THREE.Mesh(photonGeo, photonMat);
  photonSphere.userData.baseOpacity = photonMat.opacity;
  photonSphere.userData.update = (obj, time) => {
    const mat = obj.material;
    const progress = Math.min(1, time / AWAKENING_DURATION_MS);
    // Photon emerges early (0–45% of timeline), then settles — first sign of the birth
    const photonProgress = Math.max(0, Math.min(1, (progress - 0) / 0.45));
    // Gentle variation — readable photon glow, not jittery
    const n1 = smoothNoise(time * 0.0003, 1);
    const pulse = 0.96 + (n1 - 0.5) * 0.05;
    mat.opacity =
      obj.userData.baseOpacity *
      (0.2 + 0.6 * photonProgress) *
      pulse *
      ACTIVE_INTENSITY;

    // Subtle scale-up — slight irregular swell, not mechanical
    const scaleWobble = (smoothNoise(time * 0.0003, 1) - 0.5) * 0.02;
    const scale = 1 + 0.02 * photonProgress + scaleWobble;
    obj.scale.set(scale, scale, scale);
  };
  objects.push(photonSphere);

  // Primary accretion disk — gradient + Doppler
  const diskGeo = new THREE.RingGeometry(DISK_INNER_R, DISK_OUTER_R, DISK_SEGMENTS);
  const posAttr = diskGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const r = Math.sqrt(x * x + z * z);
    const t = (r - DISK_INNER_R) / (DISK_OUTER_R - DISK_INNER_R);
    const ang = Math.atan2(z, x);
    // Doppler-inspired: approaching side brighter, receding dimmer
    const doppler = (Math.cos(ang) + 1) * 0.5;
    const dopplerPow = Math.pow(doppler, 0.5);

        // Interstellar color palette - fiery orange/yellow
        const hot = new THREE.Color(0xffffd9);      // Bright white-yellow
        const mid = new THREE.Color(0xff9933);      // Orange
        const cool = new THREE.Color(0xcc4019);     // Deep red-orange
        let base;
        if (t < 0.4) {
          base = hot.clone().lerp(mid, t / 0.4);
        } else {
          base = mid.clone().lerp(cool, (t - 0.4) / 0.6);
        }
        base.multiplyScalar(0.5 + 0.5 * dopplerPow);
        base.lerp(new THREE.Color(0xffffff), dopplerPow * 0.3);

    colors[i * 3] = base.r;
    colors[i * 3 + 1] = base.g;
    colors[i * 3 + 2] = base.b;
  }
  diskGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const diskMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = Math.PI / 2;
  disk.userData.rotSpeed = 0.2;
  disk.userData.baseOpacity = diskMat.opacity;
  disk.userData.update = (obj, time) => {
    const mat = obj.material;
    const progress = Math.min(1, time / AWAKENING_DURATION_MS);
    // Disk condenses later (15–75%) — matter spiraling in, not instant
    const diskProgress = Math.max(0, Math.min(1, (progress - 0.15) / 0.6));
    // Subtle density variation — readable, not distracting
    const densityWave = 0.94 + smoothNoise(time * 0.0004, 1) * 0.08;
    const target = 0.35 + 0.4 * diskProgress;
    mat.opacity = obj.userData.baseOpacity * target * densityWave * ACTIVE_INTENSITY;

    // Very gentle tilt — disk settling, not wobbling
    const tiltBase = (smoothNoise(time * 0.00015, 1) - 0.5) * 0.03 * diskProgress;
    obj.rotation.z = tiltBase;
  };
  objects.push(disk);

  // Inner hot rim (ISCO region) — inner orbits faster, brighter
  const rimGeo = new THREE.RingGeometry(RIM_INNER, RIM_OUTER, RIM_SEGMENTS);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0xffdd88,  // Bright yellow-orange
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.userData.rotSpeed = 0.35;
  rim.userData.update = (obj, time) => {
    const mat = obj.material;
    const progress = Math.min(1, time / AWAKENING_DURATION_MS);
    // Inner rim ignites later (30–85%) — last to light as matter compresses
    const rimProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.55));
    // Rare, subtle flares — readable glow, not noisy spikes
    const flare = smoothNoise(time * 0.0005, 1) > 0.96 ? 0.08 : 0;
    mat.opacity =
      (0.45 + 0.3 * rimProgress + flare + (smoothNoise(time * 0.0004, 1) - 0.5) * 0.03) *
      ACTIVE_INTENSITY;

    // Steady expansion — clear, not jittery
    const scaleBase = 1 + 0.06 * rimProgress;
    const scaleWobble = (smoothNoise(time * 0.0003 + 50, 1) - 0.5) * 0.015;
    obj.scale.set(scaleBase + scaleWobble, scaleBase + scaleWobble, 1);
  };
  objects.push(rim);

  // Falling particles — store initial positions + per-particle variance for realism
  const partPos = new Float32Array(PARTICLE_COUNT * 3);
  const initialPos = new Float32Array(PARTICLE_COUNT * 3);
  const partPhase = new Float32Array(PARTICLE_COUNT);  // drift timing variance
  const partDriftRate = new Float32Array(PARTICLE_COUNT); // inner falls faster
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = PARTICLE_R_MIN + Math.random() * PARTICLE_R_SPAN;
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = (Math.random() - 0.5) * 0.25;
    partPos[i * 3] = initialPos[i * 3] = x;
    partPos[i * 3 + 1] = initialPos[i * 3 + 1] = y;
    partPos[i * 3 + 2] = initialPos[i * 3 + 2] = z;
    partPhase[i] = Math.random();  // when this particle "starts" falling (0–1)
    partDriftRate[i] = 0.7 + 0.6 * (1 - (r - PARTICLE_R_MIN) / PARTICLE_R_SPAN); // inner = faster
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const partMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffaa44,  // Orange particles
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(partGeo, partMat);
  particles.userData.rotSpeed = 0.18;
  particles.userData.initialPos = initialPos;
  particles.userData.partPhase = partPhase;
  particles.userData.partDriftRate = partDriftRate;
  particles.userData.update = (obj, time) => {
    const pos = obj.geometry.attributes.position;
    const initial = obj.userData.initialPos;
    const phases = obj.userData.partPhase;
    const driftRates = obj.userData.partDriftRate;
    const progress = Math.min(1, time / AWAKENING_DURATION_MS);
    // Particles start falling at different moments (20–95% of timeline)
    const fallStart = 0.2;
    const fallSpan = 0.75;

    for (let i = 0; i < initial.length; i += 3) {
      const pIdx = i / 3;
      const phase = phases[pIdx];
      const rate = driftRates[pIdx];
      // When does this particle begin its inward fall?
      const thisProgress = Math.max(0, (progress - fallStart - phase * fallSpan * 0.5) / (1 - fallStart));
      const thisDrift = 1 - 0.32 * Math.min(1, thisProgress * rate);
      const vertNoise = (smoothNoise(time * 0.0008 + pIdx * 0.05, 1) - 0.5) * 0.02 * progress;
      pos.array[i] = initial[i] * thisDrift;
      pos.array[i + 1] = initial[i + 1] * thisDrift + vertNoise;
      pos.array[i + 2] = initial[i + 2] * thisDrift;
    }
    pos.needsUpdate = true;
    // Brightness — peaks mid-awakening, subtle variation
    const midPhase = Math.sin(progress * Math.PI);
    const flicker = (smoothNoise(time * 0.0015, 1) - 0.5) * 0.05 * (0.5 + 0.5 * midPhase);
    obj.material.opacity =
      (0.25 + 0.35 * midPhase + flicker) * ACTIVE_INTENSITY;
  };
  objects.push(particles);

  return {
    objects,
    cameraPos: new THREE.Vector3(6, 3, 11),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
