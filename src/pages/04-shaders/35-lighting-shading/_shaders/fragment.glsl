#include "./includes/ambientLight.glsl"
#include "./includes/directionalLight.glsl"
#include "./includes/pointLight.glsl"

uniform vec3 uColor;
uniform vec3 uAmbientLightColor;
uniform vec3 uDirectionalLightColor;
uniform vec3 uPointLightColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  vec3 normal = normalize(vNormal);
  vec3 color = uColor;

  // Light
  vec3 light = vec3(0.0);
  light += ambientLight(uAmbientLightColor, 0.03);
  light += directionalLight(uDirectionalLightColor, 1.0, normal, vec3(0.0, 0.0, 3.0), viewDirection, 20.0);
  light += pointLight(uPointLightColor, 1.0, normal, vec3(0.0, 2.5, 0.0), viewDirection, 20.0, vPosition, 0.25);
  color *= light;

  // Final color
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}