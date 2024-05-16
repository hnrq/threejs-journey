<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import Controls from './Controls.svelte';
  import { Pane } from 'svelte-tweakpane-ui';

  let sphereControls = {
    scale: 1.5,
    visible: true,
    position: [-2, 0] as [number, number],
    color: '#ff0000',
  };
  let cubeControls = {
    scale: 0.5,
    visible: true,
    position: [0, 2] as [number, number],
    color: '#82f1ad',
  };
</script>

<Pane title="Controls" position="fixed">
  <Controls
    title="Sphere"
    bind:scale={sphereControls.scale}
    bind:visible={sphereControls.visible}
    bind:position={sphereControls.position}
    bind:color={sphereControls.color}
  />
  <Controls
    title="Cube"
    bind:scale={cubeControls.scale}
    bind:visible={cubeControls.visible}
    bind:position={cubeControls.position}
    bind:color={cubeControls.color}
  />
</Pane>

<T.PerspectiveCamera makeDefault fov={45} near={0.1} far={200} position={[3, 2, 6]}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[1, 2, 3]} intensity={4.5} />
<T.AmbientLight intensity={1.5} />

<T.Group>
  <T.Mesh
    scale={sphereControls.scale}
    position={[...sphereControls.position, 0]}
    visible={sphereControls.visible}
  >
    <T.SphereGeometry />
    <T.MeshStandardMaterial color={sphereControls.color} />
  </T.Mesh>

  <T.Mesh
    scale={cubeControls.scale}
    position={[...cubeControls.position, 0]}
    visible={cubeControls.visible}
  >
    <T.BoxGeometry />
    <T.MeshStandardMaterial color={cubeControls.color} />
  </T.Mesh>
</T.Group>

<T.Mesh position={[0, -1, 0]} rotation={[-Math.PI * 0.5, 0, 0]} scale={10}>
  <T.PlaneGeometry />
  <T.MeshStandardMaterial color="greenyellow" />
</T.Mesh>
