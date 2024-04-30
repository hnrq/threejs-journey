import GUI from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import portalModelUrl from '../_models/portal.glb?url';
import portalTextureUrl from '../_textures/baked.jpg?url';
import firefliesFragmentShader from './_shaders/fireflies/fragment.glsl';
import firefliesVertexShader from './_shaders/fireflies/vertex.glsl';
import portalVertexShader from './_shaders/portal/vertex.glsl';
import portalFragmentShader from './_shaders/portal/fragment.glsl';

/**
 * Base
 */
// Debug
const debugObject = { clearColor: 0x201919, portalColorStart: 0xff0000, portalColorEnd: 0x0000ff };
const gui = new GUI({ width: 400 });

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const texture = textureLoader.load(portalTextureUrl);
texture.flipY = false;
texture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: texture });
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });
const portalLightMaterial = new THREE.ShaderMaterial({
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColorStart: new THREE.Uniform(new THREE.Color(debugObject.portalColorStart)),
    uColorEnd: new THREE.Uniform(new THREE.Color(debugObject.portalColorEnd)),
  },
});

gui.addColor(debugObject, 'portalColorStart').onChange((color: string) => {
  portalLightMaterial.uniforms.uColorStart?.value.set(color);
});

gui.addColor(debugObject, 'portalColorEnd').onChange((color: string) => {
  portalLightMaterial.uniforms.uColorEnd?.value.set(color);
});
/**
 * Model
 */
gltfLoader.load(portalModelUrl, (gltf) => {
  gltf.scene.traverse((child) => {
    (<THREE.Mesh>child).material = bakedMaterial;

    if (child.name === 'baked') (<THREE.Mesh>child).material = bakedMaterial;
    else if (child.name.includes('poleLight')) (<THREE.Mesh>child).material = poleLightMaterial;
    else if (child.name.includes('portalLight')) (<THREE.Mesh>child).material = portalLightMaterial;
  });

  scene.add(gltf.scene);
});

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for (let i = 0; i < firefliesCount; i++) {
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
  positionArray[i * 3 + 1] = Math.random() * 1.5;
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
  scaleArray[i] = Math.random();
}

// ...
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
const firefliesMaterial = new THREE.ShaderMaterial({
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  uniforms: {
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    uSize: new THREE.Uniform(100),
    uTime: new THREE.Uniform(0),
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

gui
  .add(<THREE.Uniform>firefliesMaterial.uniforms.uSize, 'value')
  .min(0)
  .max(500)
  .step(1)
  .name('firefliesSize');

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

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
  (<THREE.Uniform>firefliesMaterial.uniforms.uPixelRatio).value = Math.min(
    window.devicePixelRatio,
    2,
  );
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setClearColor(debugObject.clearColor);
gui.addColor(debugObject, 'clearColor').onChange((color: string) => renderer.setClearColor(color));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  (<THREE.Uniform>firefliesMaterial.uniforms.uTime).value = elapsedTime;
  (<THREE.Uniform>portalLightMaterial.uniforms.uTime).value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
