/**
 * Cinematic film grain
 */
export const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAmount: { value: 0.04 },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    uniform float uTime;

    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      float grain = random(vUv * 1000.0 + uTime) * 2.0 - 1.0;
      tex.rgb += grain * uAmount;
      gl_FragColor = tex;
    }
  `,
};
