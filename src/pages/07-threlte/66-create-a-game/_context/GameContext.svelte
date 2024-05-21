<script lang="ts" context="module">
  const gameMachine = createMachine({
    id: 'game',
    context: {
      blocksCount: 10,
      blocksSeed: 0,
      startTime: 0,
      endTime: 0,
    },
    initial: 'ready',
    states: {
      ready: {
        on: {
          START: {
            actions: assign({ startTime: () => Date.now() }),
            target: 'playing',
          },
        },
      },
      playing: {
        on: {
          END: {
            actions: assign({ endTime: () => Date.now() }),
            target: 'ended',
          },
          RESTART: {
            actions: assign({ blocksSeed: () => Math.random() }),
            target: 'ready',
          },
        },
      },
      ended: {
        on: {
          RESTART: {
            actions: assign({ blocksSeed: () => Math.random() }),
            target: 'ready',
          },
        },
      },
    },
  });

  export type GameContext = ReturnType<typeof useMachine<typeof gameMachine>>;
</script>

<script lang="ts">
  import { useMachine } from '@xstate/svelte';
  import { setContext } from 'svelte';
  import { assign, createMachine } from 'xstate';

  const { snapshot, send } = useMachine(gameMachine);

  setContext('game', { snapshot, send });
</script>

<slot />
