<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './_components/Scene.svelte';
  import BvhRaycast from './_components/BvhRaycast.svelte';
</script>

<div>
  <Canvas on:pointermissed={() => console.log('You missed the pointer')}>
    <BvhRaycast>
      <Scene />
    </BvhRaycast>
  </Canvas>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
