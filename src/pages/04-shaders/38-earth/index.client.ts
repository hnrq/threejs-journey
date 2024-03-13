import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import atmosphereFragmentShader from './_shaders/atmosphere/fragment.glsl';
import atmosphereVertexShader from './_shaders/atmosphere/vertex.glsl';
import earthFragmentShader from './_shaders/earth/fragment.glsl';
import earthVertexShader from './_shaders/earth/vertex.glsl';
import earthDayTextureUrl from './_textures/earth/day.jpg?url';
import earthNightTextureUrl from './_textures/earth/night.jpg?url';
import earthSpecularCloudsTextureUrl from './_textures/earth/specularClouds.jpg?url';

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
const textureLoader = new THREE.TextureLoader();
const earthDayTexture = textureLoader.load(earthDayTextureUrl);
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;
const earthNightTexture = textureLoader.load(earthNightTextureUrl);
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;
const earthSpecularCloudsTexture = textureLoader.load(earthSpecularCloudsTextureUrl);
earthSpecularCloudsTexture.anisotropy = 8;

/**
 * Earth
 */
const earthParameters = {
  atmosphereDayColor: 0x00aaff,
  atmosphereTwilightColor: 0xff6600,
};

// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
  uniforms: {
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthNightTexture),
    uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3()),
    uCloudDensity: new THREE.Uniform(0.5),
    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereTwilightColor),
    ),
  },
});
gui
  .add(earthMaterial.uniforms.uCloudDensity, 'value')
  .step(0.1)
  .min(0)
  .max(1)
  .name('Cloud Density')
  .onChange((value) => {
    earthMaterial.uniforms.uCloudDensity.value = value;
  });

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

/**
 * Atmosphere
 */

const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereTwilightColor),
    ),
  },
});
const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);
scene.add(atmosphere);

gui.addColor(earthParameters, 'atmosphereDayColor').onChange((value) => {
  earthMaterial.uniforms.uAtmosphereDayColor.value.set(value);
  atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(value);
});

gui.addColor(earthParameters, 'atmosphereTwilightColor').onChange((value) => {
  earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(value);
  atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(value);
});

/**
 * Sun
 */

const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

const updateSun = () => {
  sunDirection.setFromSpherical(sunSpherical);

  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
};

updateSun();

gui.add(sunSpherical, 'phi').min(0).max(Math.PI).onChange(updateSun);
gui.add(sunSpherical, 'theta').min(-Math.PI).max(Math.PI).onChange(updateSun);

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
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor('#000011');

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

  earth.rotation.y = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
