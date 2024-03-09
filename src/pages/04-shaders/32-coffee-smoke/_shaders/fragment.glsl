uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

void main() {
  // Smoke
  vec2 smokeUv = vUv;
  smokeUv *= 0.5;
  smokeUv.y -= uTime * 0.03;
  float smoke = texture(uPerlinTexture, smokeUv).r;
  smoke = smoothstep(0.4, 1.0, smoke);
  smoke *= smoothstep(0.0, 0.1, vUv.x);
  smoke *= smoothstep(1.0, 0.9, vUv.x);
  smoke *= smoothstep(0.0, 0.1, vUv.y);
  smoke *= smoothstep(1.0, 0.4, vUv.y);

  // Final color
  gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);

#include <colorspace_fragment>
#include <tonemapping_fragment>
}