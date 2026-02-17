/**
 * INTERSTELLAR-STYLE: Ultra-realistic black hole with proper gravitational lensing
 * Implements ray bending, warped accretion disk, back-side visibility,
 * photon sphere, and Einstein rings - inspired by Gargantua from Interstellar
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
    #define MAX_STEPS 800
    #define MAX_DIST 200.0
    #define STEP 0.012
    #define ISCO 3.0
    #define DISK_INNER (RS * ISCO)
    #define DISK_OUTER (RS * 25.0)
    #define PHOTON_SPHERE_RADIUS (RS * 1.5)
    #define GRAVITY_STRENGTH 0.8  // Increased for more dramatic lensing

    float hash(vec3 p) { 
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); 
    }

    float stars(vec3 dir) {
      vec3 id = floor(dir * 300.0);
      float h = hash(id);
      return pow(h, 30.0) * 5.0;
    }

    // Gravitational deflection - bends light rays around the blackhole
    // Uses Schwarzschild-inspired geodesic integration for realistic lensing
    vec3 deflectRay(vec3 pos, vec3 dir, float dt) {
      vec3 toBH = -pos;
      float r = length(pos);
      if (r < RS * 0.05) return dir; // Avoid singularity
      
      // Schwarzschild metric deflection - stronger near event horizon
      // The deflection follows 1/r^2 law but is enhanced near the photon sphere
      float rsOverR = RS / r;
      float deflectionStrength = rsOverR * rsOverR * GRAVITY_STRENGTH;
      
      // Extra enhancement near photon sphere for dramatic lensing
      float distToPhoton = abs(r - PHOTON_SPHERE_RADIUS);
      if (distToPhoton < 0.5) {
        deflectionStrength *= 1.0 + 2.0 * exp(-distToPhoton * 5.0);
      }
      
      // Direction to blackhole
      vec3 toBHNorm = normalize(toBH);
      
      // Calculate deflection vector - points toward blackhole
      vec3 deflection = toBHNorm * deflectionStrength * dt * dt;
      
      // Apply deflection to ray direction
      vec3 newDir = dir + deflection;
      
      // Renormalize to maintain unit length
      return normalize(newDir);
    }

    // Sample accretion disk with realistic colors and turbulence
    vec4 sampleDisk(vec3 pos, float signY) {
      float diskR = length(pos.xz);
      float diskY = pos.y * signY;
      
      // Disk thickness varies with radius
      float thickness = 0.15 * (1.0 - smoothstep(DISK_INNER, DISK_OUTER, diskR));
      if (diskR < DISK_INNER || diskR > DISK_OUTER || abs(diskY) > thickness) {
        return vec4(0.0, 0.0, 0.0, 0.0);
      }

      float ang = atan(pos.z, pos.x);
      float normR = (diskR - DISK_INNER) / (DISK_OUTER - DISK_INNER);

      // Doppler beaming - approaching side is brighter and bluer
      float doppler = pow((cos(ang) + 1.0) * 0.5, 0.25);
      
      // Interstellar color palette - fiery orange/yellow
      vec3 hot = vec3(1.0, 0.95, 0.85);      // Bright white-yellow
      vec3 mid = vec3(1.0, 0.6, 0.2);        // Orange
      vec3 cool = vec3(0.8, 0.25, 0.1);      // Deep red-orange
      vec3 baseColor;
      
      if (normR < 0.3) {
        baseColor = mix(hot, mid, normR / 0.3);
      } else if (normR < 0.7) {
        baseColor = mix(mid, cool, (normR - 0.3) / 0.4);
      } else {
        baseColor = mix(cool, cool * 0.5, (normR - 0.7) / 0.3);
      }

      // Doppler brightening
      baseColor *= 0.4 + 0.6 * doppler;
      baseColor = mix(baseColor, vec3(1.0, 0.98, 0.92), doppler * 0.7);

      // Turbulent flow patterns - more complex for realism
      float turb1 = sin(ang * 15.0 + uTime * 3.5) * 0.5 + 0.5;
      float turb2 = sin(diskR * 5.0 - uTime * 1.5) * 0.5 + 0.5;
      float turb3 = sin(ang * 30.0 + diskR * 3.0 + uTime * 2.5) * 0.4 + 0.6;
      float turb4 = sin(ang * 7.0 + diskR * 8.0 - uTime * 0.8) * 0.3 + 0.7;
      float turbulence = turb1 * turb2 * turb3 * turb4;
      baseColor *= 0.65 + 0.7 * turbulence;

      // Bright streaks from hot spots and magnetic field lines
      float streak1 = pow(sin(ang * 10.0 + uTime * 5.0) * 0.5 + 0.5, 10.0);
      float streak2 = pow(sin(ang * 6.0 + diskR * 4.0 + uTime * 3.0) * 0.5 + 0.5, 8.0);
      float streaks = max(streak1, streak2 * 0.7);
      baseColor += vec3(0.4, 0.25, 0.15) * streaks * (1.0 - normR * 0.6);
      
      // Inner region gets extra brightness
      if (normR < 0.2) {
        baseColor *= 1.3;
      }

      // Alpha based on thickness and radius
      float thicknessNorm = abs(diskY) / thickness;
      float alpha = (0.98 - normR * 0.15) * smoothstep(1.0, 0.7, thicknessNorm);
      
      return vec4(baseColor, alpha);
    }

    // Photon sphere - light orbiting just outside event horizon
    vec3 samplePhotonSphere(vec3 pos, vec3 dir) {
      float r = length(pos);
      float distToPhoton = abs(r - PHOTON_SPHERE_RADIUS);
      
      if (distToPhoton > 0.2) return vec3(0.0);
      
      // Glow intensity - stronger near photon sphere
      float glow = exp(-distToPhoton * 25.0) * 0.2;
      
      // Add subtle pulsing
      float pulse = 1.0 + 0.1 * sin(uTime * 2.0 + r * 10.0);
      glow *= pulse;
      
      // Warm white glow
      vec3 glowColor = vec3(0.98, 0.95, 0.9);
      
      return glowColor * glow;
    }

    // Einstein rings - multiple photon rings from light orbiting the blackhole
    vec3 sampleEinsteinRings(vec2 uv, float distFromCenter) {
      vec3 ringColor = vec3(0.0);
      
      // Multiple photon rings at different radii
      float ring1 = smoothstep(0.08, 0.10, distFromCenter) * smoothstep(0.18, 0.15, distFromCenter);
      float ring2 = smoothstep(0.14, 0.16, distFromCenter) * smoothstep(0.24, 0.21, distFromCenter);
      float ring3 = smoothstep(0.20, 0.22, distFromCenter) * smoothstep(0.30, 0.27, distFromCenter);
      float ring4 = smoothstep(0.26, 0.28, distFromCenter) * smoothstep(0.36, 0.33, distFromCenter);
      
      vec3 ringGlow = vec3(0.5, 0.6, 0.75);
      ringColor += ringGlow * ring1;
      ringColor += ringGlow * ring2 * 0.7;
      ringColor += ringGlow * ring3 * 0.5;
      ringColor += ringGlow * ring4 * 0.3;
      
      return ringColor;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      vec2 uvAspect = uv * vec2(1.0, 1.0); // Adjust if aspect ratio needed

      vec3 ro = uCameraPos;
      vec3 target = uCameraTarget;
      vec3 fwd = normalize(target - ro);
      vec3 right = normalize(cross(vec3(0, 1, 0), fwd));
      vec3 up = cross(fwd, right);
      vec3 rd = normalize(fwd + uv.x * right + uv.y * up);

      vec3 pos = ro;
      vec3 dir = rd;
      float t = 0.0;
      vec4 diskSample = vec4(0.0);
      float closestDisk = 9999.0;
      bool hitHorizon = false;
      vec3 photonGlow = vec3(0.0);
      vec3 accumulatedDisk = vec3(0.0);
      float diskWeight = 0.0;

      // Ray march with gravitational deflection
      // Use adaptive step sizing for better accuracy near the blackhole
      for (int i = 0; i < MAX_STEPS; i++) {
        float r = length(pos);
        
        // Adaptive step size - smaller steps near blackhole for accuracy
        float stepSize = max(STEP, r * 0.006);
        if (r < RS * 3.0) {
          stepSize *= 0.5; // Extra precision near event horizon
        }
        
        // Check for event horizon
        if (r < RS * 1.001) {
          hitHorizon = true;
          break;
        }

        // Sample disk from both sides (allows seeing back of disk through lensing)
        // This is key for Interstellar effect - back side becomes visible
        vec4 d1 = sampleDisk(pos, 1.0);
        vec4 d2 = sampleDisk(pos, -1.0);
        
        // Accumulate disk samples with proper weighting
        // Use exponential falloff to prefer closer samples, but also weight by distance from center
        float weightFactor = 1.0 + 1.0 / (r + 0.2);
        
        if (d1.a > 0.01) {
          float weight = d1.a * exp(-t * 0.02) * weightFactor;
          accumulatedDisk += d1.rgb * weight;
          diskWeight += weight;
          if (t < closestDisk) {
            closestDisk = t;
            diskSample = d1;
          }
        }
        if (d2.a > 0.01) {
          float weight = d2.a * exp(-t * 0.02) * weightFactor;
          accumulatedDisk += d2.rgb * weight;
          diskWeight += weight;
          if (t < closestDisk || d2.a > d1.a) {
            closestDisk = t;
            diskSample = d2.a > d1.a ? d2 : diskSample;
          }
        }

        // Sample photon sphere
        photonGlow += samplePhotonSphere(pos, dir) * stepSize;

        // Gravitational deflection - bend the ray (creates lensing effect)
        // This is what creates the warped appearance
        dir = deflectRay(pos, dir, stepSize);
        
        // Advance along the deflected ray
        pos += dir * stepSize;
        t += stepSize;
        
        if (t > MAX_DIST) break;
      }

      vec3 color;

      if (hitHorizon) {
        // Pure black event horizon
        color = vec3(0.0);
      } else if (diskWeight > 0.01) {
        // Accretion disk visible
        vec3 diskColor = diskWeight > 0.0 ? accumulatedDisk / diskWeight : diskSample.rgb;
        color = diskColor;
        
        // Add photon sphere glow
        color += photonGlow * 0.5;
        
        // Enhance brightness for dramatic effect
        color *= 1.2;
      } else {
        // Background space
        color = vec3(0.005, 0.003, 0.008);
        color += stars(rd) * vec3(0.95, 0.98, 1.0);
        color += photonGlow;
        
        // Einstein rings when looking at the blackhole
        float distFromCenter = length(uv);
        if (distFromCenter < 0.4) {
          color += sampleEinsteinRings(uv, distFromCenter);
        }
      }

      // Subtle vignette
      float vignette = 1.0 - 0.3 * pow(dot(uv, uv), 1.5);
      color *= vignette;

      // Tone mapping for cinematic look
      color = color / (color + vec3(1.0));
      color = pow(color, vec3(0.95));

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
