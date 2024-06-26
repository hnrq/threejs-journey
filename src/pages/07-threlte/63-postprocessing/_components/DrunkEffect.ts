import { BlendFunction, Effect } from 'postprocessing';
import { Uniform, WebGLRenderTarget, type Renderer } from 'three';

const fragmentShader = /* glsl */ `
  uniform float frequency;
  uniform float amplitude;
  uniform float time;
  
  void mainUv(inout vec2 uv) {
    uv.y += sin(uv.x * frequency + time) * amplitude;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = vec4(0.8, 1.0, 0.5, inputColor.a);
  }
`;

export default class DrunkEffect extends Effect {
  constructor({
    frequency,
    amplitude,
    blendFunction = BlendFunction.DARKEN,
  }: {
    frequency: number;
    amplitude: number;
    blendFunction?: BlendFunction;
  }) {
    super('DrunkEffect', fragmentShader, {
      blendFunction,
      uniforms: new Map([
        ['frequency', new Uniform(frequency)],
        ['amplitude', new Uniform(amplitude)],
        ['time', new Uniform(0)],
      ]),
    });
  }

  update = (_renderer: Renderer, _inputBuffer: WebGLRenderTarget, deltaTime: number) => {
    (<Uniform>this.uniforms.get('time')).value += deltaTime;
  };
}
