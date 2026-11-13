// Prévision wing fictive commune aux tests des widgets (iPhone et Windows).

export const NOW = Date.UTC(2026, 10, 11, 9, 20);            // mercredi 11 novembre, 10 h 20 à Paris

/** Prévision wing fictive : 3 spots, heures de 7 h à 17 h (Paris) sur 5 jours. */
export function wingFixture() {
  const mk = (id: string, name: string, base: number, dir: number, sess: { secu: any[]; offshore: any[] }, source = 'corrected') => {
    const hours: any[] = [];
    for (let d = 0; d < 5; d++) for (let h = 6; h <= 17; h++) {
      const t = Date.UTC(2026, 10, 11 + d, h - 1);        // h heure de Paris (UTC+1)
      const kn = base + d * 3 + (h >= 12 && h <= 15 ? 4 : 0);
      const sc = Math.min(10, Math.max(0, (kn - 10) / 1.6));
      hours.push({ t, kn, gust: kn + 6, dir, day: h >= 7, scores: { secu: h >= 7 ? Math.round(sc * 10) / 10 : 0, offshore: h >= 7 ? Math.round(Math.min(10, sc + 1) * 10) / 10 : 0 } });
    }
    return { id, name, source: { kind: source }, hours, sessions: sess };
  };
  const win = (d: number, a: number, b: number, peak: number) => ({ start: Date.UTC(2026, 10, 11 + d, a - 1), end: Date.UTC(2026, 10, 11 + d, b - 1), hours: b - a, peak });
  return {
    version: '2.0.0',
    spots: [
      mk('la-grande-motte', 'La Grande-Motte', 12, 315, { secu: [win(0, 13, 16, 7.5), win(2, 9, 17, 9)], offshore: [win(0, 11, 17, 8)] }),
      mk('beauduc', 'Beauduc', 16, 135, { secu: [win(2, 9, 17, 9.4)], offshore: [win(2, 8, 17, 9.6)] }),
      mk('le-jai', 'Le Jaï', 8, 300, { secu: [], offshore: [] }),
    ],
  };
}

/** Moteur surf fictif : Carnon (petit, vent de terre le vendredi) et Sète (plus gros), 7 h – 18 h sur 5 jours. */
export function surfFixture() {
  const mk = (id: string, name: string, base: number) => {
    const h: Record<string, any[]> = { t: [], score: [], hb: [], lo: [], hi: [], hs: [], tp: [], dir: [], ws: [], wd: [], wk: [], day: [], conf: [] };
    for (let d = 0; d < 5; d++) for (let hr = 6; hr <= 21; hr++) {
      const fri = d === 2, hb = base + (fri ? 0.6 : 0);
      h.t.push(Date.UTC(2026, 10, 11 + d, hr - 1)); h.hb.push(hb); h.lo.push(hb - 0.2); h.hi.push(hb + 0.3); h.hs.push(hb + 0.3); h.tp.push(fri ? 9 : 6);
      h.dir.push(200); h.ws.push(fri ? 22.2 : 18.5); h.wd.push(fri ? 0 : 160); h.wk.push(fri ? 'offshore' : 'onshore');
      h.day.push(hr >= 7 && hr <= 18); h.score.push(fri && hr >= 8 && hr <= 15 ? (hr <= 10 ? 9.2 : 7.4) : 3); h.conf.push(0.8);
    }
    return { id, name, h };
  };
  return { spots: [mk('carnon', 'Carnon', 0.6), mk('sete', 'Sète', 1.0)] };
}

/** Même moteur wing fictif, avec un jeudi 12 « Kite session » à Beauduc : 31 nd rafales 36 toute la journée (D-49).
 *  Notes et drapeau « kite » posés comme le ferait le moteur v2.1 (au-delà de 30 nd : note 0). */
export function kiteFixture() {
  const w = wingFixture();
  const b = w.spots.find((s) => s.id === 'beauduc')!;
  for (const h of b.hours as any[]) {
    if (new Date(h.t).getUTCDate() === 12) { h.kn = 31; h.gust = 36; h.scores = { secu: 0, offshore: 0 }; }
    h.kite = h.day && (h.kn > 28);
  }
  return w;
}
