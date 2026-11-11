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
        return [1, 2, 3].map((st) => hh.filter((h: any) => stars(h.scores[L]) === st).length).concat(hh.length);
      })]));
      const sessions = Object.fromEntries(LEVELS.map((L) => [L, (s.sessions?.[L] ?? []).filter((w: any) => w.end > now && w.start <= until).map((w: any) => {
        const hh = hours.filter((h: any) => h.t >= w.start && h.t < w.end);
        const kn = hh.map((h: any) => h.kn).filter((x: any) => x != null);
        return { s: w.start, e: w.end, h: w.hours, p: w.peak, kn: kn.length ? Math.round(kn.reduce((a: number, b: number) => a + b, 0) / kn.length) : null,
          g: hh.length ? Math.round(Math.max(...hh.map((h: any) => h.gust ?? 0))) : null, dir: circ(hh.map((h: any) => h.dir).filter((x: any) => x != null)) };
      })]));
      return {
        id: s.id, name: s.name, short: SHORT[s.id] ?? s.name, source: s.source?.kind ?? 'corrected',
        // [heure, vent nd, rafales nd, direction °, jour 1/0, note Sécu first, note OffShore]
        hours: hours.map((h: any) => [h.t, h.kn == null ? null : Math.round(h.kn), h.gust == null ? null : Math.round(h.gust), h.dir, h.day ? 1 : 0, h.scores.secu, h.scores.offshore]),
        sessions, daily,
      };
    }),
    obs,
  };
}
