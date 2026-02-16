import * as THREE from 'three';

/**
 * Stage 4: Active Phase — Rendered by BlackHoleShader overlay
 * This file provides no mesh objects; the raymarched shader handles everything.
 */
export function createStage4(scene) {
  return {
    objects: [],
    cameraPos: new THREE.Vector3(8, 2, 12),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
