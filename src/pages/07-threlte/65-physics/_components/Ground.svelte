<script lang="ts">
  import { T } from '@threlte/core';
  import { AutoColliders } from '@threlte/rapier';
</script>

<T.Group position={[0, -1.25, 0]}>
  <AutoColliders shape={'cuboid'}>
    <T.Mesh receiveShadow>
      <T.BoxGeometry args={[100, 0.5, 100]} />
      <T.MeshToonMaterial color="#3a011d" />
    </T.Mesh>
  </AutoColliders>
</T.Group>
