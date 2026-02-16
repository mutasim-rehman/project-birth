import * as THREE from 'three';

/**
 * Galaxy Formation — Spiral arms, mergers
 */
export function createGalaxy(scene) {
  const objects = [];

  const armCount = 25000;
  const pos = new Float32Array(armCount * 3);
  const col = new Float32Array(armCount * 3);

  for (let i = 0; i < armCount; i++) {
    const r = 0.5 + Math.pow(Math.random(), 0.6) * 12;
    const theta = Math.random() * Math.PI * 2 + r * 0.8;
    const arm = Math.floor((theta / (Math.PI * 2)) * 4) % 4;
    const spiral = Math.sin(r * 0.5) * 2;
    pos[i * 3] = (r + spiral) * Math.cos(theta);
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    pos[i * 3 + 2] = (r + spiral) * Math.sin(theta);

    const t = r / 12;
    const blue = new THREE.Color(0x4488cc);
    const white = new THREE.Color(0xffffdd);
    const c = blue.clone().lerp(white, t * 0.5);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const galaxy = new THREE.Points(geo, mat);
  galaxy.userData.rotSpeed = 0.015;
  objects.push(galaxy);

  // Core
  const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffdd88,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  objects.push(core);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 8, 18),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
