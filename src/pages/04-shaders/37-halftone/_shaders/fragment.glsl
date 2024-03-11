#include "./includes/ambientLight.glsl"
#include "./includes/directionalLight.glsl"
#include "./includes/halftone.glsl"

uniform vec3 uColor;
uniform float uShadowRepetitions;
uniform vec3 uShadowColor;
uniform float uLightRepetitions;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  vec3 normal = normalize(vNormal);
  vec3 color = uColor;
  // Lights
  vec3 light = vec3(0.0);
  light += ambientLight(vec3(1.0), 1.0);
  light += directionalLight(vec3(1.0, 1.0, 1.0), 1.0, normal, vec3(1.0, 1.0, 0.0), viewDirection, 1.0);
  color *= light;

  color = halftone(color, uLightRepetitions, vec3(1.0, 1.0, 0.0), 0.5, 1.5, uLightColor, normal);
  color = halftone(color, uShadowRepetitions, vec3(0.0, -1.0, 0.0), -0.8, 1.5, uShadowColor, normal);

  // Final color
  gl_FragColor = vec4(color, 1.0);
#include <colorspace_fragment>
#include <tonemapping_fragment>
}