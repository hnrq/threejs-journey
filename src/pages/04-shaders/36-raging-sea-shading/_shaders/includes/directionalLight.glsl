vec3 directionalLight(vec3 color, float intensity, vec3 normal, vec3 position, vec3 viewDirection, float specularPower) {
  vec3 direction = normalize(position);
  vec3 reflection = reflect(-direction, normal);

  // Shading
  float shading = dot(normal, direction);
  shading = max(0.0, shading);

  // Specular
  float specular = -dot(reflection, viewDirection);
  specular = pow(max(0.0, specular), specularPower);

  return color * intensity * (shading + specular);
}