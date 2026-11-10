import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// base relative : le site fonctionne sous https://tomaware.github.io/ocean/ comme en local
export default defineConfig({
  base: './',
  plugins: [preact()],
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 700 },
  server: { port: 5173 },
});
