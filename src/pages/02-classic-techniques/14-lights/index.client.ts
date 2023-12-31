import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);

const pointLight = new THREE.PointLight(0xff9000, 1.5, 10, 2);
pointLight.position.set(1, -0.5, 1);

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.75);
directionalLight.position.set(1, 0.25, 0);

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.75);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 5, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());

const spotLight = new THREE.SpotLight(0x78ff00, 1.25, 10, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
spotLight.target.position.x = -0.75;

scene.add(
  hemisphereLight,
  ambientLight,
  pointLight,
  directionalLight,
  rectAreaLight,
  spotLight,
  spotLight.target,
);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 32, 64), material);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

/**
 * Controls
 */
const ambientLightFolder = gui.addFolder('Ambient Light');
ambientLightFolder.add(ambientLight, 'intensity', 0, 5, 0.001);
ambientLightFolder.addColor(ambientLight, 'color');

const directionalLightFolder = gui.addFolder('Directional Light');
directionalLightFolder.add(directionalLight, 'intensity', 0, 5, 0.001);
directionalLightFolder.addColor(directionalLight, 'color');

const hemisphereLightFolder = gui.addFolder('Hemisphere Light');
hemisphereLightFolder.add(hemisphereLight, 'intensity', 0, 5, 0.001);
hemisphereLightFolder.addColor(hemisphereLight, 'color').name('Sky Color');
hemisphereLightFolder.addColor(hemisphereLight, 'groundColor').name('Ground Color');

const pointLightFolder = gui.addFolder('Point Light');
pointLightFolder.add(pointLight, 'intensity', 0, 5, 0.001);
pointLightFolder.addColor(pointLight, 'color');
const pointLightFolderPosition = pointLightFolder.addFolder('position');
Object.keys(pointLight.position).forEach((axis) => {
  pointLightFolderPosition.add(pointLight.position, axis, -1, 1, 0.01);
});

const rectAreaLightFolder = gui.addFolder('Rect Area Light');
rectAreaLightFolder.add(rectAreaLight, 'intensity', 0, 5, 0.001);
rectAreaLightFolder.addColor(rectAreaLight, 'color');
const rectAreaLightFolderPosition = rectAreaLightFolder.addFolder('position');
Object.keys(rectAreaLight.position).forEach((axis) => {
  rectAreaLightFolderPosition.add(rectAreaLight.position, axis, -1, 1, 0.01);
});

const spotLightFolder = gui.addFolder('Spot Light');
spotLightFolder.add(spotLight, 'intensity', 0, 5, 0.001);
spotLightFolder.addColor(spotLight, 'color');

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
camera.position.set(1, 1, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
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
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = 0.15 * elapsedTime;
  cube.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
