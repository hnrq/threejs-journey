import * as THREE from 'three';

import anime from 'animejs';
import * as dat from 'lil-gui';

import gradientTextureUrl from './_textures/gradient/3.jpg?url';

THREE.ColorManagement.enabled = false;

// Texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load(gradientTextureUrl);
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: '#ffeded',
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const objectsDistance = 4;

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const meshes = [
  new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material),
  new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material),
  new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material),
];

meshes.forEach((mesh, index) => {
  mesh.position.setY(-(objectsDistance * index));
  mesh.position.setX(2 * (index % 2 === 0 ? 1 : -1));
});

scene.add(...meshes);

// Light

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 1, 0);

scene.add(directionalLight);

/**
 * Particles
 */
//Geometry
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * meshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Scroll
 */

let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const newSection = Math.floor(scrollY / sizes.height);

  if (newSection !== currentSection) {
    currentSection = newSection;
    anime({
      targets: [meshes[currentSection].rotation],
      duration: 1500,
      ease: 'easeInOutQuad',
      x: '+=6',
      y: '+=3',
      z: '+=1.5',
    });
  }
});

/**
 * Cursor
 */

const cursor = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
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
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Render
  renderer.render(scene, camera);

  meshes.forEach((mesh) => {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  });

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
