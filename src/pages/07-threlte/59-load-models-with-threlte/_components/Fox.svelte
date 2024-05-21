<script lang="ts">
  import { GLTF, useGltfAnimations } from '@threlte/extras';
  import { Button, Pane } from 'svelte-tweakpane-ui';
  import modelUrl from '@assets/models/Fox.glb?url';
  import { type ComponentProps } from 'svelte';

  type $$Props = Omit<ComponentProps<GLTF>, 'url'>;

  const { gltf, actions, mixer } = useGltfAnimations();

  if (mixer) mixer.timeScale = 0.5;
  export const triggerAnimation = (animation: string) => {
    if ($actions[animation]?.isRunning()) $actions[animation]?.fadeOut(0.5);
    else $actions[animation]?.reset().fadeIn(0.5).play();
  };
</script>

<Pane position="fixed">
  {#each Object.keys($actions) as action}
    <Button on:click={() => triggerAnimation(action)} title={action} />
  {/each}
</Pane>

<GLTF bind:gltf={$gltf} url={modelUrl} scale={0.02} {...$$props} />
