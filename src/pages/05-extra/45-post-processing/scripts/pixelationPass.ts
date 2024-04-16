import type * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import type GUI from 'lil-gui';

const params = {
  pixelSize: 6,
  normalEdgeStrength: 0.3,
  depthEdgeStrength: 0.4,
  pixelAlignedPanning: true,
};

const addControls = (gui: GUI, renderPixelatedPass: RenderPixelatedPass) => {
  const pixelationFolder = gui.addFolder('Pixelation');

  pixelationFolder
    .add(params, 'pixelSize')
    .min(1)
    .max(16)
    .step(1)
    .onChange(() => {
      renderPixelatedPass.setPixelSize(params.pixelSize);
    });
  pixelationFolder.add(renderPixelatedPass, 'normalEdgeStrength').min(0).max(2).step(0.05);
  pixelationFolder.add(renderPixelatedPass, 'depthEdgeStrength').min(0).max(1).step(0.05);
  pixelationFolder.add(params, 'pixelAlignedPanning');
};

const addPixelationPass = (
  composer: EffectComposer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  gui?: GUI,
) => {
  const renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
  composer.addPass(renderPixelatedPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  if (gui) addControls(gui, renderPixelatedPass);
};

export default addPixelationPass;
