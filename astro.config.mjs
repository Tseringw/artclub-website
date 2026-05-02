// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // TODO: replace with the real custom domain before deploy
  vite: {
    plugins: [tailwindcss()]
  }
});
