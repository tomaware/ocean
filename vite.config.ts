import { copyFileSync, mkdirSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

/** Scripts des widgets iPhone publiés avec le site (onglet « Widgets » : copier / télécharger). Noms sans espace ni accent. */
export const WIDGET_FILES: [string, string][] = [['widgets/iphone/OCEAN Vent.js', 'ocean-vent.js'], ['widgets/iphone/OCEAN Créneaux.js', 'ocean-creneaux.js']];
const widgets = (): Plugin => ({
  name: 'ocean-widgets',
  apply: 'build',
  writeBundle(opt) {
    const dir = `${opt.dir ?? 'dist'}/widgets`;
    mkdirSync(dir, { recursive: true });
    for (const [from, to] of WIDGET_FILES) copyFileSync(from, `${dir}/${to}`);
  },
});

// base relative : le site fonctionne sous https://tomaware.github.io/ocean/ comme en local
export default defineConfig({
  base: './',
  plugins: [preact(), widgets()],
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 700 },
  server: { port: 5173 },
});
