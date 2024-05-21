import hitAudioUrl from '@assets/audio/hit.mp3';
import type { ContactEvent } from '@threlte/rapier';
import { clamp } from 'svelte-tweakpane-ui/Utils.js';

const hitSound = new Audio(hitAudioUrl);

const playHitSound = (e: ContactEvent) => {
  if (e.totalForceMagnitude < 20) return;
  hitSound.volume = clamp((e.totalForceMagnitude * 50) / 1100, 0.1, 1);
  hitSound.play();
};

export default playHitSound;
