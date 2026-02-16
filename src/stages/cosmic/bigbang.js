import * as THREE from 'three';

/**
 * Big Bang — The singularity, the beginning
 */
export function createBigBang(scene) {
  const objects = [];

  // Intense central burst
  const burstCount = 15000;
  const pos = new Float32Array(burstCount * 3);
  const col = new Float32Array(burstCount * 3);
  for (let i = 0; i < burstCount; i++) {
    const r = Math.pow(Math.random(), 0.4) * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const t = r / 20;
    const white = new THREE.Color(0xffffff);
    const orange = new THREE.Color(0xff6600);
    const red = new THREE.Color(0xff2200);
    const c = white.clone().lerp(orange, t * 0.5).lerp(red, t * 0.5);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const burst = new THREE.Points(geo, mat);
  burst.userData.rotSpeed = 0.02;
  objects.push(burst);

  // Singularity core
  const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.userData.update = (obj, t) => {
    obj.material.opacity = 0.7 + Math.sin(t * 0.005) * 0.2;
  };
  objects.push(core);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 0, 25),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
