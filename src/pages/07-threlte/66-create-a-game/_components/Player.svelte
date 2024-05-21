<script lang="ts">
  import type RAPIER from '@dimforge/rapier3d-compat';

  import { AutoColliders, RigidBody, useRapier } from '@threlte/rapier';
  import { Vector3 } from 'three';
  import { T, useTask, useThrelte } from '@threlte/core';
  import { getContext } from 'svelte';
  import type { GameContext } from './context/GameContext.svelte';

  const { activeKeys } = getContext<{ activeKeys: SvelteStore<Set<string>> }>('keyboard');
  const { snapshot, send } = getContext<GameContext>('game');

  $: $activeKeys.size > 0, send({ type: 'START' });

  let rigidBody: RAPIER.RigidBody;
  let smoothedCameraPosition = new Vector3(10, 10, 10);
  let smoothedCameraTarget = new Vector3();

  const { rapier, world } = useRapier();

  const jump = () => {
    const origin = rigidBody.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);

    if ((hit?.timeOfImpact ?? 0) < 0.15) rigidBody.applyImpulse({ x: 0, y: 0.2, z: 0 }, false);
  };

  const reset = () => {
    if (!rigidBody) return;

    rigidBody.setTranslation({ x: 0, y: 1, z: 0 }, false);
    rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, false);
    rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, false);
  };

  $: if ($snapshot.matches('ready')) {
    reset();
  }

  const { camera } = useThrelte();

  useTask((delta) => {
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if ($activeKeys.has('w') || $activeKeys.has('ArrowUp')) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }

    if ($activeKeys.has('d') || $activeKeys.has('ArrowRight')) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if ($activeKeys.has('s') || $activeKeys.has('ArrowDown')) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if ($activeKeys.has('a') || $activeKeys.has('ArrowLeft')) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }
    if ($activeKeys.has(' ')) {
      jump();
    }

    rigidBody.applyImpulse(impulse, false);
    rigidBody.applyTorqueImpulse(torque, false);

    const bodyPosition = rigidBody.translation();

    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    camera.update((camera) => {
      camera.position.copy(smoothedCameraPosition);
      camera.lookAt(smoothedCameraTarget);
      return camera;
    });

    /**
     * Phases
     */
    if (bodyPosition.z < -($snapshot.context.blocksCount * 4 + 2)) send({ type: 'END' });

    if (bodyPosition.y < -4) send({ type: 'RESTART' });
  });
</script>

<T.Group position={[0, 1, 0]}>
  <RigidBody bind:rigidBody canSleep={false} linearDamping={0.5} angularDamping={0.5}>
    <AutoColliders shape="ball" restitution={0.2} friction={1}>
      <T.Mesh castShadow>
        <T.IcosahedronGeometry args={[0.3, 1]} />
        <T.MeshStandardMaterial flatShading color="mediumpurple" />
      </T.Mesh>
    </AutoColliders>
  </RigidBody>
</T.Group>
