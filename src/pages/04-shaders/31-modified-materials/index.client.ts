import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import leePerrySmithColor from './_models/color.jpg?url';
import leePerrySmithModel from './_models/LeePerrySmith.glb?url';
import leePerrySmithNormal from './_models/normal.jpg?url';
import vertexCommonShader from './_shaders/vertex.common.glsl';
import vertexShader from './_shaders/vertex.glsl';
import vertexNormalShader from './_shaders/vertex.normal.glsl';
import environmentMapNX from './_textures/environmentMaps/0/nx.jpg?url';
import environmentMapNY from './_textures/environmentMaps/0/ny.jpg?url';
import environmentMapNZ from './_textures/environmentMaps/0/nz.jpg?url';
import environmentMapPX from './_textures/environmentMaps/0/px.jpg?url';
import environmentMapPY from './_textures/environmentMaps/0/py.jpg?url';
import environmentMapPZ from './_textures/environmentMaps/0/pz.jpg?url';

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const depthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = 1;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  environmentMapPX,
  environmentMapNX,
  environmentMapPY,
  environmentMapNY,
  environmentMapPZ,
  environmentMapNZ,
]);

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load(leePerrySmithColor);
mapTexture.colorSpace = THREE.SRGBColorSpace;
const normalTexture = textureLoader.load(leePerrySmithNormal);

// Material
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
});

const customUniforms = { uTime: { value: 0 } };

material.onBeforeCompile = (shaders) => {
  shaders.uniforms.uTime = customUniforms.uTime;
  shaders.vertexShader = shaders.vertexShader.replace('#include <common>', vertexCommonShader);
  shaders.vertexShader = shaders.vertexShader.replace(
    '#include <beginnormal_vertex>',
    vertexNormalShader,
  );
  shaders.vertexShader = shaders.vertexShader.replace('#include <begin_vertex>', vertexShader);
};

depthMaterial.onBeforeCompile = (shaders) => {
  shaders.uniforms.uTime = customUniforms.uTime;
  shaders.vertexShader = shaders.vertexShader.replace('#include <common>', vertexCommonShader);
  shaders.vertexShader = shaders.vertexShader.replace('#include <begin_vertex>', vertexShader);
};

/**
 * Models
 */
gltfLoader.load(leePerrySmithModel, (gltf) => {
  // Model
  const mesh = gltf.scene.children[0] as THREE.Mesh;
  mesh.rotation.y = Math.PI * 0.5;
  mesh.material = material;
  mesh.customDepthMaterial = depthMaterial;
  scene.add(mesh);

  // Update materials
  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
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
camera.position.set(4, 1, -4);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
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
  customUniforms.uTime.value = elapsedTime;
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
