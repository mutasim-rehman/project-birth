import * as THREE from 'three';

/**
 * Recombination — Universe becomes transparent, first light (CMB)
 */
export function createRecombination(scene) {
  const objects = [];

  const count = 18000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const warm = new THREE.Color(0xffeedd);
  const orange = new THREE.Color(0xffaa66);
  const red = new THREE.Color(0xcc6633);

  for (let i = 0; i < count; i++) {
    const r = 2 + Math.pow(Math.random(), 0.6) * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const t = Math.random();
    const c = warm.clone().lerp(t < 0.5 ? orange : red, t);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const light = new THREE.Points(geo, mat);
  light.userData.rotSpeed = 0.005;
  objects.push(light);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 1, 20),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
