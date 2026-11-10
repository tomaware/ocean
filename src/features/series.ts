// Mise en forme des séries publiées pour un spot (aucun calcul de note : on lit ce que les moteurs ont produit).
import type { AllData, Discipline, Level, PublicSpot } from '../services/data';
import { compass, kmhToKn, n0, n1 } from '../services/format';

export type Col = { key: string; label: string; num?: boolean; fmt: (r: any) => string; warn?: (r: any) => boolean };
export type Series = {
  discipline: Discipline; times: number[]; score: (number | null)[]; day: boolean[]; rows: any[]; cols: Col[];
  lines: { label: string; values: (number | null)[]; color: string; unit: string; scale?: string; dash?: number[] }[];
  levels: boolean; source: string; extra: { label: string; value: string }[];
};

const SECTOR: Record<string, string> = { onshore: 'de mer', 'side-on': 'side-on', side: 'side-shore', 'side-off': 'side-off', offshore: 'de terre', closed: 'plan d’eau', avoid: 'déconseillé' };
const SHORE: Record<string, string> = { on: 'de mer', sideon: 'side-on', side: 'side-shore', sideoff: 'side-off', off: 'de terre' };

export function seriesFor(d: AllData, spot: PublicSpot, disc: Discipline, level: Level): Series | null {
  if (disc === 'wing') {
    const w = d.wing.spots?.find((x: any) => x.id === spot.id);
    if (!w) return null;
    const hours = w.hours;
    return {
      discipline: 'wing', times: hours.map((h: any) => h.t), score: hours.map((h: any) => h.scores[level]), day: hours.map((h: any) => h.day), rows: hours, levels: true,
      cols: [
        { key: 'kn', label: 'Vent nd', num: true, fmt: (h) => n0(h.kn) },
        { key: 'gust', label: 'Rafales', num: true, fmt: (h) => n0(h.gust) },
        { key: 'dir', label: 'De', fmt: (h) => compass(h.dir) },
        { key: 'sector', label: 'Plage', fmt: (h) => (h.sector ? SECTOR[h.sector] ?? h.sector : spot.waterBody === 'lagoon' ? 'plan d’eau' : '—'), warn: (h) => h.sector === 'offshore' || h.sector === 'side-off' },
        { key: 'score', label: 'Note', num: true, fmt: (h) => n1(h.scores[level]) },
        { key: 'limit', label: 'Commentaire', fmt: (h) => h.limit[level] ?? '—' },
      ],
      lines: [
        { label: 'Vent', values: hours.map((h: any) => h.kn), color: '#256D70', unit: 'nd' },
        { label: 'Rafales', values: hours.map((h: any) => h.gust), color: '#256D70', unit: 'nd', dash: [4, 4] },
      ],
      source: d.meta.disciplines.wing.source,
      extra: [
        { label: 'Orientation', value: spot.orientation?.seaward != null ? `plage ouverte vers ${n0(spot.orientation.seaward)}° (${compass(spot.orientation.seaward)})` : 'plan d’eau fermé' },
        { label: 'Confiance orientation', value: ({ low: 'faible, à confirmer', medium: 'moyenne', high: 'élevée' } as Record<string, string>)[spot.orientation?.confidence] ?? '—' },
        { label: 'Formule', value: `note wing v${d.wing.version} : vent × rafales × direction (docs/product/WING_SCORE.md)` },
      ],
    };
  }
  if (disc === 'surf') {
    const s = d.surf.spots?.find((x: any) => x.id === spot.id);
    if (!s) return null;
    const h = s.h;
    const rows = h.t.map((t: number, i: number) => ({ t, i, score: h.score[i], hb: h.hb[i], lo: h.lo[i], hi: h.hi[i], hs: h.hs[i], tp: h.tp[i], dir: h.dir[i], ws: kmhToKn(h.ws[i]), wd: h.wd[i], wk: h.wk?.[i] ?? null, wg: kmhToKn(h.wg[i]), conf: h.conf[i], day: h.day[i], n: h.n[i], sst: h.sst[i] }));
    return {
      discipline: 'surf', times: h.t, score: h.score, day: h.day, rows, levels: false,
      cols: [
        { key: 'hb', label: 'Vagues m', num: true, fmt: (r) => n1(r.hb) },
        { key: 'range', label: 'Fourchette', fmt: (r) => `${n1(r.lo)}–${n1(r.hi)}` },
        { key: 'tp', label: 'Période s', num: true, fmt: (r) => n0(r.tp) },
        { key: 'dir', label: 'Houle de', fmt: (r) => compass(r.dir) },
        { key: 'ws', label: 'Vent nd', num: true, fmt: (r) => `${n0(r.ws)} ${compass(r.wd)}` },
        { key: 'score', label: 'Note', num: true, fmt: (r) => n1(r.score) },
        { key: 'conf', label: 'Confiance', num: true, fmt: (r) => (r.conf === null ? '—' : `${Math.round(r.conf * 100)} %`) },
      ],
      lines: [
        { label: 'Vagues', values: h.hb, color: '#256D70', unit: 'm' },
        { label: 'Période', values: h.tp, color: '#8A5A00', unit: 's', dash: [4, 4] },
      ],
      source: d.meta.disciplines.surf.source,
      extra: [
        { label: 'Bouée de référence', value: s.refBuoy ?? '—' },
        { label: 'Mesure récente', value: s.nowObs ? `${n1(s.nowObs.hs)} m à la bouée ${s.nowObs.code} (modèles × ${n1(s.nowRatio)})` : 'aucune mesure récente' },
        { label: 'Taille idéale', value: `${n1(s.size?.min)} – ${n1(s.size?.max)} m, idéal ${n1(s.size?.ideal)} m` },
        { label: 'Niveau', value: s.level ?? '—' },
        { label: 'Orientation', value: `plage ouverte vers ${n0(s.normal)}° (${compass(s.normal)}) ; houle utile du ${compass(s.swell?.min)} au ${compass(s.swell?.max)}` },
      ],
    };
  }
  const r = d.downwind.runs?.find((x: any) => x.id === spot.id);
  if (!r) return null;
  const f = Object.fromEntries((d.downwind.hourFields as string[]).map((k, i) => [k, i]));
  const rows = r.hours.map((x: any[]) => ({ t: x[f.t], kn: x[f.kn], gust: x[f.gust], from: x[f.windFrom], shore: x[f.shore], dir: x[f.dir], bumpH: x[f.bumpH], bumpT: x[f.bumpT], hs: x[f.hs], cross: x[f.cross], score: x[f[level]], day: !!x[f.day], rt: !!x[f.roundTrip] }));
  return {
    discipline: 'downwind', times: rows.map((x: any) => x.t), score: rows.map((x: any) => x.score), day: rows.map((x: any) => x.day), rows, levels: true,
    cols: [
      { key: 'kn', label: 'Vent nd', num: true, fmt: (x) => `${n0(x.kn)} (${n0(x.gust)})` },
      { key: 'from', label: 'De', fmt: (x) => compass(x.from) },
      { key: 'shore', label: 'Côte', fmt: (x) => SHORE[x.shore] ?? x.shore, warn: (x) => x.shore === 'off' || x.shore === 'sideoff' },
      { key: 'sens', label: 'Sens', fmt: (x) => (x.dir === 'ab' ? `→ ${r.b}` : `→ ${r.a}`) },
      { key: 'bump', label: 'Houle', fmt: (x) => (x.bumpH === null ? '—' : `${n1(x.bumpH)} m · ${n0(x.bumpT)} s`) },
      { key: 'score', label: 'Note', num: true, fmt: (x) => n1(x.score) },
      { key: 'rt', label: 'A/R', fmt: (x) => (x.rt ? 'oui' : '') },
    ],
    lines: [
      { label: 'Vent', values: rows.map((x: any) => x.kn), color: '#256D70', unit: 'nd' },
      { label: 'Houle', values: rows.map((x: any) => x.bumpH), color: '#8A5A00', unit: 'm' },
    ],
    source: d.meta.disciplines.downwind.source,
    extra: [
      { label: 'Parcours', value: `${r.a} ↔ ${r.b}, ${r.km} km${r.oneWay ? ', aller simple' : ''}` },
      { label: 'Accès', value: (r.access ?? []).join(' · ') || '—' },
      { label: 'Bouée', value: r.nowObs ? `${r.buoy} : ${n1(r.nowObs.hs)} m mesurés (modèles × ${n1(r.nowObs.ratio)})` : r.buoy ?? '—' },
      { label: 'Correction du vent', value: (d.downwind.correction ?? []).map((c: any) => `${c.spot} × ${n1(c.ratioMoy)}`).join(', ') || 'aucune' },
      { label: 'À savoir', value: r.notes ?? '—' },
    ],
  };
}
