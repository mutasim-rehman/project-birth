import * as THREE from 'three';

/**
 * Stage 4: Active Phase — BlackHoleShader overlay + infalling debris
 * The "mess" feeding the black hole: debris spiraling in, visible as it crosses the lensed view
 */
const DEBRIS_COUNT = 1200;
const DEBRIS_R_MIN = 2;
const DEBRIS_R_SPAN = 14;

export function createStage4(scene) {
  const objects = [];

  // Infalling debris — the mess becoming the black hole (renders on top of shader overlay)
  const pos = new Float32Array(DEBRIS_COUNT * 3);
  const initialR = new Float32Array(DEBRIS_COUNT);
  const initialTheta = new Float32Array(DEBRIS_COUNT);
  const initialIncl = new Float32Array(DEBRIS_COUNT);
  const phaseOffset = new Float32Array(DEBRIS_COUNT);
  const orbitSpeed = new Float32Array(DEBRIS_COUNT); // inner = faster (Kepler-like)
  for (let i = 0; i < DEBRIS_COUNT; i++) {
    const r = DEBRIS_R_MIN + Math.random() * DEBRIS_R_SPAN;
    const theta = Math.random() * Math.PI * 2;
    const incl = (Math.random() - 0.5) * 0.6;
    initialR[i] = r;
    initialTheta[i] = theta;
    initialIncl[i] = incl;
    phaseOffset[i] = Math.random() * Math.PI * 2;
    orbitSpeed[i] = 0.15 / Math.sqrt(r); // Kepler: faster closer in

    pos[i * 3] = r * Math.cos(theta) * Math.cos(incl);
    pos[i * 3 + 1] = r * Math.sin(incl) * 0.3;
    pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(incl);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xffaa66,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const debris = new THREE.Points(geo, mat);
  debris.renderOrder = 1000; // Draw on top of BlackHoleShader overlay
  debris.userData.initialR = initialR;
  debris.userData.initialTheta = initialTheta;
  debris.userData.initialIncl = initialIncl;
  debris.userData.phaseOffset = phaseOffset;
  debris.userData.orbitSpeed = orbitSpeed;
  debris.userData.update = (obj, time) => {
    const posAttr = obj.geometry.attributes.position;
    const initR = obj.userData.initialR;
    const initTheta = obj.userData.initialTheta;
    const initIncl = obj.userData.initialIncl;
    const phaseOff = obj.userData.phaseOffset;
    const oSpeed = obj.userData.orbitSpeed;
    const t = time * 0.001;

    for (let i = 0; i < DEBRIS_COUNT; i++) {
      const r0 = initR[i];
      const theta0 = initTheta[i];
      const incl = initIncl[i];
      const phase = phaseOff[i];
      const speed = oSpeed[i];
      const angle = theta0 + t * speed + phase;
      // Spiral inward slowly — matter feeding the black hole
      const r = r0 * Math.pow(0.9995, t * 0.5);
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      posAttr.array[i * 3] = x * Math.cos(incl);
      posAttr.array[i * 3 + 1] = r * 0.03 * Math.sin(incl);
      posAttr.array[i * 3 + 2] = z * Math.cos(incl);
    }
    posAttr.needsUpdate = true;
    obj.material.opacity = 0.6 + Math.sin(t * 0.8) * 0.1;
  };
  objects.push(debris);

  return {
    objects,
    cameraPos: new THREE.Vector3(8, 2, 12),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
