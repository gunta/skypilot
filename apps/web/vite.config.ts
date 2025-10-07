import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true
    }),
    react()],
  resolve: {
    alias: {
      '@web': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, '../..', 'src')
    }
  },
  server: {
    port: 7176,
    open: true
  },
  preview: {
    port: 4175
  },
  build: {
    sourcemap: true,
    outDir: 'dist'
  }
});
