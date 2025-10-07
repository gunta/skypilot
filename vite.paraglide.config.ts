import { defineConfig } from 'vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
    }),
  ],
  build: {
    emptyOutDir: false,
    write: false,
    rollupOptions: {
      input: 'scripts/paraglide-entry.ts',
      onwarn(warning, warn) {
        if (warning.code === 'EMPTY_BUNDLE') {
          return;
        }
        warn(warning);
      },
    },
  },
});
