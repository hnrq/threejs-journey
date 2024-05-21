<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { OrbitControls, PerfMonitor, Text3DGeometry, useTexture } from '@threlte/extras';
  import { Group, TorusGeometry } from 'three';

  const donutGeometry = new TorusGeometry();
  let donutsGroup: Group;

  useTask((delta) => {
    donutsGroup?.children.forEach((donut) => {
      donut.rotation.y += delta * 0.2;
    });
  });
</script>

<PerfMonitor />
<T.PerspectiveCamera makeDefault fov={45} near={0.1} far={2000} position={[3, 2, 6]}>
  <OrbitControls />
</T.PerspectiveCamera>

{#await useTexture('https://raw.githubusercontent.com/nidorx/matcaps/master/256/7B5254_E9DCC7_B19986_C8AC91-256px.png') then matcap}
  <T.Group bind:ref={donutsGroup}>
    {#each [...Array(100)] as _donut}
      <T.Mesh
        position={[
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ]}
        scale={0.2 + Math.random() * 0.2}
        rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        geometry={donutGeometry}
      >
        <T.MeshMatcapMaterial {matcap} />
      </T.Mesh>
    {/each}
  </T.Group>
  <T.Mesh position={[-2, 0, 0]}>
    <Text3DGeometry
      text="Hello Threlte"
      font="/fonts/helvetiker_regular.typeface.json"
      size={0.75}
      height={0.2}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.02}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={5}
    />
    <T.MeshMatcapMaterial {matcap} />
  </T.Mesh>
{/await}
