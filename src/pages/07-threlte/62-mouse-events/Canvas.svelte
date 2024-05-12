<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './components/Scene.svelte';
  import BvhRaycast from './components/BvhRaycast.svelte';
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
