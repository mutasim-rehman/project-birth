import * as THREE from 'three';

/**
 * First Stars — Population III, cosmic reionization
 */
export function createFirstStars(scene) {
  const objects = [];

  // Stellar nurseries
  const nebulaCount = 15000;
  const pos = new Float32Array(nebulaCount * 3);
  const col = new Float32Array(nebulaCount * 3);
  const purple = new THREE.Color(0x5544aa);
  const blue = new THREE.Color(0x4488cc);

  for (let i = 0; i < nebulaCount; i++) {
    const r = 2 + Math.pow(Math.random(), 0.7) * 14;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const c = purple.clone().lerp(blue, Math.random());
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const nebGeo = new THREE.BufferGeometry();
  nebGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  nebGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const nebMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nebula = new THREE.Points(nebGeo, nebMat);
  nebula.userData.rotSpeed = 0.01;
  objects.push(nebula);

  // First stars (bright points)
  const starCount = 300;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 3 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.25,
    color: 0xffffdd,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const firstStars = new THREE.Points(starGeo, starMat);
  objects.push(firstStars);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 2, 18),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
