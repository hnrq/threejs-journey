import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla/dist/three-custom-shader-material-vanilla.cjs';

import gearsModelUrl from './_models/gears.glb?url';
import slicedFragmentShader from './_shaders/sliced/fragment.glsl';
import slicedVertexShader from './_shaders/sliced/vertex.glsl';
import aerodynamicsWorkshopHDRUrl from './_textures/aerodynamics_workshop.hdr?url';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 });

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loaders
const rgbeLoader = new RGBELoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Environment map
 */
rgbeLoader.load(aerodynamicsWorkshopHDRUrl, (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.backgroundBlurriness = 0.5;
  scene.environment = environmentMap;
});

/**
 * Sliced model
 */
// Geometry

// Material
const uniforms = {
  uSliceStart: new THREE.Uniform(1.75),
  uSliceArc: new THREE.Uniform(1.25),
};

const patchMap = {
  csm_Slice: {
    '#include <colorspace_fragment>': `
      #include <colorspace_fragment>

      if(!gl_FrontFacing)
        gl_FragColor = vec4(0.75, 0.15, 0.3, 1.0);
    `,
  },
};

const material = new THREE.MeshStandardMaterial({
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: 0x858080,
});
const slicedMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader: slicedVertexShader,
  fragmentShader: slicedFragmentShader,
  patchMap,
  side: THREE.DoubleSide,
  uniforms,
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: 0x858080,
  silent: true,
});

const slicedDepthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader: slicedVertexShader,
  depthPacking: THREE.RGBADepthPacking,
  patchMap,
  uniforms,
  silent: true,
});

gui.add(uniforms.uSliceStart, 'value', -Math.PI, Math.PI, 0.001).name('uSliceStart');
gui.add(uniforms.uSliceArc, 'value', 0, Math.PI * 2, 0.001).name('uSliceArc');

// Model;
let model: THREE.Object3D;

gltfLoader.load(gearsModelUrl, (gltf) => {
  model = gltf.scene;
  model.traverse((child) => {
    if ((<THREE.Mesh>child).isMesh) {
      (<THREE.Mesh>child).material = child.name === 'outerHull' ? slicedMaterial : material;
      if (child.name === 'outerHull') (<THREE.Mesh>child).customDepthMaterial = slicedDepthMaterial;
      (<THREE.Mesh>child).castShadow = true;
      (<THREE.Mesh>child).receiveShadow = true;
    }
  });
  scene.add(model);
});

/**
 * Plane
 */
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: '#aaaaaa' }),
);
plane.receiveShadow = true;
plane.position.x = -4;
plane.position.y = -3;
plane.position.z = -4;
plane.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(plane);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 4);
directionalLight.position.set(6.25, 3, 4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.normalBias = 0.05;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
scene.add(directionalLight);

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
camera.position.set(-5, 5, 12);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

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

  // Update controls
  controls.update();

  if (model !== undefined) model.rotation.y = elapsedTime * 0.1;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
