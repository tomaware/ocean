import { useEffect, useState } from 'preact/hooks';
import { CalendarClock, ChartLine, House, MapPin, User } from 'lucide-preact';
import { useData } from '../services/data';
import { Forecasts, Home, Profile, Reliability, Sessions, SpotPage, Spots } from '../features/pages';

type Route = { name: string; id?: string; query: URLSearchParams };
function parse(): Route {
  const [path, q] = (location.hash.replace(/^#/, '') || '/').split('?');
  const parts = path.split('/').filter(Boolean);
  return { name: parts[0] ?? 'accueil', id: parts[1], query: new URLSearchParams(q ?? '') };
}
const TITLES: Record<string, string> = { accueil: 'Accueil', spots: 'Spots', previsions: 'Prévisions', spot: 'Prévisions', sessions: 'Sessions', profil: 'Profil', fiabilite: 'Fiabilité' };

export function App() {
  const [route, setRoute] = useState(parse());
  const [now, setNow] = useState(Date.now());
  const { data, error } = useData();
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    const iv = setInterval(() => setNow(Date.now()), 60e3);
    return () => { removeEventListener('hashchange', on); clearInterval(iv); };
  }, []);
  useEffect(() => { document.title = `${TITLES[route.name] ?? 'OCEAN'} · OCEAN`; }, [route.name]);
  const tab = route.name === 'spot' ? 'previsions' : route.name === 'fiabilite' ? 'profil' : route.name;
  const items: [string, string, any][] = [['accueil', 'Accueil', House], ['spots', 'Spots', MapPin], ['previsions', 'Prévisions', ChartLine], ['sessions', 'Sessions', CalendarClock], ['profil', 'Profil', User]];
  let page;
  if (error) page = <div class="notice warn">Données indisponibles ({error}). Réessaie dans quelques minutes.</div>;
  else if (!data) page = <><div class="skeleton" /><div class="skeleton" /></>;
  else if (route.name === 'spots') page = <Spots d={data} now={now} />;
  else if (route.name === 'spot' && route.id) page = <SpotPage d={data} id={route.id} now={now} />;
  else if (route.name === 'previsions') page = <Forecasts d={data} now={now} />;
  else if (route.name === 'sessions') page = <Sessions d={data} now={now} query={route.query} />;
  else if (route.name === 'profil') page = <Profile d={data} />;
  else if (route.name === 'fiabilite') page = <Reliability d={data} now={now} />;
  else page = <Home d={data} now={now} />;
  return (
    <div class="shell">
      <nav class="nav" aria-label="Navigation principale">
        <span class="brand"><img src="./icon.svg" width="28" height="28" alt="" /> OCEAN</span>
        {items.map(([k, l, I]) => <a key={k} href={`#/${k === 'accueil' ? '' : k}`} aria-current={tab === k ? 'page' : undefined}><I size={20} aria-hidden="true" /><span>{l}</span></a>)}
      </nav>
      <main class="main" id="contenu">{page}</main>
    </div>
  );
}
