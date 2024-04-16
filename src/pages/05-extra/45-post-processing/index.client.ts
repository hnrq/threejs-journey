import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import createSky from './scripts/sky';
import loadFox from './scripts/fox';
import loadGrass from './scripts/grass';
import { EffectComposer, GLTFLoader } from 'three/examples/jsm/Addons.js';
import addPixelationPass from './scripts/pixelationPass';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// GLTFLoader
const gltfLoader = new GLTFLoader();

/**
 * Grass
 */
const grass = loadGrass();
scene.add(grass.mesh);

/**
 * Fox
 */
const fox = await loadFox(gltfLoader, gui);
scene.add(fox.model);

/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Sky
 */
createSky(scene, renderer, gui);

/**
 * Pixelation Pass
 */
const composer = new EffectComposer(renderer);
addPixelationPass(composer, scene, camera, gui);

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  for (const actionName in fox.mixer?.actions) {
    fox.mixer.actions[actionName].weight =
      fox.mixer.actions[actionName].action.getEffectiveWeight();
  }

  // Update controls
  controls.update();
  if (fox.mixer) fox.mixer.mixer.update(deltaTime);

  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
