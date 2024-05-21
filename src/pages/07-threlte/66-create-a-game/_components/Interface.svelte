<script lang="ts">
  import { getContext, onDestroy } from 'svelte';
  import type { GameContext } from '../_context/GameContext.svelte';
  import KeyboardContext from '../_context/KeyboardContext.svelte';

  const { snapshot, send } = getContext<GameContext>('game');
  const { activeKeys } = getContext<KeyboardContext>('keyboard');

  let time = 0;
  const timer = () => {
    time += 1;
  };
  let interval: number;

  $: if ($snapshot.matches('playing')) interval = setInterval(timer, 1);
  $: if ($snapshot.matches('ended')) clearInterval(interval);
  $: if ($snapshot.matches('ready')) time = 0;

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="interface">
  <div class="time">{(time / 1000).toFixed(3)}</div>

  {#if $snapshot.matches('ended')}
    <button class="restart" on:click={() => send({ type: 'RESTART' })}>Restart</button>
  {/if}

  <div class="controls">
    <div class="raw">
      <div class="key" class:active={$activeKeys.has('w') || $activeKeys.has('ArrowUp')} />
    </div>
    <div class="raw">
      <div class="key" class:active={$activeKeys.has('a') || $activeKeys.has('ArrowLeft')} />
      <div class="key" class:active={$activeKeys.has('s') || $activeKeys.has('ArrowDown')} />
      <div class="key" class:active={$activeKeys.has('d') || $activeKeys.has('ArrowRight')} />
    </div>
    <div class="raw">
      <div class="key large" class:active={$activeKeys.has(' ')} />
    </div>
  </div>
</div>

<style>
  /**
 * Time
 */
  .time {
    position: absolute;
    top: 15%;
    left: 0;
    width: 100%;
    color: #ffffff;
    font-size: 6vh;
    background: #00000033;
    padding-top: 5px;
    text-align: center;
  }

  /**
 * Restart
 */
  .restart {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 40%;
    left: 0;
    width: 100%;
    color: #ffffff;
    font-size: 80px;
    background: #00000033;
    padding-top: 10px;
    pointer-events: auto;
    cursor: pointer;
  }

  /**
 * Controls
 */
  .controls {
    position: absolute;
    bottom: 10%;
    left: 0;
    width: 100%;
  }

  .controls .raw {
    display: flex;
    justify-content: center;
  }

  .controls .key {
    width: 40px;
    height: 40px;
    margin: 4px;
    border: 2px solid #ffffff;
    background: #ffffff44;
  }

  .controls .key.large {
    width: 144px;
  }

  .controls .key.active {
    background: #ffffff99;
  }
</style>
