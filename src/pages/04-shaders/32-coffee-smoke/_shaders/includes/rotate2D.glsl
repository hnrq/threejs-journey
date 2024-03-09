vec2 rotate2D(vec2 value, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, s, -s, c) * value;
}