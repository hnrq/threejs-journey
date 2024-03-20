import * as THREE from 'three';

import anime from 'animejs';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import modelsUrl from './_models/models.glb?url';
import particlesFragmentShader from './_shaders/particles/fragment.glsl';
import particlesVertexShader from './_shaders/particles/vertex.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {
  clearColor: '#160920',
};

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
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
camera.position.set(0, 0, 8 * 2);
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

gui.addColor(debugObject, 'clearColor').onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});
renderer.setClearColor(debugObject.clearColor);

/**
 * Particles
 */
const particles = {
  maxCount: 0,
  positions: [] as THREE.Float32BufferAttribute[],
  material: new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.4),
      uProgress: new THREE.Uniform(0),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio),
      ),
      uColorA: new THREE.Uniform(new THREE.Color(0xff7300)),
      uColorB: new THREE.Uniform(new THREE.Color(0x0091ff)),
    },
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
  geometry: new THREE.BufferGeometry(),
  index: 0,
  morph: (index: number) => {
    particles.geometry.attributes.position = particles.positions[particles.index];
    particles.geometry.attributes.aPositionTarget = particles.positions[index];
    anime({
      targets: particles.material.uniforms.uProgress,
      value: [0, 1],
      duration: 400,
      easing: 'linear',
    }).complete = () => {
      particles.index = index;
    };
  },
  morph0: () => particles.morph(0),
  morph1: () => particles.morph(1),
  morph2: () => particles.morph(2),
  morph3: () => particles.morph(3),
};

gltfLoader.load(modelsUrl, (gltf) => {
  const positions = gltf.scene.children.map(
    (child) => (<THREE.Mesh>child).geometry.attributes.position,
  );

  positions.forEach((position) => {
    if (position.count > particles.maxCount) particles.maxCount = position.count;
  });

  positions.forEach((position) => {
    const originalArray = position.array;
    const newArray = new Float32Array(particles.maxCount * 3);
    for (let i = 0; i < particles.maxCount; i++) {
      const i3 = i * 3;

      if (i3 < originalArray.length) {
        newArray[i3 + 0] = originalArray[i3 + 0];
        newArray[i3 + 1] = originalArray[i3 + 1];
        newArray[i3 + 2] = originalArray[i3 + 2];
      } else {
        const randomIndex = Math.floor(position.count * Math.random()) * 3;
        newArray[i3 + 0] = originalArray[randomIndex + 0];
        newArray[i3 + 1] = originalArray[randomIndex + 1];
        newArray[i3 + 2] = originalArray[randomIndex + 2];
      }
    }

    particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3));
  });

  const sizesArray = new Float32Array(particles.maxCount);

  for (let i = 0; i < particles.maxCount; i++) sizesArray[i] = Math.random();

  particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1));
  particles.geometry.setAttribute('position', particles.positions[particles.index]);
  particles.geometry.setAttribute('aPositionTarget', particles.positions[3]);

  // Points
  const points = new THREE.Points(particles.geometry, particles.material);
  points.frustumCulled = false;
  scene.add(points);

  gui.add(particles, 'morph0');
  gui.add(particles, 'morph1');
  gui.add(particles, 'morph2');
  gui.add(particles, 'morph3');
});

gui
  .addColor(particles.material.uniforms.uColorA, 'value')
  .min(0)
  .max(1)
  .step(0.01)
  .name('Color 1')
  .onChange((value: string) => {
    particles.material.uniforms.uColorA.value.set(value);
  });
gui
  .addColor(particles.material.uniforms.uColorB, 'value')
  .min(0)
  .max(1)
  .step(0.01)
  .name('Color 2')
  .onChange((value: string) => {
    particles.material.uniforms.uColorB.value.set(value);
  });

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Materials
  particles.material?.uniforms.uResolution.value.set(
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
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render normal scene
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
