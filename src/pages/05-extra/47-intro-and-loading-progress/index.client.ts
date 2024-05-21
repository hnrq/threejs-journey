import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import anime from 'animejs';

import flightHelmetModelUrl from './_models/FlightHelmet/FlightHelmet.gltf?url';
import environmentMapNXUrl from '@assets/environmentMaps/streets/nx.jpg?url';
import environmentMapNYUrl from '@assets/environmentMaps/streets/ny.jpg?url';
import environmentMapNZUrl from '@assets/environmentMaps/streets/nz.jpg?url';
import environmentMapPXUrl from '@assets/environmentMaps/streets/px.jpg?url';
import environmentMapPYUrl from '@assets/environmentMaps/streets/py.jpg?url';
import environmentMapPZUrl from '@assets/environmentMaps/streets/pz.jpg?url';

/**
 * Base
 */
// Debug
const debugObject = { envMapIntensity: 2.5 };

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: { uAlpha: new THREE.Uniform(1) },
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uAlpha;

    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
  `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar') as HTMLDivElement;
const loadingLabelElement = document.querySelector('.loading-label') as HTMLDivElement;
const loadingManager = new THREE.LoadingManager(
  () => {
    anime
      .timeline()
      .add({
        targets: loadingBarElement,
        scale: 30,
        duration: 2000,
        complete: () => {
          overlayMaterial.uniforms.uAlpha.value = 0;
          scene.remove(overlay);
          overlayGeometry.dispose();
          overlayMaterial.dispose();
          loadingLabelElement.textContent = '';
        },
      })
      .add({
        targets: loadingBarElement,
        opacity: 0,
        duration: 3000,
      });
  },

  // Progress
  (_itemUrl, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `translate(-50%, -50%) scale(${progress})`;
    loadingLabelElement.textContent = `${Math.round(progress * 100)}%`;
  },
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = debugObject.envMapIntensity;
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
  environmentMapPXUrl,
  environmentMapNXUrl,
  environmentMapPYUrl,
  environmentMapNYUrl,
  environmentMapPZUrl,
  environmentMapNZUrl,
]);

environmentMap.colorSpace = THREE.SRGBColorSpace;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load(flightHelmetModelUrl, (gltf) => {
  gltf.scene.scale.set(10, 10, 10);
  gltf.scene.position.set(0, -4, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

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
});

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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
