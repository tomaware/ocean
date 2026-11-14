// Mode perso : super prévision vent (privée, D-66), voir superprev-core.ts.
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { AllData } from './data.ts';
import { usePrefs } from './prefs.ts';
import { applySuper, fetchSuper, type SuperRaw } from './superprev-core.ts';

/** Mode perso + « Super prévision » cochée : données remplacées dès que le script répond ; sinon, la Prévision vent publique. */
export function useSuper(raw: AllData | null): { data: AllData | null; state: 'off' | 'loading' | 'on' | 'error'; error: string | null } {
  const prefs = usePrefs();
  const on = prefs.perso.enabled && !!prefs.perso.url && prefs.perso.superPrev !== false;
  const [sp, setSp] = useState<{ raw: SuperRaw | null; error: string | null }>({ raw: null, error: null });
  const ids = raw ? raw.spots.filter((s) => s.disciplines.includes('wing')).map((s) => s.id) : [];
  useEffect(() => {
    if (!on || !ids.length) { setSp({ raw: null, error: null }); return; }
    let stop = false;
    const go = () => fetchSuper(prefs.perso.url, ids).then((r) => !stop && setSp({ raw: r, error: null }), (e) => !stop && setSp((p) => ({ raw: p.raw, error: String(e.message ?? e) })));
    go();
    const iv = setInterval(go, 30 * 60e3);
    return () => { stop = true; clearInterval(iv); };
  }, [on, prefs.perso.url, ids.join(',')]);
  const data = useMemo(() => (raw && on && sp.raw ? applySuper(raw, sp.raw) : raw), [raw, on, sp.raw]);
  return { data, state: !on ? 'off' : sp.raw ? 'on' : sp.error ? 'error' : 'loading', error: sp.error };
}
