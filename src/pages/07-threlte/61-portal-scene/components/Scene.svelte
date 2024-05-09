<script>
  import { AdditiveBlending, BufferAttribute, Color, Uniform } from 'three';
  import { T, useFrame } from '@threlte/core';
  import { OrbitControls, useGltf, useTexture } from '@threlte/extras';
  import { Color as PaneColor } from 'svelte-tweakpane-ui';

  import bakedTextureUrl from '../../../06-portal-scene/_textures/baked.jpg?url';
  import modelUrl from '../../../06-portal-scene/_models/portal.glb?url';
  import firefliesVertexShader from '../../../06-portal-scene/52-adding-details-to-the-scene/_shaders/fireflies/vertex.glsl';
  import firefliesFragmentShader from '../../../06-portal-scene/52-adding-details-to-the-scene/_shaders/fireflies/fragment.glsl';
  import portalVertexShader from '../../../06-portal-scene/52-adding-details-to-the-scene/_shaders/portal/vertex.glsl';
  import portalFragmentShader from '../../../06-portal-scene/52-adding-details-to-the-scene/_shaders/portal/fragment.glsl';
  import { Pane } from 'svelte-tweakpane-ui';

  let colorStart = new Color('#ff0000');
  let colorEnd = new Color('#0000ff');

  const FIREFLIES = 30;
  const positionArray = new Float32Array(
    Array.from({ length: FIREFLIES * 3 }, (_, i) =>
      i % 2 === 0 ? (Math.random() - 0.5) * 4 : Math.random() * 1.5,
    ),
  );
  const scaleArray = new Float32Array(Array.from({ length: FIREFLIES }, Math.random));

  let model = useGltf(modelUrl);
  let time = 0;

  useFrame((_ctx, delta) => {
    time += delta;
  });
</script>

<Pane position="fixed">
  <PaneColor
    label="Start color"
    value={`#${colorStart.getHexString()}`}
    on:change={(e) => {
      colorStart.set(e.detail.value);
    }}
  />
  <PaneColor
    label="End color"
    value={`#${colorEnd.getHexString()}`}
    on:change={(e) => {
      colorEnd.set(e.detail.value);
    }}
  />
</Pane>

{#await useTexture(bakedTextureUrl, { transform: (texture) => {
    texture.flipY = false;
    return texture;
  } }) then bakedTexture}
  <T.PerspectiveCamera makeDefault fov={45} near={0.1} far={200} position={[3, 2, 6]}>
    <OrbitControls />
  </T.PerspectiveCamera>
  {#if $model}
    <T.Mesh geometry={$model.nodes.baked.geometry}>
      <T.MeshBasicMaterial map={bakedTexture} />
    </T.Mesh>

    <T.Mesh
      geometry={$model.nodes.poleLightA.geometry}
      position={[...$model.nodes.poleLightA.position]}
    >
      <T.MeshBasicMaterial color="#ffffe5" />
    </T.Mesh>
    <T.Mesh
      geometry={$model.nodes.poleLightB.geometry}
      position={[...$model.nodes.poleLightB.position]}
    >
      <T.MeshBasicMaterial color="#ffffe5" />
    </T.Mesh>

    <T.Mesh
      geometry={$model.nodes.portalLight.geometry}
      position={[...$model.nodes.portalLight.position]}
      rotation={[...$model.nodes.portalLight.rotation]}
    >
      <T.ShaderMaterial
        fragmentShader={portalFragmentShader}
        vertexShader={portalVertexShader}
        uniforms={{
          uTime: new Uniform(0),
          uColorStart: new Uniform(colorStart),
          uColorEnd: new Uniform(colorEnd),
        }}
        uniforms.uColorStart.value={colorStart}
        uniforms.uColorEnd.value={colorEnd}
        uniforms.uTime.value={time}
      />
    </T.Mesh>

    <T.Points>
      <T.BufferGeometry
        attributes={{
          aScale: new BufferAttribute(scaleArray, 1),
          position: new BufferAttribute(positionArray, 3),
        }}
      />
      <T.ShaderMaterial
        vertexShader={firefliesVertexShader}
        fragmentShader={firefliesFragmentShader}
        uniforms={{
          uPixelRatio: new Uniform(Math.min(window.devicePixelRatio, 2)),
          uSize: new Uniform(100),
          uTime: new Uniform(0),
        }}
        uniforms.uTime.value={time}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </T.Points>
  {/if}
{/await}
