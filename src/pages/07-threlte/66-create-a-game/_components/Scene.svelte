<script lang="ts">
  import { T } from '@threlte/core';
  import Lights from './Lights.svelte';
  import Player from './Player.svelte';
  import Level from './level/Level.svelte';
  import { getContext } from 'svelte';
  import type { GameContext } from '../_context/GameContext.svelte';

  const { snapshot } = getContext<GameContext>('game');
</script>

<T.Color args={['#bdedfc']} attach="background" />

<Lights />
<Level count={$snapshot.context.blocksCount} seed={$snapshot.context.blocksSeed} />
<Player />
