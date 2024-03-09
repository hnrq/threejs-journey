uniform float uTime;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
  stripes = pow(stripes, 3.0);

  // Normal
  vec3 normal = normalize(vNormal);
  if (!gl_FrontFacing)
    normal *= -1.0;

  // Fresnel
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  float fresnel = pow(dot(viewDirection, normal) + 1.0, 2.0);

  // Falloff
  float falloff = smoothstep(0.8, 0.0, fresnel);

  // Holographic
  float holographic = stripes * fresnel;
  holographic += fresnel * 1.25;
  holographic *= falloff;
  // Fade-in
  holographic = min(uTime * 0.05, holographic);

  gl_FragColor = vec4(uColor, holographic);
#include <colorspace_fragment>
#include <tonemapping_fragment>
}