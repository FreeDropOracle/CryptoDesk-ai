import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'assets/icons',
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@shared/public': path.resolve(__dirname, 'src/shared/public')
    }
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: false
  },
  base: './'
});
