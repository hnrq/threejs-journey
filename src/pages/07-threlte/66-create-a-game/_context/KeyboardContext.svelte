<script lang="ts" context="module">
  export type KeyboardContext = { activeKeys: SvelteStore<Set<string>> };
</script>

<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  const activeKeys = writable<Set<string>>(new Set());
  const keyDownEvent = (e: KeyboardEvent) => {
    if (!e.repeat) activeKeys.update((set: Set<string>) => set.add(e.key));
  };
  const keyUpEvent = (e: KeyboardEvent) => {
    if (!e.repeat)
      activeKeys.update((set: Set<string>) => {
        set.delete(e.key);
        return set;
      });
  };

  setContext('keyboard', { activeKeys });

  onMount(() => {
    window.addEventListener('keydown', keyDownEvent);
    window.addEventListener('keyup', keyUpEvent);

    return () => {
      window.removeEventListener('keydown', keyDownEvent);
      window.removeEventListener('keyup', keyUpEvent);
    };
  });
</script>

<slot />
