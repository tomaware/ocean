// Navigation : retour arrière qui ramène à l'écran précédent (et à sa position), dernier module ouvert par onglet.
const scrolls = new Map<string, number>();
let depth = 0;            // nombre d'écrans ouverts dans l'app depuis l'arrivée (pour savoir si « Retour » peut reculer)
let byLink = false;       // le changement d'adresse vient d'un clic sur un lien (sinon : bouton retour / avant)
let current = location.hash;

export function installNav(onChange: () => void): () => void {
  const click = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest?.('a');
    if (a && a.getAttribute('href')?.startsWith('#')) byLink = true;
  };
  const change = () => {
    scrolls.set(current, window.scrollY);
    const next = location.hash;
    if (byLink) { depth++; onChange(); requestAnimationFrame(() => window.scrollTo(0, 0)); }
    else { depth = Math.max(0, depth - 1); onChange(); const y = scrolls.get(next) ?? 0; requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y))); }
    byLink = false;
    current = next;
    rememberSub(next);
  };
  document.addEventListener('click', click, true);
  addEventListener('hashchange', change);
  rememberSub(location.hash);
  return () => { document.removeEventListener('click', click, true); removeEventListener('hashchange', change); };
}

/** « Retour » : écran précédent s'il y en a un dans l'app, sinon l'adresse de repli. */
export function goBack(fallback: string): void {
  if (depth > 0) history.back();
  else location.hash = fallback;
}

const KEY = 'ocean.lastSub.';
function rememberSub(hash: string): void {
  const m = hash.match(/^#\/(wind|vague|houle)\/(meilleure|sessions|prevision|spots)/);
  if (m) try { sessionStorage.setItem(KEY + m[1], m[2]); } catch { /* sans stockage : pas de mémoire */ }
}
export function lastSub(slug: string): string | null {
  try { return sessionStorage.getItem(KEY + slug); } catch { return null; }
}
