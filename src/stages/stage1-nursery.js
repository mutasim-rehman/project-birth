import * as THREE from 'three';

/**
 * Stage 1: Cosmic Nursery — Ultra-realistic
 * Volumetric nebula, filaments, density waves, layered gas clouds
 */
export function createStage1(scene) {
  const objects = [];

  // Layer 1: Distant diffuse nebula (GOD MODE: max density)
  const farCount = 20000;
  const farPos = new Float32Array(farCount * 3);
  const farCol = new Float32Array(farCount * 3);
  const farSize = new Float32Array(farCount);

  const purple = new THREE.Color(0x5533aa);
  const blue = new THREE.Color(0x2255aa);
  const magenta = new THREE.Color(0x8844aa);
  const cyan = new THREE.Color(0x336699);

  for (let i = 0; i < farCount; i++) {
    const r = 3 + Math.pow(Math.random(), 1.5) * 18;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.7 + Math.PI * 0.15;
    farPos[i * 3] = r * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 6;
    farPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 4;
    farPos[i * 3 + 2] = r * Math.cos(phi) + (Math.random() - 0.5) * 4;

    const t = Math.random();
    const c = t < 0.33 ? purple : t < 0.66 ? blue : t < 0.85 ? magenta : cyan;
    const tint = purple.clone().lerp(c, 0.6);
    farCol[i * 3] = tint.r;
    farCol[i * 3 + 1] = tint.g;
    farCol[i * 3 + 2] = tint.b;

    farSize[i] = 0.08 + Math.random() * 0.35;
  }

  const farGeo = new THREE.BufferGeometry();
  farGeo.setAttribute('position', new THREE.BufferAttribute(farPos, 3));
  farGeo.setAttribute('color', new THREE.BufferAttribute(farCol, 3));
  farGeo.setAttribute('size', new THREE.BufferAttribute(farSize, 1));

  const farMat = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: createSoftCircleTexture(),
  });
  const nebulaFar = new THREE.Points(farGeo, farMat);
  nebulaFar.userData.rotSpeed = 0.006;
  objects.push(nebulaFar);

  // Layer 2: Filament structures (dense tendrils)
  const filCount = 10000;
  const filPos = new Float32Array(filCount * 3);
  const filCol = new Float32Array(filCount * 3);

  for (let i = 0; i < filCount; i++) {
    const spine = Math.random();
    const theta = spine * Math.PI * 4 + Math.random() * 2;
    const r = 2 + spine * 10 + Math.sin(theta * 2) * 3;
    filPos[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * 1.5;
    filPos[i * 3 + 1] = r * Math.sin(theta) * 0.4 + (Math.random() - 0.5) * 2;
    filPos[i * 3 + 2] = (Math.random() - 0.5) * 3;

    const hot = new THREE.Color(0xcc88ff);
    const cool = new THREE.Color(0x6688cc);
    const c = hot.clone().lerp(cool, Math.random() * 0.5);
    filCol[i * 3] = c.r;
    filCol[i * 3 + 1] = c.g;
    filCol[i * 3 + 2] = c.b;
  }

  const filGeo = new THREE.BufferGeometry();
  filGeo.setAttribute('position', new THREE.BufferAttribute(filPos, 3));
  filGeo.setAttribute('color', new THREE.BufferAttribute(filCol, 3));
  const filMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const filaments = new THREE.Points(filGeo, filMat);
  filaments.userData.rotSpeed = 0.012;
  objects.push(filaments);

  // Central density core (volumetric glow)
  const coreGeo = new THREE.SphereGeometry(2.5, 48, 48);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x332255,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const coreGlow = new THREE.Mesh(coreGeo, coreMat);
  objects.push(coreGlow);

  const innerCoreGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const innerCoreMat = new THREE.MeshBasicMaterial({
    color: 0x553388,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  innerCore.userData.update = (obj, time) => {
    obj.material.opacity = 0.15 + Math.sin(time * 0.0015) * 0.08;
  };
  objects.push(innerCore);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 2, 20),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}

function createSoftCircleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.5)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.2)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
