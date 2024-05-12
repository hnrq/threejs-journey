<script lang="ts">
  import { injectPlugin } from '@threlte/core';
  import type { BufferGeometry, Mesh } from 'three';
  import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

  const isBufferGeometry = (ref: any): ref is BufferGeometry => ref.isBufferGeometry;
  const isMesh = (ref: any): ref is Mesh => ref.isMesh;

  injectPlugin('bvh-raycast', () => ({
    onRefChange(ref) {
      if (isBufferGeometry(ref)) {
        (ref as any).computeBoundsTree = computeBoundsTree;
        (ref as any).disposeBoundsTree = disposeBoundsTree;
        (ref as any).computeBoundsTree();
      }
      if (isMesh(ref)) ref.raycast = acceleratedRaycast;
      return () => {
        if (isBufferGeometry(ref)) (ref as any).disposeBoundsTree();
      };
    },
  }));
</script>

<slot />
