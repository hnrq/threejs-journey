#include "./noise.glsl";

uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uTime;
uniform float uBigWavesSpeed;
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying float vFogDepth;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime *uBigWavesSpeed) * 
    sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) 
    * uBigWavesElevation;
  for(float i = 1.0; i <= uSmallIterations; i++)
    elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  vElevation = elevation;
  gl_Position = projectedPosition;
  vFogDepth = (viewPosition * modelPosition).z;
}