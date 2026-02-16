import * as THREE from 'three';

/**
 * Stage 3: Awakening — Ultra-realistic
 * Event horizon emerges, accretion disk forms, first relativistic light
 */
export function createStage3(scene) {
  const objects = [];

  // Event horizon — pure black
  const horizonGeo = new THREE.SphereGeometry(0.55, 128, 128);
  const horizonMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.FrontSide,
  });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  objects.push(horizon);

  // Primary accretion disk — gradient + Doppler
  const diskSegs = 128;
  const innerR = 0.8;
  const outerR = 4;
  const diskGeo = new THREE.RingGeometry(innerR, outerR, diskSegs);
  const posAttr = diskGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const r = Math.sqrt(x * x + z * z);
    const t = (r - innerR) / (outerR - innerR);
    const ang = Math.atan2(z, x);
    const doppler = (Math.cos(ang) + 1) * 0.5;
    const dopplerPow = Math.pow(doppler, 0.5);

    const hot = new THREE.Color(0xffffdd);
    const cool = new THREE.Color(0xff6633);
    const base = hot.clone().lerp(cool, t * 0.8);
    base.multiplyScalar(0.6 + 0.4 * dopplerPow);
    base.lerp(new THREE.Color(0xffffff), dopplerPow * 0.25);

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

  // Inner hot rim (ISCO region)
  const rimGeo = new THREE.RingGeometry(0.6, 1.2, 64);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.userData.rotSpeed = 0.35;
  objects.push(rim);

  // Falling particles (GOD MODE)
  const partCount = 6000;
  const partPos = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount; i++) {
    const r = 0.9 + Math.random() * 4.5;
    const theta = Math.random() * Math.PI * 2;
    partPos[i * 3] = r * Math.cos(theta);
    partPos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
    partPos[i * 3 + 2] = r * Math.sin(theta);
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const partMat = new THREE.PointsMaterial({
    size: 0.06,
    color: 0xffdd88,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(partGeo, partMat);
  particles.userData.rotSpeed = 0.18;
  objects.push(particles);

  return {
    objects,
    cameraPos: new THREE.Vector3(6, 3, 11),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
