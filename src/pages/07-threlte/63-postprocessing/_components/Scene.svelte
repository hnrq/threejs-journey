<script lang="ts">
  import { T, useRender, useThrelte } from '@threlte/core';
  import { Pane, Slider } from 'svelte-tweakpane-ui';
  import { BlendFunction, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
  import { OrbitControls, PerfMonitor } from '@threlte/extras';
  import DrunkEffect from './DrunkEffect';
  import { type Camera } from 'three';

  let drunkFrequency = 2;
  let drunkAmplitude = 0.1;

  const { scene, renderer, camera, size } = useThrelte();
  const composer = new EffectComposer(renderer);

  const setupEffectComposer = (camera: Camera, frequency: number, amplitude: number) => {
    composer.removeAllPasses();
    composer.addPass(new RenderPass(scene, camera));
    // composer.addPass(
    //   new EffectPass(
    //     camera,
    //     new GlitchEffect({
    //       delay: new Vector2(0.5, 1),
    //       duration: new Vector2(0.1, 0.3),
    //       strength: new Vector2(0.2, 0.4),
    //       mode: GlitchMode.CONSTANT_MILD,
    //     }),
    //   ),
    // );
    composer.addPass(
      new EffectPass(
        camera,
        new DrunkEffect({ blendFunction: BlendFunction.DARKEN, frequency, amplitude }),
      ),
    );
  };
  // We need to set up the passes according to the camera in use
  $: setupEffectComposer($camera, drunkFrequency, drunkAmplitude);
  $: composer.setSize($size.width, $size.height);

  useRender((_, delta) => {
    composer.render(delta);
  });
</script>

<Pane position="fixed">
  <Slider bind:value={drunkFrequency} min={0} max={20} step={1.0} label="Frequency" />
  <Slider bind:value={drunkAmplitude} min={0} max={1} step={0.1} label="Amplitude" />
</Pane>

<PerfMonitor />
<T.PerspectiveCamera makeDefault fov={45} near={0.1} far={200} position={[-4, 3, 6]}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
<T.AmbientLight intensity={1.5} />

<T.Mesh castShadow position={[-2, 0, 0]}>
  <T.SphereGeometry />
  <T.MeshStandardMaterial color="orange" />
</T.Mesh>

<T.Mesh castShadow position={[2, 0, 0]} scale={1.5}>
  <T.BoxGeometry />
  <T.MeshStandardMaterial color="mediumpurple" />
</T.Mesh>

<T.Mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI * 0.5, 0, 0]} scale={10}>
  <T.PlaneGeometry />
  <T.MeshStandardMaterial color="greenyellow" />
</T.Mesh>
