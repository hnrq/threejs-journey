<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls, PerfMonitor } from '@threlte/extras';
  import Fox from './Fox.svelte';
  import Hamburger from './Hamburger.svelte';
</script>

<PerfMonitor />

<T.PerspectiveCamera makeDefault fov={45} near={0.1} far={200} position={[3, 2, 6]}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[1, 2, 3]} intensity={4.5} />
<T.AmbientLight intensity={1.5} />

<T.Mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI * 0.5, 0, 0]} scale={10}>
  <T.PlaneGeometry />
  <T.MeshStandardMaterial color="greenyellow" />
</T.Mesh>

<Fox position={[2, 0, 0]} />
<Hamburger position={[-2, 0, 0]} />
