<script lang="ts">
  import { T } from '@threlte/core';
  import { BufferAttribute, BufferGeometry, DoubleSide } from 'three';

  const verticesCount = 30;
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(
      new Float32Array(Array.from({ length: verticesCount * 3 }, () => Math.random() * 2 - 1)),
      3,
    ),
  );
  console.log(geometry.getAttribute('position'));
  geometry.computeVertexNormals();
</script>

<T.Mesh {geometry}>
  <T.MeshBasicMaterial color="red" side={DoubleSide} />
</T.Mesh>
