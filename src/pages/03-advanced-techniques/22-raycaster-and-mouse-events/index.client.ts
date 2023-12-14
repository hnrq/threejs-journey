import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Base
 */
// Debug
const gui = new GUI();
const guiControls = { objectCount: 3, intersectColor: 0x0000ff, defaultColor: 0xff0000 };

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const geometry = new THREE.SphereGeometry(0.5, 16, 16);
const createObjects = (objectCount: number) =>
  Array.from({ length: objectCount }, (_, index) => {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: guiControls.defaultColor }),
    );
    mesh.position.x = index * (3 / (objectCount - 1)) - 1.5;
    return mesh;
  });
let objects = createObjects(guiControls.objectCount);

gui.add(guiControls, 'objectCount', 2, 5, 1).onChange((value: number) => {
  objects = createObjects(value);
  scene.clear().add(...objects);
});
gui.addColor(guiControls, 'intersectColor').name('Intersection Color');
gui
  .addColor(guiControls, 'defaultColor')
  .name('Color')
  .onChange((value: string) => {
    objects.forEach(({ material }) => {
      material.color.set(value);
    });
  });

scene.add(...objects);

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
camera.position.z = 3;
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
 * Raycaster
 */
type Intersection = THREE.Intersection<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>>;

const raycaster = new THREE.Raycaster();
let currentIntersect: Intersection | null;

/**
 * Mouse
 */
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

const tick = () => {
  1;
  raycaster.setFromCamera(mouse, camera);
  const [intersect]: Intersection[] = raycaster.intersectObjects(objects);

  if (intersect !== undefined) {
    if (currentIntersect) currentIntersect.object.material.color.set(guiControls.defaultColor);

    intersect.object.material.color.set(guiControls.intersectColor);
    currentIntersect = intersect;
  } else {
    if (currentIntersect) currentIntersect.object.material.color.set(guiControls.defaultColor);
    currentIntersect = null;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
