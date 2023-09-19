import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Scene
const scene = new THREE.Scene();

// Object
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
);
scene.add(mesh);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100);
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;
camera.lookAt(mesh.position);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);

// Animate
const clock = new THREE.Clock();

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  mesh.rotation.y = elapsedTime;
  controls.update();

  // Render
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
