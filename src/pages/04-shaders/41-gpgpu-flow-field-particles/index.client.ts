import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js';

import shipModelUrl from './_models/ship.glb?url';
import gpgpuParticlesShader from './_shaders/gpgpu/particles.glsl';
import particlesFragmentShader from './_shaders/particles/fragment.glsl';
import particlesVertexShader from './_shaders/particles/vertex.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {
  clearColor: 0x29191f,
};

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4.5, 4, 11);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor(debugObject.clearColor);

/**
 * Load model
 */
const gltf = await gltfLoader.loadAsync(shipModelUrl);

/**
 * Base geometry
 */

const baseGeometry = {
  instance: (<THREE.Mesh>gltf.scene.children[0]).geometry,
  count: 0,
};

baseGeometry.count = baseGeometry.instance.attributes.position.count;

/**
 * GPU Compute
 */

const gpgpu = (() => {
  const size = Math.ceil(Math.sqrt(baseGeometry.count));
  const computation = new GPUComputationRenderer(size, size, renderer);
  const baseParticlesTexture = computation.createTexture();
  for (let i = 0; i < baseGeometry.count; i++) {
    const i3 = i * 3;
    const i4 = i * 4;

    // Position based on geometry
    baseParticlesTexture.image.data[i4 + 0] =
      baseGeometry.instance.attributes.position.array[i3 + 0];
    baseParticlesTexture.image.data[i4 + 1] =
      baseGeometry.instance.attributes.position.array[i3 + 1];
    baseParticlesTexture.image.data[i4 + 2] =
      baseGeometry.instance.attributes.position.array[i3 + 2];
    baseParticlesTexture.image.data[i4 + 3] = Math.random();
  }

  const particlesVariable = computation.addVariable(
    'uParticles',
    gpgpuParticlesShader,
    baseParticlesTexture,
  );
  particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture);
  particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
  particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0);
  particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5);
  particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(2);
  particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5);

  computation.setVariableDependencies(particlesVariable, [particlesVariable]);

  return { size, computation, particlesVariable };
})();

gpgpu.computation.init();

/**
 * Particles
 */
const particles = (() => {
  const material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.05),
      uParticlesTexture: new THREE.Uniform(
        gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture,
      ),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio),
      ),
    },
  });

  const uvArray = new Float32Array(baseGeometry.count * 2);
  const sizesArray = new Float32Array(baseGeometry.count);
  for (let y = 0; y < gpgpu.size; y++)
    for (let x = 0; x < gpgpu.size; x++) {
      const i = y * gpgpu.size + x;
      const i2 = i * 2;

      const uvX = (x + 0.5) / gpgpu.size;
      const uvY = (y + 0.5) / gpgpu.size;

      uvArray[i2 + 0] = uvX;
      uvArray[i2 + 1] = uvY;

      // Size
      sizesArray[i] = Math.random();
    }

  const geometry = new THREE.BufferGeometry();
  geometry.setDrawRange(0, baseGeometry.count);
  geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(uvArray, 2));
  geometry.setAttribute('aColor', baseGeometry.instance.attributes.color);
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1));

  return {
    material,
    geometry,
    points: new THREE.Points(geometry, material),
  };
})();

scene.add(particles.points);

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Materials
  particles.material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio,
  );

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Tweaks
 */
gui.addColor(debugObject, 'clearColor').onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});
gui.add(particles.material.uniforms.uSize, 'value').min(0).max(1).step(0.001).name('uSize');
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uFlowFieldInfluence');

gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uFlowFieldStrength');

gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uFlowFieldFrequency');

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  particles.material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(
    gpgpu.particlesVariable,
  ).texture;

  // GPGPU Update
  gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime * 0.2;
  gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
  gpgpu.computation.compute();

  // Update controls
  controls.update();

  // Render normal scene
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
