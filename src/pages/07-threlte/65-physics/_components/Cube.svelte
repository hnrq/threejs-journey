<script lang="ts" context="module">
  export const muted = writable(false);
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshToonMaterial();
</script>

<script lang="ts">
  import { T } from '@threlte/core';
  import { PositionalAudio } from '@threlte/extras';
  import { Collider, RigidBody, type ContactEvent } from '@threlte/rapier';
  import type * as RAPIER from '@dimforge/rapier3d-compat';
  import hitAudioUrl from '../_audio/hit.mp3';
  import popAudioUrl from '../_audio/pop.mp3';
  import { BoxGeometry, Color, Euler, MeshToonMaterial, Vector3 } from 'three';
  import { clamp } from 'three/src/math/MathUtils.js';
  import { writable } from 'svelte/store';

  export let position: Vector3 | undefined = undefined;
  export let color: Color | undefined = undefined;
  export let scale: number = 1;
  export let rotation: Euler | undefined = undefined;

  type Sound = { volume: number; stop?: () => void; play?: () => void };

  const hitSound: Sound = { volume: 10 };
  const popSound: Sound = { volume: 10 };

  let rigidBody: RAPIER.RigidBody;

  const handleClick = () => {
    rigidBody.applyImpulse(new Vector3(0, 5 * rigidBody.mass(), 0), true);
    rigidBody.applyTorqueImpulse(
      {
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
        z: Math.random() - 0.5,
      },
      false,
    );
  };

  const fireHitSound = (e: ContactEvent) => {
    if ($muted) return;
    hitSound.volume = clamp(e.totalForceMagnitude / 1100, 0.1, 1);
    hitSound.stop?.();
    hitSound.play?.();
  };

  const firePopSound = () => {
    if ($muted) return;

    popSound.stop?.();
    popSound.play?.();
  };

  $: rotationCasted = rotation?.toArray() as [x: number, y: number, z: number];
</script>

<T.Group position={position?.toArray()} scale={[scale, scale, scale]} rotation={rotationCasted}>
  <RigidBody
    bind:rigidBody
    type="dynamic"
    gravityScale={1}
    on:contact={fireHitSound}
    on:create={firePopSound}
  >
    <PositionalAudio
      autoplay={false}
      detune={(0.5 - scale) * 12000}
      bind:stop={popSound.stop}
      bind:play={popSound.play}
      bind:volume={popSound.volume}
      src={popAudioUrl}
    />
    <PositionalAudio
      autoplay={false}
      detune={600 - Math.random() * 1200}
      bind:stop={hitSound.stop}
      bind:play={hitSound.play}
      bind:volume={hitSound.volume}
      src={hitAudioUrl}
    />
    <Collider
      contactForceEventThreshold={30}
      restitution={0}
      friction={0.7}
      args={[0.5, 0.5, 0.5]}
      shape="cuboid"
    />
    <T.Mesh
      castShadow
      {geometry}
      material={color ? new MeshToonMaterial({ color }) : material}
      on:click={handleClick}
    />
  </RigidBody>
</T.Group>
