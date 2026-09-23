/**
 * Noise-dissolve cross-fade between two hero slide textures (docs/FRONTEND-GUIDE.md §27).
 *
 * One 2D simplex field drives everything: the dissolve front, the idle ripple, and the pointer
 * wake. Reusing a single noise function is why the whole effect fits in one material — see
 * `docs/FRONTEND-GUIDE.md` for why the hero deliberately avoids `@react-three/drei`.
 */

/** Ashima Arts simplex noise, MIT-licensed, unchanged apart from formatting. */
const SIMPLEX_2D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

export const HERO_DISSOLVE_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const HERO_DISSOLVE_FRAGMENT = /* glsl */ `
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uProgress;
uniform float uTime;
uniform float uPlaneAspect;
uniform float uAspectA;
uniform float uAspectB;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uIdle;
uniform vec3 uEdgeColor;

varying vec2 vUv;

${SIMPLEX_2D}

/** Softness of the dissolve front, in noise units. Wider reads as smoke, narrower as shattering. */
const float EDGE = 0.16;
const float NOISE_SCALE = 3.2;

/** CSS object-fit: cover, in UV space — crops the overflowing axis instead of stretching the slide. */
vec2 coverUv(vec2 uv, float imageAspect) {
  vec2 scale = uPlaneAspect > imageAspect
    ? vec2(1.0, imageAspect / uPlaneAspect)
    : vec2(uPlaneAspect / imageAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = vUv;

  // Idle ripple — amplitude is deliberately below the threshold of "look, an effect".
  uv += vec2(
    snoise(uv * 2.5 + uTime * 0.08),
    snoise(uv * 2.5 - uTime * 0.07 + 31.4)
  ) * 0.006 * uIdle;

  // Pointer wake — a soft outward push that trails the cursor via the eased uniform.
  vec2 toPointer = uv - uPointer;
  float falloff = exp(-dot(toPointer, toPointer) * 18.0) * uPointerStrength;
  uv += normalize(toPointer + 1e-5) * falloff * 0.03;

  vec3 colorA = texture2D(uTexA, coverUv(uv, uAspectA)).rgb;
  vec3 colorB = texture2D(uTexB, coverUv(uv, uAspectB)).rgb;

  // Remap so progress 0 and 1 are fully settled rather than partially dissolved.
  float front = uProgress * (1.0 + 2.0 * EDGE) - EDGE;
  float noise = snoise(uv * NOISE_SCALE + uTime * 0.15) * 0.5 + 0.5;
  float mask = smoothstep(front - EDGE, front + EDGE, noise);

  vec3 color = mix(colorB, colorA, mask);

  // Brand-tinted glow riding the dissolve front; dark at both ends so it never tints a settled slide.
  float edge = 1.0 - abs(mask - 0.5) * 2.0;
  // Not named 'active' — that is a reserved word in GLSL and fails to compile.
  float glowGate = smoothstep(0.0, 0.08, uProgress) * smoothstep(1.0, 0.92, uProgress);
  color += uEdgeColor * edge * edge * 0.22 * glowGate;

  gl_FragColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}
`;
