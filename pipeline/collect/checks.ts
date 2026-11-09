// Contrôles de la collecte : fidélité aux moteurs actuels, couverture, fraîcheur, confidentialité.
import type { Check, CollectBundle, CollectPoint, ForecastBlock, ObservationBlock } from '../../src/types/contracts.ts';
import { SurfEngine } from './points.ts';

type Legacy = Record<string, { time: number[]; models: Record<string, Record<string, unknown>> }>;

/**
 * Fidélité : le même JSON brut lu par le parseur du moteur surf actuel et par OCEAN doit donner les mêmes valeurs
 * (aux unités près). Prouve que la normalisation (temps, unités, modèles) ne change rien.
 */
export function fidelityMarine(raw: unknown, points: CollectPoint[], block: ForecastBlock): Check {
  const legacy = SurfEngine.parseOpenMeteoMarine(raw, points.map((p) => p.id)) as Legacy;
  let n = 0, bad = 0, ex = '';
  const pairs: [string, (m: Record<string, any>) => (number | null)[] | null | undefined][] = [
    ['wave_height', (m) => m.hs], ['wave_period', (m) => m.tm], ['wave_peak_period', (m) => m.tp], ['wave_direction', (m) => m.dir],
    ['swell_wave_height', (m) => m.sw1?.h], ['swell_wave_direction', (m) => m.sw1?.d], ['wind_wave_height', (m) => m.ww?.h],
  ];
  for (const p of points) {
    const L = legacy[p.id];
    if (!L) { bad++; ex ||= `point ${p.id} absent côté moteur`; continue; }
    if (L.time.length !== block.times.length || L.time.some((t, i) => t !== block.times[i])) { bad++; ex ||= `heures différentes au point ${p.id}`; continue; }
    for (const [m, lm] of Object.entries(L.models)) {
      for (const [v, get] of pairs) {
        const a = get(lm as Record<string, any>), b = block.values[p.id]?.[m]?.[v];
        if (!a) continue;
        a.forEach((x, i) => {
          if (x === null || x === undefined) return;
          n++;
          const y = b?.[i];
          if (y === null || y === undefined || Math.abs(y - x) > 1e-3) { bad++; ex ||= `${p.id} ${m} ${v} [${i}] moteur ${x} / OCEAN ${y}`; }
        });
      }
    }
  }
  return { id: 'fidelite-vagues', ok: n > 0 && bad === 0, detail: `${n} valeurs comparées au parseur du moteur surf, ${bad} écart(s)${ex ? ' — ex. ' + ex : ''}` };
}

export function fidelityWind(raw: unknown, points: CollectPoint[], block: ForecastBlock): Check {
  const legacy = SurfEngine.parseOpenMeteoWind(raw, points.map((p) => p.id)) as Legacy;
  const models = SurfEngine.OM_WIND_MODELS as Record<string, string>;
  let n = 0, bad = 0, ex = '';
  for (const p of points) {
    const L = legacy[p.id];
    for (const [k, m] of Object.entries(models)) {
      const lm = L?.models[k] as { spd?: number[]; dir?: number[]; gust?: number[] } | undefined;
      if (!lm) continue;
      const cmp = (a: number[] | undefined, v: string, f: number) => (a ?? []).forEach((x, i) => {
        if (x === null || x === undefined) return;
        n++;
        const y = block.values[p.id]?.[m]?.[v]?.[i];
        if (y === null || y === undefined || Math.abs(y - x * f) > 1e-3) { bad++; ex ||= `${p.id} ${m} ${v} [${i}] moteur ${x * f} / OCEAN ${y}`; }
      });
      cmp(lm.spd, 'wind_speed_10m', 1 / 3.6); cmp(lm.gust, 'wind_gusts_10m', 1 / 3.6); cmp(lm.dir, 'wind_direction_10m', 1);
    }
  }
  return { id: 'fidelite-vent', ok: n > 0 && bad === 0, detail: `${n} valeurs comparées au parseur des moteurs surf / downwind, ${bad} écart(s)${ex ? ' — ex. ' + ex : ''}` };
}

/** Chaque point a au moins un modèle complet à ≥ 90 % sur les 48 prochaines heures, pour la variable clé. */
export function coverage(block: ForecastBlock, key: string, now: number): Check {
  const idx = block.times.map((t, i) => [t, i] as const).filter(([t]) => t >= now && t < now + 48 * 3600e3).map(([, i]) => i);
  const weak: string[] = [];
  for (const [pid, byModel] of Object.entries(block.values)) {
    const best = Math.max(0, ...Object.values(byModel).map((s) => {
      const a = s[key]; if (!a || !idx.length) return 0;
      return idx.filter((i) => a[i] !== null && a[i] !== undefined).length / idx.length;
    }));
    if (best < 0.9) weak.push(`${pid} ${Math.round(best * 100)} %`);
  }
  const pts = Object.keys(block.values).length;
  return { id: 'couverture-' + block.id, ok: idx.length >= 47 && weak.length === 0 && pts > 0,
    detail: `${pts} points, ${idx.length} h à venir dans la grille ; ${weak.length ? 'incomplets : ' + weak.slice(0, 6).join(', ') : 'tous complets (≥ 90 % sur 48 h)'}` };
}

export function hourlyGrid(block: ForecastBlock, now: number): Check {
  const t = block.times;
  const steps = t.slice(1).every((x, i) => x - t[i] === 3600e3);
  const onHour = t.every((x) => x % 3600e3 === 0);
  const span = t.length ? `${new Date(t[0]).toISOString().slice(0, 13)}h → ${new Date(t[t.length - 1]).toISOString().slice(0, 13)}h UTC` : 'vide';
  const covers = t.length > 0 && t[0] <= now - 48 * 3600e3 && t[t.length - 1] >= now + 6 * 86400e3;
  return { id: 'grille-' + block.id, ok: steps && onHour && covers, detail: `${t.length} heures, ${span}${steps && onHour ? '' : ' — pas horaire irrégulier'}${covers ? '' : ' — période trop courte'}` };
}

export function freshness(block: ObservationBlock, maxAgeMin: number, only?: string[]): Check {
  const now = block.provenance.fetchedAt;
  const lines: string[] = [];
  let ok = true;
  for (const [id, st] of Object.entries(block.stations)) {
    if (only && !only.includes(id)) continue;
    const last = st.t.length ? st.t[st.t.length - 1] : null;
    const age = last ? Math.round((now - last) / 60000) : null;
    if (age === null || age > maxAgeMin) ok = false;
    lines.push(`${id} ${age === null ? 'aucune mesure' : age + ' min'}`);
  }
  return { id: 'fraicheur-' + block.id, ok, detail: lines.join(' · ') + ` (seuil ${maxAgeMin} min)` };
}

/** Rien de privé dans ce qui est publié : pas de relevé Winds-Up, pas de clé, pas d'URL Apps Script. */
export function privacy(bundle: CollectBundle, secrets: string[]): Check {
  const s = JSON.stringify(bundle);
  const leaks: string[] = [];
  if (/"live"\s*:/.test(s)) leaks.push('clé « live »');
  if (/script\.google(usercontent)?\.com/.test(s)) leaks.push('URL Apps Script');
  if (/[?&](key|apikey|token)=/i.test(s)) leaks.push('paramètre de clé dans une URL');
  if (/winds-up\.com/i.test(s)) leaks.push('URL Winds-Up');
  for (const x of secrets) if (x && x.length > 8 && s.includes(x)) leaks.push('un secret');
  return { id: 'confidentialite', ok: leaks.length === 0, detail: leaks.length ? 'FUITE : ' + leaks.join(', ') : 'aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées' };
}
