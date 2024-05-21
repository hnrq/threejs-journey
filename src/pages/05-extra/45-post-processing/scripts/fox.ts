import type * as THREE from 'three';

import type { GLTFLoader } from 'three/examples/jsm/Addons.js';
import CrossfadeMixer from './CrossfadeMixer';
import type GUI from 'lil-gui';
import FoxModel from '@assets/models/Fox.glb?url';

const load = async (gltfLoader: GLTFLoader, gui: GUI) => {
  // Actions
  let mixer: ReturnType<typeof CrossfadeMixer>;
  let model: THREE.Group<THREE.Object3DEventMap>;

  const gltf = await gltfLoader.loadAsync(FoxModel);
  model = gltf.scene;
  model.scale.set(0.025, 0.025, 0.025);
  model.traverse((object) => {
    if ((<THREE.Mesh>object).isMesh) object.castShadow = true;
  });
  mixer = CrossfadeMixer(model, gltf.animations);

  mixer.createPanel(gui);

  return { model, mixer };
};

export default load;
