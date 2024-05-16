<script lang="ts">
  import { GLTF } from '@threlte/extras';
  import modelUrl from '@assets/_models/Hamburger.glb?url';
  import { type ComponentProps } from 'svelte';

  type $$Props = Omit<ComponentProps<GLTF>, 'url'>;
</script>

<GLTF url={modelUrl} useDraco scale={0.35} {...$$props} />
