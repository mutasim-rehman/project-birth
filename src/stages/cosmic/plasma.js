import * as THREE from 'three';

/**
 * Plasma Era — Hot opaque soup, photons scattering
 */
export function createPlasma(scene) {
  const objects = [];

  const count = 25000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const orange = new THREE.Color(0xff4400);
  const yellow = new THREE.Color(0xffcc00);
  const white = new THREE.Color(0xffffdd);

  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.5) * 18;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const t = Math.random();
    const c = orange.clone().lerp(t < 0.5 ? yellow : white, t * 0.8);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const plasma = new THREE.Points(geo, mat);
  plasma.userData.rotSpeed = 0.008;
  plasma.userData.update = (obj, t) => {
    obj.material.opacity = 0.85 + Math.sin(t * 0.002) * 0.1;
  };
  objects.push(plasma);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 2, 22),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
