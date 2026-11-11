import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateRawSync } from 'node:zlib';
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

/** Scripts des widgets iPhone publiés avec le site (onglet « Widgets » : copier / télécharger). Noms sans espace ni accent. */
export const WIDGET_FILES: [string, string][] = [['widgets/iphone/OCEAN Vent.js', 'ocean-vent.js'], ['widgets/iphone/OCEAN Créneaux.js', 'ocean-creneaux.js'], ['widgets/iphone/OCEAN Vague.js', 'ocean-vague.js']];
/** Widget Windows : un .zip à extraire puis installer.cmd (fins de ligne Windows pour les .cmd et le LISEZ-MOI). */
export const WINDOWS_ZIP = 'ocean-widget-windows.zip';
const WINDOWS_FILES = ['installer.cmd', 'desinstaller.cmd', 'ocean-widget.ps1', 'LISEZ-MOI.txt'];
/** Widget Mac (Übersicht) : un .zip (les .command gardent le droit d'exécution). */
export const MAC_ZIP = 'ocean-widget-mac.zip';
const MAC_FILES = ['installer.command', 'desinstaller.command', 'ocean.jsx', 'LISEZ-MOI.txt'];

/** Archive .zip minimale (deflate), sans dépendance. */
export function zip(files: { name: string; data: Buffer; exec?: boolean }[], date = new Date()): Buffer {
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const local: Buffer[] = [], central: Buffer[] = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8'), body = deflateRawSync(f.data), crc = crc32(f.data);
    const h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(8, 8);
    h.writeUInt16LE(dosTime, 10); h.writeUInt16LE(dosDate, 12); h.writeUInt32LE(crc, 14); h.writeUInt32LE(body.length, 18); h.writeUInt32LE(f.data.length, 22); h.writeUInt16LE(name.length, 26);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(f.exec !== undefined ? 0x0314 : 20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10);
    c.writeUInt16LE(dosTime, 12); c.writeUInt16LE(dosDate, 14); c.writeUInt32LE(crc, 16); c.writeUInt32LE(body.length, 20); c.writeUInt32LE(f.data.length, 24); c.writeUInt16LE(name.length, 28); c.writeUInt32LE(offset, 42);
    // « créé sous Unix » + droits : les .command restent exécutables une fois extraits sur le Mac
    if (f.exec !== undefined) c.writeUInt32LE(((f.exec ? 0o100755 : 0o100644) << 16) >>> 0, 38);
    local.push(h, name, body); central.push(c, name);
    offset += 30 + name.length + body.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}
export function windowsZip(): Buffer {
  return zip(WINDOWS_FILES.map((f) => {
    let data = readFileSync(`widgets/windows/${f}`);
    if (f.endsWith('.txt')) data = Buffer.from(data.toString('utf8').replace(/\r?\n/g, '\r\n'), 'utf8');
    return { name: `OCEAN widget Windows/${f}`, data };
  }));
}

export function macZip(): Buffer {
  return zip(MAC_FILES.map((f) => ({ name: `OCEAN widget Mac/${f}`, data: readFileSync(`widgets/mac/${f}`), exec: f.endsWith('.command') })));
}

const widgets = (): Plugin => ({
  name: 'ocean-widgets',
  apply: 'build',
  writeBundle(opt) {
    const dir = `${opt.dir ?? 'dist'}/widgets`;
    mkdirSync(dir, { recursive: true });
    for (const [from, to] of WIDGET_FILES) copyFileSync(from, `${dir}/${to}`);
    writeFileSync(`${dir}/${WINDOWS_ZIP}`, windowsZip());
    writeFileSync(`${dir}/${MAC_ZIP}`, macZip());
  },
});

// base relative : le site fonctionne sous https://tomaware.github.io/ocean/ comme en local
export default defineConfig({
  base: './',
  plugins: [preact(), widgets()],
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 700 },
  server: { port: 5173 },
});
