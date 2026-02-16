import * as THREE from 'three';

/**
 * Planetesimals — Rocks clumping, building blocks of planets
 */
export function createPlanetesimals(scene) {
  const objects = [];

  const count = 8000;
  const pos = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 1.5 + Math.pow(Math.random(), 0.6) * 8;
    const theta = Math.random() * Math.PI * 2;
    const incl = (Math.random() - 0.5) * 0.3;
    pos[i * 3] = r * Math.cos(theta) * Math.cos(incl);
    pos[i * 3 + 1] = r * Math.sin(incl);
    pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(incl);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x886655,
    transparent: true,
    opacity: 0.9,
  });
  const rocks = new THREE.Points(geo, mat);
  rocks.userData.rotSpeed = 0.03;
  objects.push(rocks);

  // Sun
  const sunGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  objects.push(sun);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 6, 12),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
