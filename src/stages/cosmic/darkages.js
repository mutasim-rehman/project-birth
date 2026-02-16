import * as THREE from 'three';

/**
 * Dark Ages — Cooling, cosmic web forming, first structures
 */
export function createDarkAges(scene) {
  const objects = [];

  // Cosmic web filaments
  const filCount = 12000;
  const pos = new Float32Array(filCount * 3);
  const col = new Float32Array(filCount * 3);
  const dim = new THREE.Color(0x222244);
  const faint = new THREE.Color(0x444466);

  for (let i = 0; i < filCount; i++) {
    const spine = Math.random();
    const theta = spine * Math.PI * 6 + Math.random() * 3;
    const r = 3 + spine * 12 + Math.sin(theta * 2) * 4;
    pos[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * 2;
    pos[i * 3 + 1] = r * Math.sin(theta) * 0.5 + (Math.random() - 0.5) * 2;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 4;

    const c = dim.clone().lerp(faint, Math.random() * 0.5);
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
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const web = new THREE.Points(geo, mat);
  web.userData.rotSpeed = 0.003;
  objects.push(web);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 3, 24),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
