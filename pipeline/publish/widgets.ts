// Données des widgets iPhone / Mac / PC (D-25) : un petit fichier, lu toutes les 15 à 30 min par les widgets,
// au lieu de wing.json entier. Mêmes notes, créneaux et étoiles que l'app (rien n'est recalculé ici sauf des comptes).
const DAY = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
export const dayKeyParis = (t: number) => DAY.format(new Date(t));       // AAAA-MM-JJ
const LEVELS = ['secu', 'offshore'] as const;
export const SHORT: Record<string, string> = { 'la-franqui': 'La Franqui', 'la-grande-motte': 'G-Motte', 'le-ponant': 'Ponant', 'port-camargue': 'Espiguette', beauduc: 'Beauduc', 'le-jai': 'Le Jaï', almanarre: 'Almanarre' };
const stars = (s: number | null) => (s === null ? 0 : s >= 8.5 ? 3 : s >= 7 ? 2 : s >= 5 ? 1 : 0);
const circ = (ds: number[]) => {
  if (!ds.length) return null;
  const x = ds.reduce((a, d) => a + Math.sin((d * Math.PI) / 180), 0), y = ds.reduce((a, d) => a + Math.cos((d * Math.PI) / 180), 0);
  return Math.round((((Math.atan2(x, y) * 180) / Math.PI) + 360) % 360);
};

export function widgetWind(wing: any, obs: Record<string, unknown>, now: number) {
  const days: string[] = [];
  for (let k = 0; days.length < 5 && k < 8; k++) { const d = dayKeyParis(now + k * 86400e3); if (!days.includes(d)) days.push(d); }
  const until = now + 5 * 86400e3;
  return {
    version: 1, generatedAt: now, days, levels: LEVELS, app: 'https://tomaware.github.io/ocean/',
    note: 'Vent corrigé de la super prévision (nœuds), note wing v' + wing.version + ' ; Le Jaï : voir la source du spot',
    spots: (wing.spots ?? []).map((s: any) => {
      const hours = s.hours.filter((h: any) => h.t >= now - 3600e3 && h.t <= until);
      const daily = Object.fromEntries(LEVELS.map((L) => [L, days.map((d) => {
        const hh = hours.filter((h: any) => h.day && dayKeyParis(h.t) === d);
        // [heures 1★, 2★, 3★, heures de jour, heures « Kite session » (D-49 : plus de 28 nd, comptées à part, jamais en étoiles)]
        const ok = hh.filter((h: any) => !h.kite);
        return [1, 2, 3].map((st) => ok.filter((h: any) => stars(h.scores[L]) === st).length).concat(hh.length, hh.length - ok.length);
      })]));
      const sessions = Object.fromEntries(LEVELS.map((L) => [L, (s.sessions?.[L] ?? []).filter((w: any) => w.end > now && w.start <= until).map((w: any) => {
        const hh = hours.filter((h: any) => h.t >= w.start && h.t < w.end);
        const kn = hh.map((h: any) => h.kn).filter((x: any) => x != null);
        return { s: w.start, e: w.end, h: w.hours, p: w.peak, kn: kn.length ? Math.round(kn.reduce((a: number, b: number) => a + b, 0) / kn.length) : null,
          g: hh.length ? Math.round(Math.max(...hh.map((h: any) => h.gust ?? 0))) : null, dir: circ(hh.map((h: any) => h.dir).filter((x: any) => x != null)) };
      })]));
      return {
        id: s.id, name: s.name, short: SHORT[s.id] ?? s.name, source: s.source?.kind ?? 'corrected',
        // [heure, vent nd, rafales nd, direction °, jour 1/0, note Sécu first, note OffShore, Kite session 1/0 (D-49)]
        hours: hours.map((h: any) => [h.t, h.kn == null ? null : Math.round(h.kn), h.gust == null ? null : Math.round(h.gust), h.dir, h.day ? 1 : 0, h.scores.secu, h.scores.offshore, h.kite ? 1 : 0]),
        sessions, daily,
      };
    }),
    obs,
  };
}

// ------------------------------------------------------------------ widget Vague (surf)
export const SHORT_SURF: Record<string, string> = { carnon: 'Carnon', palavas: 'Palavas', sete: 'Sète', vias: 'Vias', 'saintes-maries': 'Stes-Maries', 'la-couronne': 'Couronne' };
const r1 = (x: number | null | undefined) => (x == null ? null : Math.round(x * 10) / 10);
const kn = (kmh: number | null | undefined) => (kmh == null ? null : Math.round(kmh / 1.852));

/** Données du widget Vague : notes, créneaux et étoiles du moteur surf (rien n'est recalculé sauf des comptes). */
export function widgetSurf(surf: any, sessions: { discipline: string; spot: string; start: number; end: number; hours: number; peak: number; mean: number }[], now: number) {
  const days: string[] = [];
  for (let k = 0; days.length < 5 && k < 8; k++) { const d = dayKeyParis(now + k * 86400e3); if (!days.includes(d)) days.push(d); }
  const until = now + 5 * 86400e3;
  return {
    version: 1, generatedAt: now, days, app: 'https://tomaware.github.io/ocean/',
    note: 'Vagues au bord (m) du moteur Super Prévi Surf, vent en nœuds ; note surf sur 10',
    spots: (surf.spots ?? []).map((s: any) => {
      const h = s.h, idx = h.t.map((_: number, i: number) => i).filter((i: number) => h.t[i] >= now - 3600e3 && h.t[i] <= until);
      const daily = days.map((d) => {
        const ii = idx.filter((i: number) => h.day[i] && dayKeyParis(h.t[i]) === d);
        return [1, 2, 3].map((st) => ii.filter((i: number) => stars(h.score[i]) === st).length).concat(ii.length);
      });
      const ses = sessions.filter((w) => w.discipline === 'surf' && w.spot === s.id && w.end > now && w.start <= until).map((w) => {
        const ii = idx.filter((i: number) => h.t[i] >= w.start && h.t[i] < w.end);
        const avg = (k: string) => { const v = ii.map((i: number) => h[k][i]).filter((x: any) => x != null); return v.length ? v.reduce((a: number, b: number) => a + b, 0) / v.length : null; };
        return { s: w.start, e: w.end, h: w.hours, p: w.peak, hb: r1(avg('hb')), tp: avg('tp') == null ? null : Math.round(avg('tp')!), ws: kn(avg('ws')),
          wd: circ(ii.map((i: number) => h.wd[i]).filter((x: any) => x != null)), sd: circ(ii.map((i: number) => h.dir[i]).filter((x: any) => x != null)) };
      });
      return {
        id: s.id, name: s.name, short: SHORT_SURF[s.id] ?? s.name,
        // [heure, vagues m, mini m, maxi m, période s, houle de °, vent nd, vent de °, type de vent, jour 1/0, note]
        hours: idx.map((i: number) => [h.t[i], r1(h.hb[i]), r1(h.lo[i]), r1(h.hi[i]), h.tp[i] == null ? null : Math.round(h.tp[i]), h.dir[i], kn(h.ws[i]), h.wd[i], h.wk?.[i] ?? null, h.day[i] ? 1 : 0, h.score[i]]),
        sessions: ses, daily,
      };
    }),
  };
}
