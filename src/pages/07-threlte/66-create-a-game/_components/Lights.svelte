<script lang="ts">
  import { T, useThrelte } from '@threlte/core';
  import type { DirectionalLight } from 'three';

  let light: DirectionalLight;

  const { camera } = useThrelte();

  $: if (light !== undefined) {
    light.position.z = $camera.position.z + 1 - 4;
    light.target.position.z = $camera.position.z - 4;
    light.target.updateMatrixWorld();
  }
</script>

<T.DirectionalLight
  bind:light
  castShadow
  position={[4, 4, 1]}
  intensity={4.5}
  shadow-mapSize={[1024, 1024]}
  shadow-camera-near={1}
  shadow-camera-far={10}
  shadow-camera-top={10}
  shadow-camera-right={10}
  shadow-camera-bottom={-10}
  shadow-camera-left={-10}
/>
<T.AmbientLight intensity={1.5} />
