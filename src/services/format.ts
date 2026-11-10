// Formats français, heure de Paris.
export const TZ = 'Europe/Paris';
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, ...o });
const fDay = fmt({ weekday: 'long', day: 'numeric', month: 'long' }), fDayShort = fmt({ weekday: 'short', day: 'numeric' }), fHour = fmt({ hour: '2-digit', minute: '2-digit' }), fKey = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }), fH = fmt({ hour: 'numeric' });
export const dayKey = (t: number) => fKey.format(t);
export const hourOf = (t: number) => Number(fH.format(t).replace(/\D/g, ''));
export const hh = (t: number) => fHour.format(t).replace(':00', ' h').replace(':', ' h ');
export function dayLabel(t: number, now = Date.now()): string {
  const d = dayKey(t), today = dayKey(now), tomorrow = dayKey(now + 86400e3);
  if (d === today) return "Aujourd'hui";
  if (d === tomorrow) return 'Demain';
  const s = fDay.format(t); return s.charAt(0).toUpperCase() + s.slice(1);
}
export const dayShort = (t: number) => fDayShort.format(t);
export const span = (a: number, b: number, now = Date.now()) => `${dayLabel(a, now)} · ${hh(a)} – ${hh(b)}`;
export const n1 = (x: number | null | undefined) => (x === null || x === undefined || Number.isNaN(x) ? '—' : x.toFixed(1).replace('.', ','));
export const n0 = (x: number | null | undefined) => (x === null || x === undefined || Number.isNaN(x) ? '—' : String(Math.round(x)));
const DIR16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
export const compass = (d: number | null | undefined) => (d === null || d === undefined ? '—' : DIR16[Math.round((((d % 360) + 360) % 360) / 22.5) % 16]);
export const kmhToKn = (x: number | null | undefined) => (x === null || x === undefined ? null : x / 1.852);
export const msToKn = (x: number | null | undefined) => (x === null || x === undefined ? null : x * 1.94384);
export function ago(t: number, now = Date.now()): string {
  const m = Math.round((now - t) / 60000);
  if (m < 1) return "à l'instant"; if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60); return h < 48 ? `il y a ${h} h` : `il y a ${Math.round(h / 24)} j`;
}
export type Tone = 'top' | 'ok' | 'no';
export const toneOf = (s: number | null | undefined): Tone => (s === null || s === undefined ? 'no' : s >= 7 ? 'top' : s >= 5 ? 'ok' : 'no');
export const labelOf = (s: number | null | undefined) => (s === null || s === undefined ? '—' : s >= 7 ? 'Ça envoie' : s >= 5 ? 'Ça se tente' : 'Non');
export function scoreColor(s: number | null | undefined): string {
  if (s === null || s === undefined) return 'var(--c-score-0)';
  return s >= 8.5 ? 'var(--c-score-9)' : s >= 7 ? 'var(--c-score-7)' : s >= 5 ? 'var(--c-score-5)' : 'var(--c-score-0)';
}
