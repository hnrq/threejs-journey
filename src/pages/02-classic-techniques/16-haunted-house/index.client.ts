import * as THREE from 'three';

import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import bricksAmbientOcclusionTextureUrl from './textures/bricks/ambientOcclusion.jpg?url';
import bricksColorTextureUrl from './textures/bricks/color.jpg?url';
import bricksNormalTextureUrl from './textures/bricks/normal.jpg?url';
import bricksRoughnessTextureUrl from './textures/bricks/roughness.jpg?url';
import doorAlphaTextureUrl from './textures/door/alpha.jpg?url';
import doorAmbientOcclusionTextureUrl from './textures/door/ambientOcclusion.jpg?url';
import doorColorTextureUrl from './textures/door/color.jpg?url';
import doorHeightTextureUrl from './textures/door/height.jpg?url';
import doorMetalnessTextureUrl from './textures/door/metalness.jpg?url';
import doorNormalTextureUrl from './textures/door/normal.jpg?url';
import doorRoughnessTextureUrl from './textures/door/roughness.jpg?url';
import grassAmbientOcclusionTextureUrl from './textures/grass/ambientOcclusion.jpg?url';
import grassColorTextureUrl from './textures/grass/color.jpg?url';
import grassNormalTextureUrl from './textures/grass/normal.jpg?url';
import grassRoughnessTextureUrl from './textures/grass/roughness.jpg?url';

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x262837, 1, 15);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const bricksColorTexture = textureLoader.load(bricksColorTextureUrl);
const bricksAmbientOcclusionTexture = textureLoader.load(bricksAmbientOcclusionTextureUrl);
const bricksNormalTexture = textureLoader.load(bricksNormalTextureUrl);
const bricksRoughnessTexture = textureLoader.load(bricksRoughnessTextureUrl);
const doorColorTexture = textureLoader.load(doorColorTextureUrl);
const doorAlphaTexture = textureLoader.load(doorAlphaTextureUrl);
const doorAmbientOcclusionTexture = textureLoader.load(doorAmbientOcclusionTextureUrl);
const doorHeightTexture = textureLoader.load(doorHeightTextureUrl);
const doorNormalTexture = textureLoader.load(doorNormalTextureUrl);
const doorMetalnessTexture = textureLoader.load(doorMetalnessTextureUrl);
const doorRoughnessTexture = textureLoader.load(doorRoughnessTextureUrl);
const grassAmbientOcclusionTexture = textureLoader.load(grassAmbientOcclusionTextureUrl);
const grassColorTexture = textureLoader.load(grassColorTextureUrl);
const grassNormalTexture = textureLoader.load(grassNormalTextureUrl);
const grassRoughnessTexture = textureLoader.load(grassRoughnessTextureUrl);

grassAmbientOcclusionTexture.repeat.set(8, 8);
grassColorTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
const house = new THREE.Group();

const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  }),
);
walls.castShadow = true;
walls.position.y = 1.25;

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0xb35f45 }),
);

roof.rotation.y = Math.PI * 0.25;
roof.position.y = 3;

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  }),
);
door.position.set(0, 1, 2.01);

house.add(walls, roof, door);
scene.add(house);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x89c854 });

const bushes = Array.from({ length: 4 }, () => new THREE.Mesh(bushGeometry, bushMaterial));
bushes.forEach((bush) => {
  bush.castShadow = true;
});
bushes[0].scale.set(0.5, 0.5, 0.5);
bushes[0].position.set(0.8, 0.2, 2.2);
bushes[1].scale.set(0.25, 0.25, 0.25);
bushes[1].position.set(1.4, 0.1, 2.1);
bushes[2].scale.set(0.4, 0.4, 0.4);
bushes[2].position.set(-0.8, 0.1, 2.2);
bushes[3].scale.set(0.15, 0.15, 0.15);
bushes[3].position.set(-1, 0.05, 2.6);

house.add(...bushes);

// Graves
const graves = new THREE.Group();

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: 0xb2b6b1 });

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.castShadow = true;

  grave.position.set(x, 0.3, z);
  grave.rotation.set(0, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);

  graves.add(grave);
}

scene.add(graves);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    aoMap: grassAmbientOcclusionTexture,
    map: grassColorTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  }),
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Ghosts
 */
const ghosts = [0xff00ff, 0x00ffff, 0xffff00].map((color) => new THREE.PointLight(color, 6, 3));
ghosts.forEach((ghost) => {
  ghost.castShadow = true;
  ghost.shadow.mapSize.width = 256;
  ghost.shadow.mapSize.height = 256;
  ghost.shadow.camera.far = 7;
});
scene.add(...ghosts);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight('#ffffff', 0.5);
moonLight.position.set(4, 5, -2);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 256;
moonLight.shadow.mapSize.height = 256;
moonLight.shadow.camera.far = 15;
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door light
const doorLight = new THREE.PointLight(0xff7d46, 1.5, 7);
doorLight.castShadow = true;
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x262837);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
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

const clock = new THREE.Clock();

const tick = () => {
  // Update controls
  controls.update();

  const elapsedTime = clock.getElapsedTime();

  const ghostsAngles = [elapsedTime * 0.5, -elapsedTime * 0.32, -elapsedTime * 0.18];
  ghosts[0].position.set(
    Math.cos(ghostsAngles[0]) * 4,
    Math.sin(ghostsAngles[0]) * 4,
    Math.sin(elapsedTime * 3),
  );
  ghosts[1].position.set(
    Math.cos(ghostsAngles[1]) * 5,
    Math.sin(ghostsAngles[1]) * 5,
    Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5),
  );
  ghosts[2].position.set(
    Math.cos(ghostsAngles[2]) * (7 + Math.sin(elapsedTime * 0.32)),
    Math.sin(ghostsAngles[2]) * (7 + Math.sin(elapsedTime * 0.5)),
    Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5),
  );

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
