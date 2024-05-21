<script lang="ts" context="module">
  import * as THREE from 'three';

  export const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  export const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' });
  export const floor2Material = new THREE.MeshStandardMaterial({ color: 'greenyellow' });
  export const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered' });
  export const wallMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey' });
</script>

<script lang="ts">
  import BlockAxe from './BlockAxe.svelte';
  import BlockEnd from './BlockEnd.svelte';
  import BlockLimbo from './BlockLimbo.svelte';
  import BlockSpinner from './BlockSpinner.svelte';
  import BlockStart from './BlockStart.svelte';
  import Bounds from './Bounds.svelte';

  export let blockTypes = [BlockSpinner, BlockAxe, BlockLimbo];
  export let count = 5;
  export let seed = 0;

  let blocks: Array<typeof BlockSpinner | typeof BlockAxe | typeof BlockLimbo> = [];

  const generateBlocks = () => {
    blocks = Array.from(
      { length: count },
      () => blockTypes[Math.floor(Math.random() * blockTypes.length)],
    );
  };

  $: seed, generateBlocks();
</script>

<BlockStart position={[0, 0, 0]} />
{#each blocks as block, index}
  <svelte:component this={block} position={[0, 0, -(index + 1) * 4]} />
{/each}
<BlockEnd position={[0, 0, -(count + 1) * 4]} />
<Bounds length={count + 2} />
