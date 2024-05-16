import * as THREE from 'three';

import type Rapier from '@dimforge/rapier3d-compat';
import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import environmentMaps0NXUrl from '@assets/_environmentMaps/streets/nx.jpg?url';
import environmentMaps0NYUrl from '@assets/_environmentMaps/streets/nx.jpg?url';
import environmentMaps0NZUrl from '@assets/_environmentMaps/streets/nx.jpg?url';
import environmentMaps0PXUrl from '@assets/_environmentMaps/streets/nx.jpg?url';
import environmentMaps0PYUrl from '@assets/_environmentMaps/streets/nx.jpg?url';
import environmentMaps0PZUrl from '@assets/_environmentMaps/streets/nx.jpg?url';

THREE.ColorManagement.enabled = false;

const RAPIER = await import('@dimforge/rapier3d-compat');
await RAPIER.init();

/**
 * Debug
 */
const gui = new dat.GUI();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  environmentMaps0PXUrl,
  environmentMaps0NXUrl,
  environmentMaps0PYUrl,
  environmentMaps0NYUrl,
  environmentMaps0PZUrl,
  environmentMaps0NZUrl,
]);

const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const createBox = (size: number, position: THREE.Vector3, world: Rapier.World) => {
  const mesh = new THREE.Mesh(
    boxGeometry,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      metalness: 0.3,
      roughness: 0.3,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5,
    }),
  );

  mesh.castShadow = true;
  mesh.position.copy(position);
  mesh.scale.set(size, size, size);

  scene.add(mesh);

  const collider = world.createCollider(
    RAPIER.ColliderDesc.cuboid(size / 2, size / 2, size / 2)
      .setTranslation(...(<[number, number, number]>Object.values(position)))
      .setFriction(0.1)
      .setRestitution(0.7),
    world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()),
  );

  return { mesh, collider };
};

const createSphere = (
  radius: number,
  position: THREE.Vector3,
  world: Rapier.World,
): { mesh: THREE.Mesh; collider: Rapier.Collider } => {
  const mesh = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      metalness: 0.3,
      roughness: 0.3,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5,
    }),
  );

  mesh.castShadow = true;
  mesh.position.copy(position);
  mesh.scale.set(radius, radius, radius);

  scene.add(mesh);

  const collider = world.createCollider(
    RAPIER.ColliderDesc.ball(radius)
      .setTranslation(...(<[number, number, number]>Object.values(position)))
      .setFriction(0.1)
      .setRestitution(1.5),
    world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()),
  );

  return { mesh, collider };
};

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  }),
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Physics
 */
const world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });

world.createCollider(
  RAPIER.ColliderDesc.cuboid(100, 0, 100),
  world.createRigidBody(RAPIER.RigidBodyDesc.fixed()),
);

const objects: ReturnType<typeof createSphere>[] = [];

const debug = {
  createSphere: () => {
    const sphere = createSphere(
      THREE.MathUtils.randFloat(0.1, 0.8),
      new THREE.Vector3(0, 3, 0),
      world,
    );
    sphere.collider
      .parent()
      ?.applyImpulseAtPoint(
        new RAPIER.Vector3(
          THREE.MathUtils.randFloat(-0.3, 0.3),
          THREE.MathUtils.randFloat(-0.3, 0.3),
          THREE.MathUtils.randFloat(-0.3, 0.3),
        ),
        sphere.mesh.position,
        true,
      );
    objects.push(sphere);
  },
  createBox: () => {
    const box = createBox(THREE.MathUtils.randFloat(0.1, 0.8), new THREE.Vector3(0, 3, 0), world);
    box.collider
      .parent()
      ?.applyImpulseAtPoint(
        new RAPIER.Vector3(
          THREE.MathUtils.randFloat(-0.3, 0.3),
          THREE.MathUtils.randFloat(-0.3, 0.3),
          THREE.MathUtils.randFloat(-0.3, 0.3),
        ),
        box.mesh.position,
        true,
      );
    objects.push(box);
  },
};

gui.add(debug, 'createSphere');
gui.add(debug, 'createBox');

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

const tick = () => {
  world.step();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  objects.forEach(({ mesh, collider }) => {
    mesh.position.copy(collider.translation() as THREE.Vector3);
    mesh.quaternion.copy(collider.rotation() as THREE.Quaternion);
  });

  window.requestAnimationFrame(tick);
};

tick();
