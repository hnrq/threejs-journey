import * as THREE from 'three';

import anime from 'animejs';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import particle1 from './_particles/1.png?url';
import particle2 from './_particles/2.png?url';
import particle3 from './_particles/3.png?url';
import particle4 from './_particles/4.png?url';
import particle5 from './_particles/5.png?url';
import particle6 from './_particles/6.png?url';
import particle7 from './_particles/7.png?url';
import particle8 from './_particles/8.png?url';
import fragmentShader from './_shaders/fragment.glsl';
import vertexShader from './_shaders/vertex.glsl';

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();
const textures = [
  textureLoader.load(particle1),
  textureLoader.load(particle2),
  textureLoader.load(particle3),
  textureLoader.load(particle4),
  textureLoader.load(particle5),
  textureLoader.load(particle6),
  textureLoader.load(particle7),
  textureLoader.load(particle8),
];
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1.5, 0, 6);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableZoom = false;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.toneMapping = THREE.LinearToneMapping;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Fireworks
 */
const createFirework = (
  count: number,
  position: THREE.Vector3,
  size: number,
  texture: THREE.Texture,
  radius: number,
  color: THREE.Color,
) => {
  const positionsArray = new Float32Array(count * 3);
  const timeMultipliersArray = new Float32Array(count);
  const sizesArray = new Float32Array(count);
  for (let i = 0; i < count * 3; i++) {
    const i3 = i * 3;
    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2,
    );
    const pos = new THREE.Vector3();
    pos.setFromSpherical(spherical);
    positionsArray[i3] = pos.x;
    positionsArray[i3 + 1] = pos.y;
    positionsArray[i3 + 2] = pos.z;
  }

  for (let i = 0; i < count; i++) {
    sizesArray[i] = Math.random();
    timeMultipliersArray[i] = 1 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizesArray, 1));
  geometry.setAttribute(
    'aTimeMultiplier',
    new THREE.Float32BufferAttribute(timeMultipliersArray, 1),
  );

  texture.flipY = false;
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(sizes.resolution),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
    },
  });
  const firework = new THREE.Points(geometry, material);
  firework.position.copy(position);
  scene.add(firework);
  anime({
    targets: material.uniforms.uProgress,
    value: 1,
    duration: 5000,
    easing: 'linear',
    complete: () => {
      scene.remove(firework);
      geometry.dispose();
      material.dispose();
    },
  });
};

const createRandomFirework = (position: THREE.Vector3) => {
  const count = Math.round(400 + Math.random() * 1000);
  const size = 0.2 + Math.random() * 0.2;
  const texture = textures[Math.floor(Math.random() * textures.length)];
  const radius = 0.5 + Math.random();
  const color = new THREE.Color();
  color.setHSL(Math.random(), 1, 0.7);
  createFirework(count, position, size, texture, radius, color);
};

window.addEventListener('click', (event) => {
  const vec = new THREE.Vector3(); // create once and reuse
  const pos = new THREE.Vector3(); // create once and reuse

  vec.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5,
  );

  vec.unproject(camera);

  vec.sub(camera.position).normalize();

  const distance = -camera.position.z / vec.z;
  pos.copy(camera.position).add(vec.multiplyScalar(distance));
  createRandomFirework(pos);
});
/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
