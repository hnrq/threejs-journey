<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { GLTF, OrbitControls, PerfMonitor, interactivity } from '@threlte/extras';
  import { Mesh, MeshStandardMaterial } from 'three';
  import hamburgerModelUrl from '@assets/_models/Hamburger.glb?url';
  import type { ThrelteEvents } from 'node_modules/@threlte/extras/dist/interactivity/types';

  interactivity();

  let cube: Mesh;

  useTask((delta) => {
    if (cube) cube.rotation.y += delta * 0.2;
  });

  const eventHandler = (event: ThrelteEvents['click']) => {
    (event.eventObject.material as MeshStandardMaterial).color.set(
      `hsl(${Math.random() * 360}, 100%, 75%)`,
    );
  };
</script>

<PerfMonitor />
<T.PerspectiveCamera makeDefault fov={45} near={0.1} far={200} position={[-4, 3, 6]}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[1, 2, 3]} intensity={4.5} />
<T.AmbientLight intensity={1.5} />

<T.Mesh
  position={[-2, 0, 0]}
  on:click={eventHandler}
  on:pointerenter={() => {
    document.body.style.cursor = 'pointer';
  }}
  on:pointerleave={() => {
    document.body.style.cursor = 'default';
  }}
>
  <T.SphereGeometry />
  <T.MeshStandardMaterial color="orange" />
</T.Mesh>

<T.Mesh
  bind:ref={cube}
  position={[2, 0, 0]}
  scale={1.5}
  on:click={eventHandler}
  on:pointerenter={() => {
    document.body.style.cursor = 'pointer';
  }}
  on:pointerleave={() => {
    document.body.style.cursor = 'default';
  }}
>
  <T.BoxGeometry />
  <T.MeshStandardMaterial color="mediumpurple" />
</T.Mesh>

<T.Mesh position={[0, -1, 0]} rotation={[-Math.PI * 0.5, 0, 0]} scale={10}>
  <T.PlaneGeometry />
  <T.MeshStandardMaterial color="greenyellow" />
</T.Mesh>

<GLTF
  url={hamburgerModelUrl}
  scale={0.25}
  position={[0, 0.5, 0]}
  useDraco
  on:click={(event) => {
    console.log(event.object);
    event.stopPropagation();
  }}
/>
