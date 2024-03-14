import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import picUrl from './_img/pic.png?url';
import glowUrl from './_particles/glow.png?url';
import particlesFragmentShader from './_shaders/particles/fragment.glsl';
import particlesVertexShader from './_shaders/particles/vertex.glsl';

/**
 * GUI
 */
const gui = new GUI();
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const parameters = {
  uploadImage: () => fileInput.click(),
};
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

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
camera.position.set(0, 0, 18);
scene.add(camera);

/**
 * Orbit controls
 */
const controls = new OrbitControls(camera, canvas);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor('#181818');
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Displacement
 */
const displacement = {
  canvas: document.createElement('canvas'),
  context: undefined as CanvasRenderingContext2D | undefined,
  glowImage: new Image(),
  interactivePlane: new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
  ),
  raycaster: new THREE.Raycaster(),
  screenCursor: new THREE.Vector2(9999, 9999),
  canvasCursor: new THREE.Vector2(9999, 9999),
  canvasCursorPrevious: new THREE.Vector2(9999, 9999),
  texture: undefined as THREE.Texture | undefined,
};

window.addEventListener('pointermove', (event) => {
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
});

displacement.canvas.width = 128;
displacement.canvas.height = 128;

displacement.canvas.style.position = 'none';
displacement.canvas.style.width = '256px';
displacement.canvas.style.height = '256px';
displacement.canvas.style.top = '0';
displacement.canvas.style.left = '0';
displacement.canvas.style.zIndex = '10';

displacement.context = displacement.canvas.getContext('2d') as CanvasRenderingContext2D;
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height);

displacement.glowImage.src = glowUrl;
displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32);

displacement.interactivePlane.visible = false;

displacement.texture = new THREE.CanvasTexture(displacement.canvas);

document.body.append(displacement.canvas);
scene.add(displacement.interactivePlane);

/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
particlesGeometry.setIndex(null);
particlesGeometry.deleteAttribute('normal');

const intensitiesArray = new Float32Array(particlesGeometry.attributes.position.count);
const anglesArray = new Float32Array(particlesGeometry.attributes.position.count);

for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  intensitiesArray[i] = Math.random();
  anglesArray[i] = Math.random() * Math.PI * 2;
}

particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1));
particlesGeometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1));

const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uResolution: new THREE.Uniform(
      new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio),
    ),
    uPictureTexture: new THREE.Uniform(textureLoader.load(picUrl)),
    uDisplacementTexture: new THREE.Uniform(displacement.texture),
  },
});

fileInput.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement;
  if (!target?.files?.[0]) return;

  const imageUrl = URL.createObjectURL(target?.files?.[0]);
  particlesMaterial.uniforms.uPictureTexture.value = textureLoader.load(imageUrl);
});

gui.add(parameters, 'uploadImage');

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Materials
  particlesMaterial.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio,
  );

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
const tick = () => {
  controls.update();
  /**
   * Raycaster
   */
  displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
  const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane);
  if (intersections?.[0]) {
    const uv = intersections[0].uv as THREE.Vector2;

    displacement.canvasCursor.x = uv.x * displacement.canvas.width;
    displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height;
  }

  /**
   * Displacement
   */
  if (displacement.context) {
    // Fade out
    displacement.context.globalCompositeOperation = 'source-over';
    displacement.context.globalAlpha = 0.02;
    displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height);

    // Speed alpha
    const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor);
    displacement.canvasCursorPrevious.copy(displacement.canvasCursor);
    const alpha = Math.min(cursorDistance * 0.1, 1);

    // Draw glow
    displacement.context.globalCompositeOperation = 'lighten';
    const glowSize = displacement.canvas.width * 0.25;
    displacement.context.globalAlpha = alpha;
    displacement.context.drawImage(
      displacement.glowImage,
      displacement.canvasCursor.x - glowSize * 0.5,
      displacement.canvasCursor.y - glowSize * 0.5,
      glowSize,
      glowSize,
    );
  }

  if (displacement.texture) displacement.texture.needsUpdate = true;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
