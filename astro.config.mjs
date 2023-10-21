import netlify from '@astrojs/netlify/functions';
import { defineConfig } from 'astro/config';
import wasm from 'vite-plugin-wasm';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  vite: {
    plugins: [wasm()],
  },
});
