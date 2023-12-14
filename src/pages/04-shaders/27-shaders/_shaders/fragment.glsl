uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;

void main() {
  vec4 textureColor = texture2D(uTexture, vUv);
  textureColor.rgb += uColor;
  textureColor.rgb *= vElevation * 1.0 + 0.5;
  gl_FragColor =  textureColor;
}