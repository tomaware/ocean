// ④ VULGARISATION — sessions « 2H » communes aux trois disciplines et textes simples.
// Aucune note n'est recalculée ici : on lit les notes horaires des moteurs (surf, downwind, wing) et on cherche
// les créneaux d'au moins 2 h d'affilée à 5/10 ou plus, de jour (même règle que la note wing, D-17).
import type { Registry } from '../../src/types/contracts.ts';

export type Discipline = 'wing' | 'surf' | 'downwind';
export type Level = 'debutant' | 'intermediaire' | 'confirme' | 'secu' | 'offshore';
export const LEVELS: Level[] = ['debutant', 'intermediaire', 'confirme'];          // downwind (moteur actuel)
export const WING_MODES: Level[] = ['secu', 'offshore'];                          // wing v2 (D-19)
export const ALL_LEVELS: Level[] = [...LEVELS, ...WING_MODES];
export const LEVEL_LABEL: Record<Level, string> = { debutant: 'débutant', intermediaire: 'intermédiaire', confirme: 'confirmé', secu: 'Sécu first', offshore: 'Offshore' };
/** « Ça envoie » (wing, D-19) : seulement si la session compte au moins 4 h de vent moyen au-dessus de 20 nd. */
export const ENVOIE_KN = 20, ENVOIE_H = 4;
export const SESSION_MIN_H = 2, SESSION_SCORE = 5;
const H = 3600e3;

export type Session = {
  id: string; discipline: Discipline; spot: string; spotName: string; level: Level | 'tous';
  start: number; end: number; hours: number; mean: number; peak: number; peakAt: number;
  label: string; tone: 'top' | 'ok'; text: string; why: string | null; confidence: number | null;
  envoie: boolean; windyHours: number | null;   // heures à plus de 20 nd (wing)
};

export const label = (s: number | null | undefined) => (s === null || s === undefined ? '—' : s >= 7 ? 'Ça envoie' : s >= 5 ? 'Ça se tente' : 'Non');
const DIR16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
export const compass = (d: number | null | undefined) => (d === null || d === undefined ? '?' : DIR16[Math.round((((d % 360) + 360) % 360) / 22.5) % 16]);
export const f1 = (x: number | null | undefined) => (x === null || x === undefined ? '—' : x.toFixed(1).replace('.', ','));
const kmhToKn = (x: number | null | undefined) => (x === null || x === undefined ? null : x / 1.852);

type Hour = { t: number; s: number | null; day: boolean; i: number };
/** Créneaux de jour : au moins 2 h consécutives (pas d'heure manquante) à ≥ 5. */
export function windows(hours: Hour[], now: number): { from: number; to: number; idx: number[] }[] {
  const out: { from: number; to: number; idx: number[] }[] = [];
  let cur: Hour[] = [];
  const flush = () => { if (cur.length >= SESSION_MIN_H) out.push({ from: cur[0].t, to: cur[cur.length - 1].t + H, idx: cur.map((h) => h.i) }); cur = []; };
  for (const h of hours) {
    if (h.t + H <= now) continue;
    const ok = h.day && h.s !== null && h.s >= SESSION_SCORE;
    if (ok && cur.length && h.t - cur[cur.length - 1].t !== H) flush();
    if (ok) cur.push(h); else flush();
  }
  flush();
  return out;
}

function mk(d: Discipline, spot: string, spotName: string, level: Level | 'tous', w: { from: number; to: number; idx: number[] }, scores: number[], times: number[], text: (i: number) => string, why: (i: number) => string | null, conf: (i: number) => number | null): Session {
  const sc = w.idx.map((i) => scores[i]);
  const k = sc.indexOf(Math.max(...sc)), pi = w.idx[k];
  const mean = Math.round(sc.reduce((a, b) => a + b, 0) / sc.length * 10) / 10, peak = sc[k];
  return { id: `${d}:${spot}:${level}:${w.from}`, discipline: d, spot, spotName, level, start: w.from, end: w.to, hours: w.idx.length, mean, peak, peakAt: times[pi],
    label: label(peak), tone: peak >= 7 ? 'top' : 'ok', text: text(pi), why: why(pi), confidence: conf(pi), envoie: false, windyHours: null };
}

