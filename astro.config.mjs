import { defineConfig } from 'astro/config';
import glsl from 'vite-plugin-glsl';
import netlify from '@astrojs/netlify';
import svelte from "@astrojs/svelte";
import wasm from 'vite-plugin-wasm';


// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({
    edgeMiddleware: true
  }),
  vite: {
    plugins: [wasm(), glsl()]
  },
  integrations: [svelte()]
});