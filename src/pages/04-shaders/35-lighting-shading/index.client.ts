import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import suzanneModel from '@assets/models/suzanne.glb?url';

import shadingFragmentShader from './_shaders/fragment.glsl';
import shadingVertexShader from './_shaders/vertex.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loaders
const gltfLoader = new GLTFLoader();

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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 7;
camera.position.y = 7;
camera.position.z = 7;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// renderer.toneMapping = THREE.ACESFilmicToneMapping
// renderer.toneMappingExposure = 3
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Material
 */
const materialParameters = {
  color: 0xffffff,
  ambientLightColor: 0xffffff,
  directionalLightColor: 0xff05dd,
  pointLightColor: 0x00ff00,
};

const material = new THREE.ShaderMaterial({
  vertexShader: shadingVertexShader,
  fragmentShader: shadingFragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
    uAmbientLightColor: new THREE.Uniform(new THREE.Color(materialParameters.ambientLightColor)),
    uPointLightColor: new THREE.Uniform(new THREE.Color(materialParameters.pointLightColor)),
    uDirectionalLightColor: new THREE.Uniform(
      new THREE.Color(materialParameters.directionalLightColor),
    ),
  },
});

gui.addColor(materialParameters, 'color').onChange((value: string) => {
  material.uniforms.uColor.value.set(value);
});

gui.addColor(materialParameters, 'ambientLightColor').onChange((value: string) => {
  material.uniforms.uAmbientLightColor.value.set(value);
});

gui.addColor(materialParameters, 'directionalLightColor').onChange((value: string) => {
  material.uniforms.uDirectionalLightColor.value.set(value);
});

gui.addColor(materialParameters, 'pointLightColor').onChange((value: string) => {
  material.uniforms.uPointLightColor.value.set(value);
});

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Objects
 */

// Torus knot
const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32), material);
torusKnot.position.x = 3;
scene.add(torusKnot);

// Sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material);
sphere.position.x = -3;
scene.add(sphere);

// Suzanne
let suzanne: THREE.Group<THREE.Object3DEventMap>;

gltfLoader.load(suzanneModel, (gltf) => {
  suzanne = gltf.scene;
  suzanne.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = material;
  });
  scene.add(suzanne);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Rotate objects
  if (suzanne) {
    suzanne.rotation.x = -elapsedTime * 0.1;
    suzanne.rotation.y = elapsedTime * 0.2;
  }

  sphere.rotation.x = -elapsedTime * 0.1;
  sphere.rotation.y = elapsedTime * 0.2;

  torusKnot.rotation.x = -elapsedTime * 0.1;
  torusKnot.rotation.y = elapsedTime * 0.2;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
