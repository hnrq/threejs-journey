<script lang="ts">
  import { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
  import { T, useTask } from '@threlte/core';
  import { Clock, Euler, Quaternion } from 'three';
  import { boxGeometry, floor2Material, obstacleMaterial } from './Level.svelte';
  import { RigidBody, AutoColliders } from '@threlte/rapier';
  import playHitSound from '../../_utils/hitAudio';

  const speed = (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1);
  const clock = new Clock();

  export let position: [number, number, number] = [0, 0, 0];
  let rigidBody: RapierRigidBody;

  useTask(() => {
    const rotation = new Quaternion();
    rotation.setFromEuler(new Euler(0, clock.getElapsedTime() * speed, 0));
    if (rigidBody !== undefined) rigidBody.setNextKinematicRotation(rotation);
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
      <AutoColliders restitution={0.2} friction={0} shape="cuboid" on:contact={playHitSound}>
        <T.Mesh
          geometry={boxGeometry}
          scale={[3.5, 0.3, 0.3]}
          material={obstacleMaterial}
          castShadow
          receiveShadow
        />
      </AutoColliders>
    </RigidBody>
  </T.Group>
</T.Group>
