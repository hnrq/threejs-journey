<script lang="ts">
  import { T } from '@threlte/core';
  import { boxGeometry, floor1Material } from './Level.svelte';
  import { Float, Text } from '@threlte/extras';

  export let position: [number, number, number] = [0, 0, 0];
</script>

<T.Group {position}>
  <Float floatIntensity={0.25} rotationIntensity={0.25}>
    <Text
      scale={0.5}
      maxWidth={0.25}
      lineHeight={0.75}
      textAlign="right"
      position={[0.75, 0.65, 0]}
      rotation.y={-0.25}
    >
      Marble Race
      <T.MeshBasicMaterial toneMapped={false} />
    </Text>
  </Float>
  <T.Mesh
    geometry={boxGeometry}
    material={floor1Material}
    position={[0, -0.1, 0]}
    scale={[4, 0.2, 4]}
    receiveShadow
  />
</T.Group>
