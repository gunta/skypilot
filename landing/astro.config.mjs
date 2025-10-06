import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://gunta.github.io',
  base: '/skypilot',
  integrations: [
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  build: {
    assets: '_assets'
  }
});

