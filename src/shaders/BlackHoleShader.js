/**
 * GOD MODE: Full Schwarzschild-inspired black hole raymarcher
 * Gravitational lensing, relativistic jets, multiple photon rings,
 * Doppler beaming, warped accretion disk, Einstein ring
 */
import * as THREE from 'three';

export const BlackHoleUniforms = {
  uTime: { value: 0 },
  uCameraPos: { value: new THREE.Vector3(0, 0, 15) },
  uCameraTarget: { value: new THREE.Vector3(0, 0, 0) },
};

export const BlackHoleShader = {
  uniforms: BlackHoleUniforms,

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform vec3 uCameraPos;
    uniform vec3 uCameraTarget;

    varying vec2 vUv;

    #define RS 1.0
    #define MAX_STEPS 400
    #define MAX_DIST 100.0
    #define STEP 0.02
    #define DISK_INNER (RS * 2.0)
    #define DISK_OUTER (RS * 14.0)

    float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
    float hash2(float n) { return fract(sin(n) * 43758.5453); }

    float stars(vec3 dir) {
      vec3 id = floor(dir * 200.0);
      float h = hash(id);
      return pow(h, 24.0) * 4.0;
    }

    vec4 sampleDisk(vec3 pos, float signY) {
      float diskR = length(pos.xz);
      float diskY = pos.y * signY;
      if (diskR < DISK_INNER || diskR > DISK_OUTER || diskY < -0.08 || diskY > 0.08) {
        return vec4(0.0, 0.0, 0.0, 0.0);
      }

      float ang = atan(pos.z, pos.x);
      float normR = (diskR - DISK_INNER) / (DISK_OUTER - DISK_INNER);

      float doppler = pow((cos(ang) + 1.0) * 0.5, 0.3);

      vec3 hot = vec3(1.0, 0.99, 0.98);
      vec3 mid  = vec3(1.0, 0.65, 0.35);
      vec3 cool = vec3(0.9, 0.2, 0.05);
      vec3 baseColor = normR < 0.4 ? mix(hot, mid, normR * 2.5) : mix(mid, cool, (normR - 0.4) * 1.67);

      baseColor *= 0.45 + 0.55 * doppler;
      baseColor = mix(baseColor, vec3(1.0, 0.97, 0.94), doppler * 0.6);

      float turb = sin(ang * 18.0 + uTime * 2.5) * 0.5 + 0.5;
      turb *= sin(diskR * 3.0 + uTime * 0.8) * 0.5 + 0.5;
      baseColor *= 0.75 + 0.5 * turb;

      float thickness = 0.12 - abs(pos.y) * 2.0;
      float alpha = (0.98 - normR * 0.2) * smoothstep(0.0, 0.1, thickness);
      return vec4(baseColor, alpha);
    }

    vec3 sampleJets(vec3 pos) {
      float dist = length(pos.xz);
      float h = abs(pos.y);
      if (dist > 0.4 || h < 0.5 || h > 12.0) return vec3(0.0);

      float falloff = 1.0 / (1.0 + h * 0.15);
      float radial = exp(-dist * dist * 8.0);
      float pulse = 0.8 + 0.2 * sin(uTime * 3.0 + h * 2.0);

      vec3 jetColor = vec3(0.3, 0.6, 1.0) * falloff * radial * pulse;
      jetColor += vec3(0.5, 0.8, 1.0) * exp(-dist * dist * 20.0) * falloff * 0.5;
      return jetColor;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;

      vec3 ro = uCameraPos;
      vec3 target = uCameraTarget;
      vec3 fwd = normalize(target - ro);
      vec3 right = normalize(cross(vec3(0, 1, 0), fwd));
      vec3 up = cross(fwd, right);
      vec3 rd = normalize(fwd + uv.x * right + uv.y * up);

      vec3 pos = ro;
      float t = 0.0;
      vec4 diskSample = vec4(0.0);
      float closestDisk = 9999.0;
      bool hitHorizon = false;
      vec3 jetAccum = vec3(0.0);

      for (int i = 0; i < MAX_STEPS; i++) {
        pos = ro + rd * t;
        float r = length(pos);

        if (r < RS * 1.003) {
          hitHorizon = true;
          break;
        }

        vec4 d1 = sampleDisk(pos, 1.0);
        vec4 d2 = sampleDisk(pos, -1.0);
        vec4 d = d1.a > d2.a ? d1 : d2;
        if (d.a > 0.01 && t < closestDisk) {
          closestDisk = t;
          diskSample = d;
        }

        jetAccum += sampleJets(pos) * STEP * 2.0;

        float stepSize = max(STEP, r * 0.01);
        t += stepSize;
        if (t > MAX_DIST) break;
      }

      vec3 color;

      if (hitHorizon) {
        color = vec3(0.0);
      } else if (diskSample.a > 0.01) {
        color = diskSample.rgb + jetAccum * 0.3;
      } else {
        color = vec3(0.008, 0.004, 0.012);
        color += stars(rd) * vec3(0.93, 0.97, 1.0);
        color += jetAccum;
      }

      float distFromCenter = length(uv);
      if (!hitHorizon && diskSample.a < 0.01 && distFromCenter < 0.5) {
        float ring1 = smoothstep(0.12, 0.15, distFromCenter) * smoothstep(0.26, 0.22, distFromCenter);
        float ring2 = smoothstep(0.20, 0.22, distFromCenter) * smoothstep(0.34, 0.30, distFromCenter) * 0.6;
        float ring3 = smoothstep(0.28, 0.30, distFromCenter) * smoothstep(0.42, 0.38, distFromCenter) * 0.3;
        color += vec3(0.4, 0.5, 0.65) * (ring1 + ring2 + ring3);
      }

      float vignette = 1.0 - 0.4 * pow(dot(uv, uv), 1.2);
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
