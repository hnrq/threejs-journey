<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './_components/Scene.svelte';
  import { World } from '@threlte/rapier';
  import { HTML } from '@threlte/extras';
  import Interface from './_components/Interface.svelte';
  import KeyboardContext from './_components/context/KeyboardContext.svelte';
  import GameContext from './_components/context/GameContext.svelte';
</script>

<div>
  <GameContext>
    <KeyboardContext>
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
      <Interface />
    </KeyboardContext>
  </GameContext>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
