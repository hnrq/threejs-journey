<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls, PerfMonitor, interactivity, AudioListener } from '@threlte/extras';
  import Ground from './Ground.svelte';
  import Cube, { muted } from './Cube.svelte';
  import { Button, Pane } from 'svelte-tweakpane-ui';
  import { Color, Euler, Vector3 } from 'three';

  type Body = {
    id: string;
    position: Vector3;
    scale: number;
    color: Color;
    rotation: Euler;
  };

  interactivity();

  let cubes: Body[] = [];

  const addCube = () => {
    cubes.unshift({
      id: Math.random().toString(16).slice(2),
      position: new Vector3(0.5 - Math.random(), 2.5 - Math.random() + 5, 0.5 - Math.random()),
      scale: Math.random() * (1.0 - 0.1) + 0.1,
      color: new Color(Math.random(), Math.random(), Math.random()),
      rotation: new Euler(Math.random() * 10, Math.random() * 10, Math.random() * 10),
    });

    cubes = cubes;
  };
</script>

<Pane position="fixed">
  <Button
    label={`${$muted ? 'Unmute' : 'Mute'} sounds`}
    on:click={() => muted.update((curr) => !curr)}
  />
  <Button label="Add cube" on:click={addCube} />
</Pane>

<PerfMonitor />

<T.PerspectiveCamera makeDefault fov={45} near={0.1} far={500} position={[-4, 3, 6]}>
  <OrbitControls />
  <AudioListener />
</T.PerspectiveCamera>

<T.DirectionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
<T.AmbientLight intensity={1.5} />

<Ground />

{#each cubes as { position, rotation, id, color, scale } (id)}
  <Cube {position} {rotation} {color} {scale} />
{/each}
