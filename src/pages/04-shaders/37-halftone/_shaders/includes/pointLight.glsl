vec3 pointLight(vec3 color, float intensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower, vec3 position, float lightDecay) {
  vec3 lightDelta = lightPosition - position;
  vec3 direction = normalize(lightDelta);
  float lightDistance = length(lightDelta);
  vec3 reflection = reflect(-direction, normal);

  // Shading
  float shading = dot(normal, direction);
  shading = max(0.0, shading);

  // Specular
  float specular = -dot(reflection, viewDirection);
  specular = pow(max(0.0, specular), specularPower);

  // Decay
  float decay = 1.0 - lightDistance * lightDecay;
  decay = max(0.0, decay);

  return color * intensity * decay * (shading + specular);
}