export function wingSessions(wing: any, now: number): Session[] {
  const out: Session[] = [];
  for (const s of wing.spots ?? []) {
    const times = s.hours.map((h: any) => h.t);
    const modes = Object.keys(s.hours[0]?.scores ?? {}) as Level[];
    for (const L of modes) {
      const sc = s.hours.map((h: any) => h.scores[L]);
      for (const w of windows(s.hours.map((h: any, i: number) => ({ t: h.t, s: h.scores[L], day: h.day, i })), now)) {
        const windy = w.idx.filter((i) => (s.hours[i].kn ?? 0) > ENVOIE_KN).length;
        out.push({ ...mk('wing', s.id, s.name, L, w, sc, times,
          (i) => { const h = s.hours[i]; return `${Math.round(h.kn)} nd de ${compass(h.dir)} (rafales ${h.gust === null ? '—' : Math.round(h.gust)})${h.sector ? ' · ' + sectorText(h.sector) : ''}`; },
          (i) => s.hours[i].limit[L], (i) => s.hours[i].conf), envoie: windy >= ENVOIE_H, windyHours: windy });
      }
    }
  }
  return out;
}
export const sectorText = (s: string) => ({ onshore: 'vent de mer', 'side-on': 'side-on', side: 'side-shore', 'side-off': 'side-off', offshore: 'vent de terre' } as Record<string, string>)[s] ?? s;

export function surfSessions(surf: any, now: number): Session[] {
  const out: Session[] = [];
  for (const s of surf.spots ?? []) {
    const h = s.h;
    for (const w of windows(h.t.map((t: number, i: number) => ({ t, s: h.score[i], day: h.day[i], i })), now)) {
      out.push(mk('surf', s.id, s.name, 'tous', w, h.score, h.t,
        (i) => `${f1(h.hb[i])} m (${f1(h.lo[i])}–${f1(h.hi[i])}) · ${h.tp[i] === null ? '—' : Math.round(h.tp[i])} s · vent ${h.ws[i] === null ? '—' : Math.round(kmhToKn(h.ws[i])!)} nd de ${compass(h.wd[i])}`,
        () => null, (i) => h.conf[i]));
    }
  }
  return out;
}

// colonnes de downwind.json : t, kn, gust, windFrom, shore, dir, bumpH, bumpT, hs, cross, debutant, intermediaire, confirme, day, roundTrip
export function downwindSessions(dw: any, now: number): Session[] {
  const out: Session[] = [];
  const col = Object.fromEntries((dw.hourFields as string[]).map((k, i) => [k, i]));
  for (const r of dw.runs ?? []) {
    const times = r.hours.map((x: number[]) => x[col.t]);
    for (const L of LEVELS) {
      const sc = r.hours.map((x: any[]) => x[col[L]]);
      for (const w of windows(r.hours.map((x: any[], i: number) => ({ t: x[col.t], s: x[col[L]], day: !!x[col.day], i })), now)) {
        out.push(mk('downwind', r.id, r.name, L, w, sc, times, (i) => {
          const x = r.hours[i];
          const sens = x[col.dir] === 'ab' ? `${r.a} → ${r.b}` : `${r.b} → ${r.a}`;
          return `${sens} · ${Math.round(x[col.kn])} nd de ${compass(x[col.windFrom])} · houle ${x[col.bumpH] === null ? '—' : f1(x[col.bumpH]) + ' m'}${x[col.bumpT] ? ' · ' + Math.round(x[col.bumpT]) + ' s' : ''}${x[col.roundTrip] ? ' · aller-retour possible' : ''}`;
        }, () => null, () => null));
      }
    }
  }
  return out;
}

export function allSessions(input: { wing: any; surf: any; downwind: any }, now: number): Session[] {
  return [...wingSessions(input.wing, now), ...surfSessions(input.surf, now), ...downwindSessions(input.downwind, now)].sort((a, b) => a.start - b.start || b.peak - a.peak);
}

/** Accueil : meilleure session à venir par discipline (pas de classement entre disciplines, D-15). */
export function bestByDiscipline(sessions: Session[], level: Level): Record<Discipline, Session | null> {
  const pick = (d: Discipline) => sessions.filter((s) => s.discipline === d && (s.level === level || s.level === 'tous'))
    .sort((a, b) => b.peak * 0.4 + b.mean * 0.6 + Math.min(b.hours, 5) * 0.1 - (a.peak * 0.4 + a.mean * 0.6 + Math.min(a.hours, 5) * 0.1))[0] ?? null;
  return { wing: pick('wing'), surf: pick('surf'), downwind: pick('downwind') };
}

/** Registre public : ce que l'interface a besoin de savoir sur chaque spot (pas d'identifiant Winds-Up). */
export function publicSpots(registry: Registry) {
  return registry.spots.map((s) => ({ id: s.id, name: s.name, kind: s.kind, disciplines: s.disciplines, waterBody: s.waterBody, geometry: s.geometry,
    orientation: s.orientation, confidence: s.confidence, notes: s.notes ?? null, legacy: Object.keys(s.legacy) }));
}
