attribute float aIntensity;
attribute float aAngle;

uniform vec2 uResolution;
uniform sampler2D uDisplacementTexture;
uniform sampler2D uPictureTexture;

varying vec3 vColor;

void main() {
  // Displacement
  vec3 newPosition = position;
  float displacementIntensity = texture(uDisplacementTexture, uv).r;
  displacementIntensity = smoothstep(0.1, 0.8, displacementIntensity);
  displacementIntensity = smoothstep(0.1, 1.0, displacementIntensity);
  vec3 displacement = vec3(cos(aAngle) * 0.2, sin(aAngle) * 0.2, 1.0);
  displacement = normalize(displacement);
  displacement *= displacementIntensity;
  displacement *= 3.0;
  displacement *= aIntensity;
  newPosition += displacement;

  // Final position
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  // Picture
  float pictureIntensity = texture(uPictureTexture, uv).r;

  vColor = vec3(pow(pictureIntensity, 2.0));

  // Point size
  gl_PointSize = 0.1 * pictureIntensity * uResolution.y;
  gl_PointSize *= (1.0 / -viewPosition.z);
}