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
