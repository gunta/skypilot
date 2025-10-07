import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@web': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, '../..', 'src')
    }
  },
  server: {
    port: 5175,
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
