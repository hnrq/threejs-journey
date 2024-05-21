<script lang="ts">
  import { boxGeometry, wallMaterial } from './Level.svelte';
  import { T } from '@threlte/core';
  import { RigidBody, AutoColliders, Collider } from '@threlte/rapier';

  export let length = 1;
</script>

<RigidBody type="fixed">
  <AutoColliders restitution={0.2} friction={0} shape="cuboid">
    <T.Mesh
      position={[2.15, 0.75, -(length * 2) + 2]}
      geometry={boxGeometry}
      material={wallMaterial}
      scale={[0.3, 1.5, 4 * length]}
      castShadow
    />
    <T.Mesh
      position={[-2.15, 0.75, -(length * 2) + 2]}
      geometry={boxGeometry}
      material={wallMaterial}
      scale={[0.3, 1.5, 4 * length]}
      receiveShadow
    />
    <T.Mesh
      position={[0, 0.75, -(length * 4) + 2]}
      geometry={boxGeometry}
      material={wallMaterial}
      scale={[4, 1.5, 0.3]}
      receiveShadow
    />
  </AutoColliders>
  <T.Group position={[0, -0.1, -(length * 2) + 2]}>
    <Collider shape="cuboid" args={[2, 0.1, 2 * length]} restitution={0.2} friction={1} />
  </T.Group>
</RigidBody>
