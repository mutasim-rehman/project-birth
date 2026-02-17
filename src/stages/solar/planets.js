import * as THREE from 'three';

/**
 * Planet Formation — Scientifically accurate solar system
 * Real orbital elements, periods, sizes, eccentricities, inclinations
 * Data: NASA JPL, IAU
 */

// Orbital elements: a (AU), e, T (years), radius (km), incl (deg), color
// Mean longitude at epoch (for initial position)
const PLANET_DATA = [
  { name: 'Mercury', a: 0.387098, e: 0.2056, T: 0.240846, radius: 2439.7, incl: 7.0, color: 0x8c7853 },
  { name: 'Venus', a: 0.723332, e: 0.0068, T: 0.615198, radius: 6051.8, incl: 3.4, color: 0xe6e6b4 },
  { name: 'Earth', a: 1.0, e: 0.0167, T: 1.0, radius: 6371, incl: 0, color: 0x4a90c8 },
  { name: 'Mars', a: 1.52366, e: 0.0934, T: 1.88085, radius: 3389.5, incl: 1.85, color: 0xc1440e },
  { name: 'Jupiter', a: 5.20336, e: 0.0484, T: 11.862, radius: 69911, incl: 1.3, color: 0xc88b3a },
  { name: 'Saturn', a: 9.53707, e: 0.0542, T: 29.457, radius: 58232, incl: 2.49, color: 0xe5d5a0 },
  { name: 'Uranus', a: 19.1913, e: 0.0472, T: 84.02, radius: 25362, incl: 0.77, color: 0x4fd0e7 },
  { name: 'Neptune', a: 30.0690, e: 0.0086, T: 164.8, radius: 24622, incl: 1.77, color: 0x4166f5 },
];

const SUN_RADIUS_KM = 696000;

// Display scale: 1 AU = DIST_SCALE units. Neptune at 30 AU = 30*DIST_SCALE
const DIST_SCALE = 4;
// Size scale: Jupiter (69911 km) -> 0.5 units. scale = 0.5/69911
const SIZE_SCALE = 0.6 / 69911;

// Time: 1 real second = TIME_SCALE years. 60 sec = 1 Earth year
const TIME_SCALE = 1 / 60;

// Solve Kepler's equation M = E - e*sin(E) for E (eccentric anomaly)
function solveKepler(M, e, tol = 1e-8) {
  let E = M;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

// Orbital position from mean anomaly, returns {x, y, z} in ecliptic coords
function orbitalPosition(a, e, incDeg, M) {
  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));
  const inc = (incDeg * Math.PI) / 180;
  const x = r * Math.cos(nu);
  const z = r * Math.sin(nu);
  const y = -z * Math.sin(inc);
  const zRot = z * Math.cos(inc);
  return { x: x * DIST_SCALE, y, z: zRot * DIST_SCALE };
}

export function createPlanets(scene) {
  const objects = [];
  let simStartMs = null;

  PLANET_DATA.forEach((p) => {
    const radius = p.radius * SIZE_SCALE;
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: p.color });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.userData.orbit = {
      a: p.a,
      e: p.e,
      T: p.T,
      incl: p.incl,
    };
    mesh.userData.update = (obj, timeMs) => {
      if (simStartMs === null) simStartMs = timeMs;
      const t = (timeMs - simStartMs) / 1000;
      const years = t * TIME_SCALE;
      const M = ((years / obj.userData.orbit.T) % 1) * Math.PI * 2;
      const pos = orbitalPosition(
        obj.userData.orbit.a,
        obj.userData.orbit.e,
        obj.userData.orbit.incl,
        M
      );
      obj.position.set(pos.x, pos.y, pos.z);
    };

    const pos = orbitalPosition(p.a, p.e, p.incl, 0);
    mesh.position.set(pos.x, pos.y, pos.z);
    objects.push(mesh);
  });

  // Sun — real relative size (scaled same as planets)
  const sunRadius = SUN_RADIUS_KM * SIZE_SCALE;
  const sunGeo = new THREE.SphereGeometry(sunRadius, 64, 64);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff5e6 });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  objects.push(sun);

  // Orbital paths — accurate ellipses
  PLANET_DATA.forEach((p) => {
    const segments = 96;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const M = (i / segments) * Math.PI * 2;
      const pos = orbitalPosition(p.a, p.e, p.incl, M);
      points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.2,
    });
    const orbit = new THREE.Line(orbitGeo, orbitMat);
    objects.push(orbit);
  });

  return {
    objects,
    cameraPos: new THREE.Vector3(0, 50, 80),
    cameraTarget: new THREE.Vector3(0, 0, 0),
  };
}
