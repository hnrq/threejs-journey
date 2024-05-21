<script lang="ts">
  import type RAPIER from '@dimforge/rapier3d-compat';
  import { AutoColliders, RigidBody } from '@threlte/rapier';
  import { T, useTask } from '@threlte/core';
  import { boxGeometry, floor2Material, obstacleMaterial } from './Level.svelte';
  import { Clock } from 'three';
  import playHitSound from '../../_utils/hitAudio';

  const timeOffset = Math.random() * Math.PI * 2;
  const clock = new Clock();

  export let position: [number, number, number] = [0, 0, 0];
  let rigidBody: RAPIER.RigidBody;

  useTask(() => {
    const y = Math.sin(clock.getElapsedTime() + timeOffset) + 1.15;
    if (rigidBody)
      rigidBody.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] });
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
    <RigidBody bind:rigidBody type="kinematicPosition" on:contact={playHitSound}>
      <AutoColliders restitution={0.2} friction={0} shape="cuboid">
        <T.Mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[3.5, 0.3, 0.3]}
          castShadow
          receiveShadow
        />
      </AutoColliders>
    </RigidBody>
  </T.Group>
</T.Group>
