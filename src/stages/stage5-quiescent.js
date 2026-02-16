import * as THREE from 'three';

/**
 * Stage 5: Quiescent — Ultra-realistic
 * Dim disk, sparse stellar orbits, quiet dominance
 */
export function createStage5(scene) {
  const objects = [];

  // Event horizon
  const horizonGeo = new THREE.SphereGeometry(0.5, 128, 128);
  const horizonMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.FrontSide,
  });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  objects.push(horizon);

  // Faint residual accretion disk
  const diskGeo = new THREE.RingGeometry(0.75, 2.8, 96);
  const diskMat = new THREE.MeshBasicMaterial({
    color: 0x442211,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = Math.PI / 2;
  disk.userData.rotSpeed = 0.015;
  objects.push(disk);

  // Orbiting stars / stellar cluster (GOD MODE)
  const starCount = 250;
  const pos = new Float32Array(starCount * 3);
  const col = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 2.5 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const incl = (Math.random() - 0.5) * 0.8;
    pos[i * 3] = r * Math.cos(theta) * Math.cos(incl);
    pos[i * 3 + 1] = r * Math.sin(incl);
    pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(incl);

    const warm = new THREE.Color(0xffddbb);
    const cool = new THREE.Color(0xbbaa99);
    const c = warm.clone().lerp(cool, Math.random());
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });
  const orbitStars = new THREE.Points(starGeo, starMat);
  orbitStars.userData.rotSpeed = 0.006;
  objects.push(orbitStars);

  // Subtle gravitational well glow
  const glowGeo = new THREE.SphereGeometry(1.2, 48, 48);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x221108,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  objects.push(glow);

  return {
    objects,
    cameraPos: new THREE.Vector3(7, 2, 9),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
