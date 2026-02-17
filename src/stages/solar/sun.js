import * as THREE from 'three';

/**
 * Sun Ignition — Fusion begins, star is born
 * Sun: G2V, Teff ~5778 K, blackbody peak ~500 nm
 */
export function createSun(scene) {
  const objects = [];

  const sunGeo = new THREE.SphereGeometry(1.2, 64, 64);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xfff9eb,
    transparent: true,
    opacity: 0.95,
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  objects.push(sun);

  // Corona / limb glow
  const coronaGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xffdd66,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  corona.userData.update = (obj, t) => {
    obj.material.opacity = 0.35 + Math.sin(t * 0.002) * 0.1;
  };
  objects.push(corona);

  // Remnant disk
  const diskGeo = new THREE.RingGeometry(1.5, 4, 64);
  const diskMat = new THREE.MeshBasicMaterial({
    color: 0x664422,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  });
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = Math.PI / 2;
  disk.userData.rotSpeed = 0.02;
  objects.push(disk);

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 2, 10),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
