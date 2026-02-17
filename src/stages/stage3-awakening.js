import * as THREE from 'three';

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
const PARTICLE_COUNT = 6000;
const PARTICLE_R_MIN = 0.9;
const PARTICLE_R_SPAN = 4.5;

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
    opacity: 0.95,
  });
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = Math.PI / 2;
  disk.userData.rotSpeed = 0.2;
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
    mat.opacity = 0.8 + Math.sin(time * 0.002) * 0.1;
    const scale = 1 + Math.sin(time * 0.0015) * 0.02;
    obj.scale.set(scale, scale, 1);
  };
  objects.push(rim);

  // Falling particles — store initial positions for inward drift
  const partPos = new Float32Array(PARTICLE_COUNT * 3);
  const initialPos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = PARTICLE_R_MIN + Math.random() * PARTICLE_R_SPAN;
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = (Math.random() - 0.5) * 0.25;
    partPos[i * 3] = initialPos[i * 3] = x;
    partPos[i * 3 + 1] = initialPos[i * 3 + 1] = y;
    partPos[i * 3 + 2] = initialPos[i * 3 + 2] = z;
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const partMat = new THREE.PointsMaterial({
    size: 0.06,
    color: 0xffaa44,  // Orange particles
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(partGeo, partMat);
  particles.userData.rotSpeed = 0.18;
  particles.userData.initialPos = initialPos;
  particles.userData.update = (obj, time) => {
    const pos = obj.geometry.attributes.position;
    const initial = obj.userData.initialPos;
    // Slow inward drift (falling toward horizon); clamp so they don't vanish
    const drift = Math.max(0.35, 1 - time * 0.000015);
    for (let i = 0; i < initial.length; i += 3) {
      pos.array[i] = initial[i] * drift;
      pos.array[i + 1] = initial[i + 1] * drift;
      pos.array[i + 2] = initial[i + 2] * drift;
    }
    pos.needsUpdate = true;
    obj.material.opacity = 0.78 + Math.sin(time * 0.003) * 0.12;
  };
  objects.push(particles);

  return {
    objects,
    cameraPos: new THREE.Vector3(6, 3, 11),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
