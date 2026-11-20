// Diagnostic : vent et houle (modèles, heures passées d'aujourd'hui) au large du tracé Plage Sud → La Grande-Motte.
// Sert à caler la référence « 3 étoiles » donnée par Tom (20/11, 15 h). Données Open-Meteo, non publiées.
const P = { lat: 43.52, lon: 4.125 };
const get = async (u: string) => { for (let k = 0; k < 6; k++) { try { const r = await fetch(u, { signal: AbortSignal.timeout(60000) }); if (r.ok) return r.json(); console.log('HTTP ' + r.status); } catch (e) { console.log('essai ' + (k + 1) + ' : ' + ((e as any).cause?.code ?? e)); } await new Promise((ok) => setTimeout(ok, 20000)); } throw new Error('Open-Meteo injoignable'); };
const day = process.env.DAY ?? new Date().toISOString().slice(0, 10);
const w = await get(`https://api.open-meteo.com/v1/forecast?latitude=${P.lat}&longitude=${P.lon}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kn&timezone=Europe%2FParis&start_date=${day}&end_date=${day}&models=meteofrance_arome_france_hd,icon_d2,ecmwf_ifs025`);
const m = await get(`https://marine-api.open-meteo.com/v1/marine?latitude=${P.lat}&longitude=${P.lon}&hourly=wave_height,wave_period,wave_direction,wind_wave_height,swell_wave_height,swell_wave_period&timezone=Europe%2FParis&start_date=${day}&end_date=${day}`);
const H = w.hourly, M = m.hourly;
console.log(`point ${P.lat}, ${P.lon} — ${day} (heure de Paris)`);
console.log('heure | AROME HD nd (raf) dir | ICON-D2 nd dir | ECMWF nd dir | vagues Hs m · T s · dir | mer du vent Hs | houle Hs · T');
for (let i = 0; i < H.time.length; i++) {
  const hh = Number(H.time[i].slice(11, 13)); if (hh < 9 || hh > 18) continue;
  const f = (k: string) => H[k]?.[i]; const r = (x: any) => (x == null ? '—' : Math.round(x));
  console.log(`${H.time[i].slice(11)} | ${r(f('wind_speed_10m_meteofrance_arome_france_hd'))} (${r(f('wind_gusts_10m_meteofrance_arome_france_hd'))}) ${r(f('wind_direction_10m_meteofrance_arome_france_hd'))}° | ${r(f('wind_speed_10m_icon_d2'))} ${r(f('wind_direction_10m_icon_d2'))}° | ${r(f('wind_speed_10m_ecmwf_ifs025'))} ${r(f('wind_direction_10m_ecmwf_ifs025'))}° | ${M.wave_height[i]} · ${M.wave_period[i]} · ${M.wave_direction[i]}° | ${M.wind_wave_height[i]} | ${M.swell_wave_height[i]} · ${M.swell_wave_period[i]}`);
}
