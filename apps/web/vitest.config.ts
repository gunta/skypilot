import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true
  },
  resolve: {
    alias: {
      '@web': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, '../..', 'src')
    }
  }
});
