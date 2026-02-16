import * as THREE from 'three';

/**
 * Stage 2: Seed Formation — Ultra-realistic
 * Dense spiraling inflow, turbulent eddies, hot central collapse
 */
export function createStage2(scene) {
  const objects = [];

  // Dense accretion flow — spiral arms (GOD MODE)
  const count = 25000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  const red = new THREE.Color(0xcc2211);
  const orange = new THREE.Color(0xff6633);
  const yellow = new THREE.Color(0xffaa44);
  const white = new THREE.Color(0xffeedd);

  for (let i = 0; i < count; i++) {
    const r = 0.8 + Math.pow(Math.random(), 0.7) * 9;
    const theta = Math.random() * Math.PI * 2;
    const spiral = Math.sin(r * 1.2) * 1.5 + Math.cos(r * 0.7) * 1.2;
    pos[i * 3] = (r + spiral) * Math.cos(theta);
    pos[i * 3 + 1] = (r + spiral * 0.6) * Math.sin(theta) + (Math.random() - 0.5) * 0.5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

    const t = 1 - r / 10;
    const c = red.clone().lerp(t < 0.5 ? orange : t < 0.8 ? yellow : white, t);
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
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const cloud = new THREE.Points(geo, mat);
  cloud.userData.rotSpeed = 0.045;
  objects.push(cloud);

  // Hot collapsing core
  const coreGeo = new THREE.SphereGeometry(1.0, 48, 48);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffbb55,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.userData.update = (obj, time) => {
    obj.material.opacity = 0.5 + Math.sin(time * 0.003) * 0.2;
    obj.scale.setScalar(0.95 + Math.sin(time * 0.002) * 0.05);
  };
  objects.push(core);

  // Inner intense glow
  const glowGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.userData.update = (obj, time) => {
    obj.material.opacity = 0.25 + Math.sin(time * 0.004) * 0.15;
  };
  objects.push(glow);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 1.5, 14),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
