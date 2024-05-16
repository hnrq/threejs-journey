<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './_components/Scene.svelte';
  import { World } from '@threlte/rapier';
  import { HTML } from '@threlte/extras';
</script>

<div>
  <Canvas>
    <World>
      <Scene />
      <HTML slot="fallback" transform>
        <p>
          It seems your browser<br />
          doesn't support WASM.
        </p>
      </HTML>
    </World>
  </Canvas>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
