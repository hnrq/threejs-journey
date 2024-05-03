<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import CustomObject from './CustomObject.svelte';
</script>

<T.PerspectiveCamera makeDefault fov={45} near={0.1} far={200} position={[3, 2, 6]}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[1, 2, 3]} intensity={4.5} />
<T.AmbientLight intensity={1.5} />

<T.Group>
  <T.Mesh position={[-2, 0, 0]}>
    <T.SphereGeometry />
    <T.MeshStandardMaterial color="orange" />
  </T.Mesh>

  <T.Mesh rotation={[0, Math.PI * 0.25, 0]} position={[2, 0, 0]} scale={1.5}>
    <T.BoxGeometry />
    <T.MeshStandardMaterial color="mediumpurple" />
  </T.Mesh>
</T.Group>

<T.Mesh position={[0, -1, 0]} rotation={[-Math.PI * 0.5, 0, 0]} scale={10}>
  <T.PlaneGeometry />
  <T.MeshStandardMaterial color="greenyellow" />
</T.Mesh>

<CustomObject />
