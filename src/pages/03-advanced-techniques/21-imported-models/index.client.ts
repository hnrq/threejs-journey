import * as THREE from 'three';

import GUI, { Controller } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import FoxModel from './models/Fox.glb?url';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Loader
const gltfLoader = new GLTFLoader();
let mixer: THREE.AnimationMixer;

// Actions
const actions: ActionsByName = {};
const animationControllers: Controller[] = [];
let currentActionName = 'Survey';

const setWeight = (action: THREE.AnimationAction, weight: number) => {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
};

const executeCrossFade = (
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number,
) => {
  if (endAction) {
    setWeight(endAction, 1);
    endAction.time = 0;

    if (startAction) startAction.crossFadeTo(endAction, duration, true);
    else endAction.fadeIn(duration);
  } else {
    // Fade out

    startAction.fadeOut(duration);
  }
};

const synchronizeCrossFade = (
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number,
) => {
  const onLoopFinished = (event: THREE.AnimationMixerEventMap['loop']) => {
    if (event.action === startAction) {
      mixer.removeEventListener('loop', onLoopFinished);
      executeCrossFade(startAction, endAction, duration);
    }
  };

  mixer.addEventListener('loop', onLoopFinished);
};

const toggleButtonStyling = () => {
  animationControllers.forEach((control) => {
    const name = control.property;
    console.log(control.property);
    if (name === currentActionName) control.domElement.classList.add('controller--active');
    else control.domElement.classList.remove('controller--active');
  });
};

const prepareCrossFade = (
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number,
) => {
  if (currentActionName === 'Survey' || !startAction || !endAction) {
    executeCrossFade(startAction, endAction, duration);
  } else synchronizeCrossFade(startAction, endAction, duration);

  currentActionName = endAction?.getClip().name ?? 'None';
  toggleButtonStyling();
};

type ActionsByName = Record<string, { weight: number; action: THREE.AnimationAction }>;
const createPanel = () => {
  const panelSettings: Record<string, () => void> = {};

  ['None', ...Object.keys(actions)].forEach((actionName) => {
    panelSettings[actionName] = () => {
      const currentAction = actions[currentActionName]?.action ?? null;
      const action = actions[actionName]?.action ?? null;

      if (currentAction !== action) prepareCrossFade(currentAction, action, 0.35);
    };

    animationControllers.push(gui.add(panelSettings, actionName));
  });

  toggleButtonStyling();
};

const activateAction = (action: THREE.AnimationAction) => {
  const clip = action.getClip();
  setWeight(action, actions[clip.name].weight);
  action.play();
};

gltfLoader.load(FoxModel, (gltf) => {
  const model = gltf.scene;
  model.scale.set(0.025, 0.025, 0.025);
  model.traverse((object) => {
    if ((<THREE.Mesh>object).isMesh) object.castShadow = true;
  });
  new THREE.AnimationMixer(model);
  mixer = new THREE.AnimationMixer(model);
  gltf.animations.forEach((animation, index) => {
    const action = mixer.clipAction(animation);
    actions[animation.name] = { weight: index === 0 ? 1 : 0, action };
    activateAction(action);
  });
  scene.add(model);

  createPanel();
});

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0,
    roughness: 0.5,
  }),
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });

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
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  for (const actionName in actions) {
    actions[actionName].weight = actions[actionName].action.getEffectiveWeight();
  }

  // Update controls
  controls.update();
  if (mixer) mixer.update(deltaTime);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
