<script lang="ts">
  import type RAPIER from '@dimforge/rapier3d-compat';
  import { useTask, T, useThrelte } from '@threlte/core';
  import { boxGeometry, floor2Material, obstacleMaterial } from './Level.svelte';
  import { RigidBody, AutoColliders } from '@threlte/rapier';
  import { Clock } from 'three';

  const timeOffset = Math.random() * Math.PI * 2;

  export let position: [number, number, number] = [0, 0, 0];
  let rigidBody: RAPIER.RigidBody;
  const clock = new Clock();

  useTask(() => {
    const x = Math.sin(clock.getElapsedTime() + timeOffset) * 1.25;
    rigidBody.setNextKinematicTranslation({
      x: position[0] + x,
      y: position[1] + 0.75,
      z: position[2],
    });
  });
</script>

<T.Group {position}>
  <T.Mesh
    geometry={boxGeometry}
    material={floor2Material}
    position={[0, -0.1, 0]}
    scale={[4, 0.2, 4]}
    receiveShadow
  />
  <T.Group position.y={0.3}>
    <RigidBody bind:rigidBody type="kinematicPosition">
      <AutoColliders restitution={0.2} friction={0} shape="cuboid">
        <T.Mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[1.5, 1.5, 0.3]}
          castShadow
          receiveShadow
        />
      </AutoColliders>
    </RigidBody>
  </T.Group>
</T.Group>
