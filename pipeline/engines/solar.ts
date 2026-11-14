// Élévation du soleil (degrés) : copie exacte de solarElevation du moteur surf en service
// (legacy/super-previ-surf/engine/surf-engine.js), sans dépendance Node, pour faire tourner la note wing/kite
// aussi dans le navigateur (super prévision privée, D-66). Test : tests/solar.test.ts (identique au legacy).
const norm360 = (a: number) => { a = a % 360; return a < 0 ? a + 360 : a; };
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
export function solarElevation(t: number, lat: number, lon: number): number {
  const jd = t / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = norm360(280.46 + 0.9856474 * n);
  const g = rad(norm360(357.528 + 0.9856003 * n));
  const lambda = rad(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const eps = rad(23.439 - 0.0000004 * n);
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda));
  const gmst = norm360(280.46061837 + 360.98564736629 * n);
  const ha = rad(norm360(gmst + lon - deg(ra)));
  const el = Math.asin(Math.sin(rad(lat)) * Math.sin(dec) + Math.cos(rad(lat)) * Math.cos(dec) * Math.cos(ha));
  return deg(el);
}
