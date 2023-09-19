import * as THREE from 'three';

import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import gradientMapUrl from '@assets/textures/gradients/3.jpg?url';

THREE.ColorManagement.enabled = false;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load(gradientMapUrl);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
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
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 40);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial();
material.gradientMap = gradientTexture;
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
sphere.position.x = -1.5;
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 16, 32), material);
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

/**
 * GUI
 */

const gui = new dat.GUI();
gui.addColor(material, 'color');

/**
 * Animate
 */
const tick = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
