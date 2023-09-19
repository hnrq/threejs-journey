import * as THREE from 'three';

import anime from 'animejs';
import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();

// Object
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1, 1, 1, 1), material);
scene.add(mesh);

const parameters = {
  spin: () =>
    anime({
      targets: mesh.rotation,
      duration: 1000,
      y: mesh.rotation.y + Math.PI * 2,
    }),
};

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

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Debug
 */
const gui = new dat.GUI();
gui.add(mesh.position, 'y', -3, 3, 0.01);
gui.add(mesh, 'visible');
gui.add(material, 'wireframe');
gui.addColor(material, 'color');
gui.add(parameters, 'spin');

const tick = () => {
  controls.update();

  // Render
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
