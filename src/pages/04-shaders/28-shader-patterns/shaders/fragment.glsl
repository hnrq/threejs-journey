varying vec2 vUv;

float random(vec2 uv) {
  return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float circle(vec2 dist, float thickness) {
  return abs(distance(vUv, dist) - thickness);
}

void main() {
  float strength = step(0.1, circle(vec2(0.5), 0.2));
  strength += 1.0 - step(0.01, circle(vec2(0.5), 0.02));
  vec3 mixedColor = mix(vec3(0.0), vec3(vUv, 1.0), strength);
  gl_FragColor = vec4(mixedColor, 1.0);
}