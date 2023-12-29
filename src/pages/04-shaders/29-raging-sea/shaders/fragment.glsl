uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uFogColor;

varying float vElevation;
varying float vFogDepth;

void main() {
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  float fogAmount = smoothstep(uFogNear, uFogFar, vFogDepth / 2.0);
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
  gl_FragColor = vec4(mix(color, uFogColor, fogAmount), 1.0);
  #include <colorspace_fragment>
}