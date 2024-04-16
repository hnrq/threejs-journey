import type GUI from 'lil-gui';
import * as THREE from 'three';

import { Sky } from 'three/addons/objects/Sky.js';

// Add Sky
const sky = new Sky();
sky.scale.setScalar(450000);
const sun = new THREE.Vector3();

const createSky = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, gui?: GUI) => {
  scene.add(sky);

  const params = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure,
  };

  const onGuiChange = () => {
    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = params.turbidity;
    uniforms['rayleigh'].value = params.rayleigh;
    uniforms['mieCoefficient'].value = params.mieCoefficient;
    uniforms['mieDirectionalG'].value = params.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - params.elevation);
    const theta = THREE.MathUtils.degToRad(params.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms['sunPosition'].value.copy(sun);
    renderer.toneMappingExposure = params.exposure;
  };

  if (gui) {
    const skyFolder = gui.addFolder('Sky');
    skyFolder.add(params, 'turbidity', 0.0, 20.0, 0.1).onChange(onGuiChange);
    skyFolder.add(params, 'rayleigh', 0.0, 4, 0.001).onChange(onGuiChange);
    skyFolder.add(params, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(onGuiChange);
    skyFolder.add(params, 'mieDirectionalG', 0.0, 1, 0.001).onChange(onGuiChange);
    skyFolder.add(params, 'elevation', 0, 90, 0.1).onChange(onGuiChange);
    skyFolder.add(params, 'azimuth', -180, 180, 0.1).onChange(onGuiChange);
    skyFolder.add(params, 'exposure', 0, 1, 0.0001).onChange(onGuiChange);
  }

  onGuiChange();
};

export default createSky;
