<script lang="ts" context="module">
  interface Controls {
    enableScale?: boolean;
    enableVisibility?: boolean;
    enablePosition?: boolean;
    enableColor?: boolean;
  }
</script>

<script lang="ts">
  import { Folder, Slider, Checkbox, type PointValue2d, Point, Color } from 'svelte-tweakpane-ui';

  export let enabledControls: Controls = {
    enableScale: true,
    enableVisibility: true,
    enablePosition: true,
    enableColor: true,
  };
  export let title: string;
  export let scale: number = 1.5;
  export let visible: boolean = true;
  export let position: PointValue2d = [-2, 0];
  export let color: string = '#ff0000';
</script>

<Folder {title}>
  {#if enabledControls.enableScale}
    <Slider label="Scale" bind:value={scale} step={0.01} min={0} max={5} />
  {/if}

  {#if enabledControls.enableVisibility}
    <Checkbox label="Visible" bind:value={visible} />
  {/if}

  {#if enabledControls.enablePosition}
    <Point
      bind:value={position}
      expanded
      optionsY={{ inverted: true }}
      label="Position"
      picker="inline"
      userExpandable={false}
      step={0.01}
    />
  {/if}

  {#if enabledControls.enableColor}
    <Color bind:value={color} label="color" />
  {/if}
</Folder>
