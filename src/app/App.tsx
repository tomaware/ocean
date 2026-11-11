import { useEffect, useState } from 'preact/hooks';
import { LayoutGrid, Menu, MessageSquare, Moon, ShieldCheck, Sun, User, X } from 'lucide-preact';
import { spotDiscipline, useData } from '../services/data';
import { MODULES, moduleOf, Profile, Reliability, SpotPage } from '../features/pages';
import { Module, subsFor, type Sub } from '../features/modules';
import { FeedbackPage, WidgetsPage } from '../features/extras';
import { setPrefs, usePrefs } from '../services/prefs';
import { installNav, lastSub } from '../services/nav';

const TITLES: Record<string, string> = { fiabilite: 'Fiabilité', avis: 'Avis', widgets: 'Widgets', profil: 'Profil' };

type Route = { name: string; id?: string; query: URLSearchParams };
function parse(): Route {
  const [path, q] = (location.hash.replace(/^#/, '') || '/').split('?');
  const parts = path.split('/').filter(Boolean);
  const name = parts[0] ?? 'wind';
  // anciennes adresses (accueil, spots, prévisions, sessions) → WIND
  return { name: ['accueil', 'spots', 'previsions', 'sessions'].includes(name) ? 'wind' : name, id: parts[1], query: new URLSearchParams(q ?? '') };
}

/** Thème réellement affiché (auto = celui du téléphone / de l'ordinateur). */
const isDark = (t: 'auto' | 'light' | 'dark') => t === 'dark' || (t === 'auto' && typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches);

export function App() {
  const prefs = usePrefs();
  const dark = isDark(prefs.theme);
  const [route, setRoute] = useState(parse());
  const [now, setNow] = useState(Date.now());
  const { data, error } = useData();
  // menu du téléphone (Profil, Widgets, Avis) : se ferme au changement d'écran, au toucher ailleurs ou avec Échap
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [location.hash]);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('click', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
  }, [menu]);
  useEffect(() => {
    const off = installNav(() => setRoute(parse()));
    const iv = setInterval(() => setNow(Date.now()), 60e3);
    return () => { off(); clearInterval(iv); };
  }, []);
  const spot = route.name === 'spot' && data ? data.spots.find((s) => s.id === route.id) : null;
  const tab = spot ? moduleOf(spotDiscipline(spot)).slug : route.name;
  const mod = MODULES.find((m) => m.slug === tab);
  useEffect(() => { document.title = `${spot ? spot.name : mod ? mod.tab : TITLES[route.name] ?? 'Profil'} · OCEAN`; }, [tab, spot?.id]);

  let page;
  if (error) page = <div class="notice warn">Données indisponibles ({error}). Réessaie dans quelques minutes.</div>;
  else if (!data) page = <><div class="skeleton" /><div class="skeleton" /></>;
  else if (route.name === 'spot' && route.id) page = <SpotPage d={data} id={route.id} now={now} day={route.query.get('day')} />;
  else if (route.name === 'profil') page = <Profile d={data} />;
  else if (route.name === 'fiabilite') page = <Reliability d={data} now={now} />;
  else if (route.name === 'avis') page = <FeedbackPage d={data} now={now} />;
  else if (route.name === 'widgets') page = <WidgetsPage />;
  else {
    const m = mod ?? MODULES[0];
    const sub: Sub = (subsFor(m.disc).find((x) => x.id === (route.id ?? lastSub(m.slug)))?.id ?? 'meilleure') as Sub;
    page = <Module key={m.disc} d={data} now={now} disc={m.disc} sub={sub} query={route.query} />;
  }
  return (
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="#/wind" aria-label="OCEAN, accueil"><img src="./icon.svg" width="26" height="26" alt="" /><span>OCEAN</span></a>
        <nav class="tabs" aria-label="Disciplines">
          {MODULES.map((m) => {
            return <a key={m.slug} href={`#/${m.slug}/${lastSub(m.slug) ?? 'meilleure'}`} aria-current={tab === m.slug ? 'page' : undefined}>{m.tab}</a>;
          })}
        </nav>
        <div class="row" style={{ gap: '6px' }}>
        <button type="button" class="me theme" aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'} title={dark ? 'Mode clair' : 'Mode sombre'}
          onClick={() => setPrefs((p) => ({ ...p, theme: dark ? 'light' : 'dark' }))}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
        <div class="menuwrap">
          <button type="button" class={`me menubtn${menu ? ' open' : ''}`} aria-expanded={menu} aria-controls="menu" aria-label="Menu : profil, widgets, avis"
            onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}>{menu ? <X size={20} /> : <Menu size={20} />}</button>
          {menu && (
            <nav id="menu" class="menu" aria-label="Menu" onClick={(e) => { e.stopPropagation(); if ((e.target as Element).closest('a')) setMenu(false); }}>
              <a href="#/profil" aria-current={route.name === 'profil' ? 'page' : undefined}><User size={18} /> Profil et réglages</a>
              <a href="#/widgets" aria-current={route.name === 'widgets' ? 'page' : undefined}><LayoutGrid size={18} /> Installer les widgets</a>
              <a href="#/avis" aria-current={route.name === 'avis' ? 'page' : undefined}><MessageSquare size={18} /> Donner un avis</a>
              {prefs.perso.enabled && <a href="#/fiabilite" aria-current={route.name === 'fiabilite' ? 'page' : undefined}><ShieldCheck size={18} /> Fiabilité</a>}
            </nav>
          )}
        </div>
        <a class="me userlink" href="#/profil" aria-label="Profil et réglages" aria-current={['profil', 'fiabilite', 'avis', 'widgets'].includes(tab) ? 'page' : undefined}><User size={20} /></a>
        </div>
      </header>
      <div class="body">
        <aside class="side" aria-label="Modules">
          {mod && subsFor(mod.disc).map((x) => {
            const cur = route.name === mod.slug && (route.id ?? lastSub(mod.slug) ?? 'meilleure') === x.id;
            return <a key={x.id} href={`#/${mod.slug}/${x.id}`} aria-current={cur ? 'page' : undefined}>{x.label}</a>;
          })}
          {mod && <hr />}
          <a href="#/profil" aria-current={route.name === 'profil' ? 'page' : undefined}><User size={16} /> Profil</a>
          {prefs.perso.enabled && <a href="#/fiabilite" aria-current={route.name === 'fiabilite' ? 'page' : undefined}><ShieldCheck size={16} /> Fiabilité</a>}
          <a href="#/widgets" aria-current={route.name === 'widgets' ? 'page' : undefined}><LayoutGrid size={16} /> Widgets</a>
          <a href="#/avis" aria-current={route.name === 'avis' ? 'page' : undefined}><MessageSquare size={16} /> Avis</a>
        </aside>
        <main class="main" id="contenu">{page}
          <nav class="foot" aria-label="Plus">
            <a href="#/widgets"><LayoutGrid size={15} /> Widgets</a>
            <a href="#/avis"><MessageSquare size={15} /> Avis</a>
            <a href="#/profil"><User size={15} /> Profil</a>
          </nav>
        </main>
      </div>
    </div>
  );
}
