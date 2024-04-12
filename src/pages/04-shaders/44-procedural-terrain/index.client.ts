import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

import terrainFragmentShader from './_shaders/terrain/fragment.glsl';
import terrainVertexShader from './_shaders/terrain/vertex.glsl';
import spruitSunriseHDRUrl from './_textures/spruit_sunrise.hdr?url';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 });
const debugObject = {
  colorWaterDeep: 0x002b3d,
  colorWaterSurface: 0x66a8ff,
  colorSand: 0xffe894,
  colorGrass: 0x85d534,
  colorSnow: 0xffffff,
  colorRock: 0xbfbd8d,
};

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loaders
const rgbeLoader = new RGBELoader();

/**
 * Environment map
 */
rgbeLoader.load(spruitSunriseHDRUrl, (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.backgroundBlurriness = 0.5;
  scene.environment = environmentMap;
});

/**
 * Terrain
 */
const geometry = new THREE.PlaneGeometry(10, 10, 500, 500);
geometry.deleteAttribute('uv');
geometry.deleteAttribute('normal');
geometry.rotateX(-Math.PI * 0.5);

const uniforms = {
  uPositionFrequency: new THREE.Uniform(0.2),
  uStrength: new THREE.Uniform(2.0),
  uWarpFrequency: new THREE.Uniform(5),
  uWarpStrength: new THREE.Uniform(0.5),
  uTime: new THREE.Uniform(0),
  uColorWaterDeep: new THREE.Uniform(new THREE.Color(debugObject.colorWaterDeep)),
  uColorWaterSurface: new THREE.Uniform(new THREE.Color(debugObject.colorWaterSurface)),
  uColorSand: new THREE.Uniform(new THREE.Color(debugObject.colorSand)),
  uColorGrass: new THREE.Uniform(new THREE.Color(debugObject.colorGrass)),
  uColorSnow: new THREE.Uniform(new THREE.Color(debugObject.colorSnow)),
  uColorRock: new THREE.Uniform(new THREE.Color(debugObject.colorRock)),
};

gui.add(uniforms.uPositionFrequency, 'value', 0, 1, 0.001).name('uPositionFrequency');
gui.add(uniforms.uStrength, 'value', 0, 10, 0.001).name('uStrength');
gui.add(uniforms.uWarpFrequency, 'value', 0, 10, 0.001).name('uWarpFrequency');
gui.add(uniforms.uWarpStrength, 'value', 0, 1, 0.001).name('uWarpStrength');

gui
  .addColor(debugObject, 'colorWaterDeep')
  .onChange((value: string) => uniforms.uColorWaterDeep.value.set(value));
gui
  .addColor(debugObject, 'colorWaterSurface')
  .onChange((value: string) => uniforms.uColorWaterSurface.value.set(value));
gui
  .addColor(debugObject, 'colorSand')
  .onChange((value: string) => uniforms.uColorSand.value.set(value));
gui
  .addColor(debugObject, 'colorGrass')
  .onChange((value: string) => uniforms.uColorGrass.value.set(value));
gui
  .addColor(debugObject, 'colorSnow')
  .onChange((value: string) => uniforms.uColorSnow.value.set(value));
gui
  .addColor(debugObject, 'colorRock')
  .onChange((value: string) => uniforms.uColorRock.value.set(value));

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  silent: true,
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
  uniforms,
  metalness: 0,
  roughness: 0.5,
  color: '#85d534',
});

const depthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  silent: true,
  vertexShader: terrainVertexShader,
  uniforms,
  depthPacking: THREE.RGBADepthPacking,
});

const terrain = new THREE.Mesh(geometry, material);
terrain.customDepthMaterial = depthMaterial;
terrain.castShadow = true;
terrain.receiveShadow = true;
scene.add(terrain);

/**
 * Water
 */

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 1, 1),
  new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.3,
  }),
);
water.rotation.x = -Math.PI * 0.5;
water.position.y = -0.1;
scene.add(water);

/**
 * Board
 */
const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11));
const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10));

const evaluator = new Evaluator();
const board = evaluator.evaluate(boardFill, boardHole, SUBTRACTION);
board.geometry.clearGroups();
board.material = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0, roughness: 0.3 });
board.castShadow = true;
board.receiveShadow = true;
scene.add(board);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2);
directionalLight.position.set(6.25, 3, 4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
scene.add(directionalLight);

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
camera.position.set(-10, 6, -2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

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
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // Update controls
  controls.update();

  // Uniforms
  uniforms.uTime.value = elapsedTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
