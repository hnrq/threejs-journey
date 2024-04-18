import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import anime from 'animejs';

import damagedHelmetModelUrl from './_models/DamagedHelmet/DamagedHelmet.gltf?url';
import environmentMapNXUrl from '@assets/_environmentMaps/streets/nx.jpg?url';
import environmentMapNYUrl from '@assets/_environmentMaps/streets/ny.jpg?url';
import environmentMapNZUrl from '@assets/_environmentMaps/streets/nz.jpg?url';
import environmentMapPXUrl from '@assets/_environmentMaps/streets/px.jpg?url';
import environmentMapPYUrl from '@assets/_environmentMaps/streets/py.jpg?url';
import environmentMapPZUrl from '@assets/_environmentMaps/streets/pz.jpg?url';

/**
 * Loaders
 */
const loadingBarElement = <HTMLDivElement>document.querySelector('.loading-bar');
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    anime({ targets: overlayMaterial.uniforms.uAlpha, duration: 3000, value: 0, delay: 1 });

    loadingBarElement.classList.add('ended');
    loadingBarElement.style.transform = '';
  },
  (_itemUrl, itemsLoaded, itemsTotal) => {
    loadingBarElement.style.transform = `scaleX(${itemsLoaded / itemsTotal})`;
    sceneReady = true;
  },
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

/**
 * Base
 */
let sceneReady = false;

// Debug
const debugObject = {
  envMapIntensity: 2.5,
};

// Canvas
const canvas = <HTMLCanvasElement>document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  // wireframe: true,
  transparent: true,
  uniforms: {
    uAlpha: new THREE.Uniform(1),
  },
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

const points = [
  {
    position: new THREE.Vector3(1.55, 0.3, -0.6),
    element: <HTMLDivElement>document.querySelector('.point-0'),
  },
  {
    position: new THREE.Vector3(0.5, 0.8, -1.6),
    element: <HTMLDivElement>document.querySelector('.point-1'),
  },
  {
    position: new THREE.Vector3(1.6, -1.3, -0.7),
    element: <HTMLDivElement>document.querySelector('.point-2'),
  },
];

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      // child.material.envMap = environmentMap
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
gltfLoader.load(damagedHelmetModelUrl, (gltf) => {
  gltf.scene.scale.set(2.5, 2.5, 2.5);
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

  if (sceneReady)
    points.forEach((point) => {
      const screenPosition = point.position.clone();
      screenPosition.project(camera);

      const translateX = screenPosition.x * sizes.width * 0.5;
      const translateY = -screenPosition.y * sizes.height * 0.5;
      point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;

      raycaster.setFromCamera(screenPosition as unknown as THREE.Vector2, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length === 0) point.element.classList.add('visible');
      else
        point.element.classList.toggle(
          'visible',
          intersects[0].distance > point.position.distanceTo(camera.position),
        );
    });
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
