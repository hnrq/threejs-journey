<script lang="ts">
  import { GLTF, Text } from '@threlte/extras';
  import hamburgerModelUrl from '@assets/_models/Hamburger.glb?url';
  import { AutoColliders, RigidBody } from '@threlte/rapier';
  import { T } from '@threlte/core';
  import { boxGeometry, floor1Material } from './Level.svelte';

  export let position: [number, number, number] = [0, 0, 0];
</script>

<T.Group {position}>
  <Text scale={1} position={[0, 2.25, 2]}>
    FINISH
    <T.MeshBasicMaterial toneMapped={false} />
  </Text>
  <T.Mesh
    geometry={boxGeometry}
    material={floor1Material}
    position={[0, 0, 0]}
    scale={[4, 0.2, 4]}
    receiveShadow
  />
  <T.Group position.y={0.25}>
    <RigidBody type="fixed">
      <AutoColliders shape="convexHull">
        <GLTF
          url={hamburgerModelUrl}
          scale={0.2}
          restitution={0.2}
          friction={0}
          useDraco
          castShadow
        />
      </AutoColliders>
    </RigidBody>
  </T.Group>
</T.Group>
