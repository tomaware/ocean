import { useEffect, useState } from 'preact/hooks';
import { Route as RouteIcon, ShieldCheck, User, Waves, Wind } from 'lucide-preact';
import { spotDiscipline, useData } from '../services/data';
import { MODULES, moduleOf, Profile, Reliability, SpotPage } from '../features/pages';
import { Module, SUBS, type Sub } from '../features/modules';
import { installNav, lastSub } from '../services/nav';

type Route = { name: string; id?: string; query: URLSearchParams };
function parse(): Route {
  const [path, q] = (location.hash.replace(/^#/, '') || '/').split('?');
  const parts = path.split('/').filter(Boolean);
  const name = parts[0] ?? 'wind';
  // anciennes adresses (accueil, spots, prévisions, sessions) → WIND
  return { name: ['accueil', 'spots', 'previsions', 'sessions'].includes(name) ? 'wind' : name, id: parts[1], query: new URLSearchParams(q ?? '') };
}
const ICONS = { wind: Wind, vague: Waves, houle: RouteIcon } as const;

export function App() {
  const [route, setRoute] = useState(parse());
  const [now, setNow] = useState(Date.now());
  const { data, error } = useData();
  useEffect(() => {
    const off = installNav(() => setRoute(parse()));
    const iv = setInterval(() => setNow(Date.now()), 60e3);
    return () => { off(); clearInterval(iv); };
  }, []);
  const spot = route.name === 'spot' && data ? data.spots.find((s) => s.id === route.id) : null;
  const tab = spot ? moduleOf(spotDiscipline(spot)).slug : route.name;
  const mod = MODULES.find((m) => m.slug === tab);
  useEffect(() => { document.title = `${spot ? spot.name : mod ? mod.tab : route.name === 'fiabilite' ? 'Fiabilité' : 'Profil'} · OCEAN`; }, [tab, spot?.id]);

  let page;
  if (error) page = <div class="notice warn">Données indisponibles ({error}). Réessaie dans quelques minutes.</div>;
  else if (!data) page = <><div class="skeleton" /><div class="skeleton" /></>;
  else if (route.name === 'spot' && route.id) page = <SpotPage d={data} id={route.id} now={now} />;
  else if (route.name === 'profil') page = <Profile d={data} />;
  else if (route.name === 'fiabilite') page = <Reliability d={data} now={now} />;
  else {
    const m = mod ?? MODULES[0];
    const sub: Sub = (SUBS.find((x) => x.id === (route.id ?? lastSub(m.slug)))?.id ?? 'meilleure') as Sub;
    page = <Module key={m.disc} d={data} now={now} disc={m.disc} sub={sub} query={route.query} />;
  }
  return (
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="#/wind" aria-label="OCEAN, accueil"><img src="./icon.svg" width="26" height="26" alt="" /><span>OCEAN</span></a>
        <nav class="tabs" aria-label="Modules">
          {MODULES.map((m) => {
            const I = ICONS[m.slug as keyof typeof ICONS];
            return <a key={m.slug} href={`#/${m.slug}/${lastSub(m.slug) ?? 'meilleure'}`} aria-current={tab === m.slug ? 'page' : undefined}><I size={18} aria-hidden="true" /><span>{m.tab}</span></a>;
          })}
        </nav>
        <a class="me" href="#/profil" aria-label="Profil et réglages" aria-current={tab === 'profil' || tab === 'fiabilite' ? 'page' : undefined}><User size={20} /></a>
      </header>
      <div class="body">
        <aside class="side" aria-label="Modules">
          {mod && SUBS.map((x) => {
            const cur = route.name === mod.slug && (route.id ?? lastSub(mod.slug) ?? 'meilleure') === x.id;
            return <a key={x.id} href={`#/${mod.slug}/${x.id}`} aria-current={cur ? 'page' : undefined}>{x.label}</a>;
          })}
          {mod && <hr />}
          <a href="#/profil" aria-current={route.name === 'profil' ? 'page' : undefined}><User size={16} /> Profil</a>
          <a href="#/fiabilite" aria-current={route.name === 'fiabilite' ? 'page' : undefined}><ShieldCheck size={16} /> Fiabilité</a>
        </aside>
        <main class="main" id="contenu">{page}</main>
      </div>
    </div>
  );
}
