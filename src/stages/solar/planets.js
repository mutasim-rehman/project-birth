import * as THREE from 'three';

/**
 * Planet Formation — All eight planets in the solar system
 * Scaled for visibility; real scale would be impossible to show
 */
export function createPlanets(scene) {
  const objects = [];

  const planets = [
    { name: 'Mercury', dist: 2, size: 0.08, color: 0x888877 },
    { name: 'Venus', dist: 2.8, size: 0.15, color: 0xddcc99 },
    { name: 'Earth', dist: 3.6, size: 0.16, color: 0x4488cc },
    { name: 'Mars', dist: 4.5, size: 0.12, color: 0xcc6644 },
    { name: 'Jupiter', dist: 6.5, size: 0.45, color: 0xc9a86c },
    { name: 'Saturn', dist: 9, size: 0.4, color: 0xe8d4a0 },
    { name: 'Uranus', dist: 11, size: 0.2, color: 0x88ccdd },
    { name: 'Neptune', dist: 12.5, size: 0.19, color: 0x4488cc },
  ];

  planets.forEach((p, i) => {
    const geo = new THREE.SphereGeometry(p.size, 24, 24);
    const mat = new THREE.MeshBasicMaterial({ color: p.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.orbitDist = p.dist;
    mesh.userData.orbitAngle = (i / 8) * Math.PI * 2;
    mesh.userData.orbitSpeed = 0.01 - i * 0.0008;
    mesh.userData.update = (obj) => {
      obj.userData.orbitAngle += obj.userData.orbitSpeed;
      obj.position.x = obj.userData.orbitDist * Math.cos(obj.userData.orbitAngle);
      obj.position.z = obj.userData.orbitDist * Math.sin(obj.userData.orbitAngle);
    };
    mesh.position.x = p.dist * Math.cos(mesh.userData.orbitAngle);
    mesh.position.z = p.dist * Math.sin(mesh.userData.orbitAngle);
    objects.push(mesh);
  });

  // Sun
  const sunGeo = new THREE.SphereGeometry(0.5, 48, 48);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  objects.push(sun);

  // Orbits (subtle)
  planets.forEach((p, i) => {
    const orbitGeo = new THREE.RingGeometry(p.dist - 0.02, p.dist + 0.02, 64);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    objects.push(orbit);
  });

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 15, 20),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
