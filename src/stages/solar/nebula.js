import * as THREE from 'three';

/**
 * Solar Nebula — Protostellar disk, dust and gas
 */
export function createSolarNebula(scene) {
  const objects = [];

  const count = 20000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 0.8 + Math.pow(Math.random(), 0.5) * 10;
    const theta = Math.random() * Math.PI * 2;
    const h = (Math.random() - 0.5) * 1.5;
    pos[i * 3] = r * Math.cos(theta);
    pos[i * 3 + 1] = h;
    pos[i * 3 + 2] = r * Math.sin(theta);

    const t = r / 11;
    const brown = new THREE.Color(0x886644);
    const tan = new THREE.Color(0xccaa88);
    const c = brown.clone().lerp(tan, t);
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
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nebula = new THREE.Points(geo, mat);
  nebula.userData.rotSpeed = 0.04;
  objects.push(nebula);

  // Central protostar
  const starGeo = new THREE.SphereGeometry(0.6, 48, 48);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xffcc66,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const protostar = new THREE.Mesh(starGeo, starMat);
  protostar.userData.update = (obj, t) => {
    obj.material.opacity = 0.7 + Math.sin(t * 0.003) * 0.15;
  };
  objects.push(protostar);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 5, 14),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
