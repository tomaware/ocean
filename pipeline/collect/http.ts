// Téléchargement JSON avec nouvelles tentatives (429 / 5xx / réseau) et délai maximal.
export const USER_AGENT = 'OCEAN/0.1 (prévisions sports nautiques, usage personnel ; github.com/tomaware/ocean)';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export async function getJSON<T = unknown>(url: string, opts: { tries?: number; timeoutMs?: number; headers?: Record<string, string> } = {}): Promise<T> {
  const tries = opts.tries ?? 3;
  let last: unknown;
  for (let i = 1; i <= tries; i++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), opts.timeoutMs ?? 60_000);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT, ...(opts.headers ?? {}) }, signal: ctl.signal });
      if (!r.ok) {
        const body = (await r.text()).slice(0, 200);
        const err = new HttpError(r.status, `HTTP ${r.status} ${body}`);
        if (r.status !== 429 && r.status < 500) throw err;   // erreur de requête : inutile de réessayer
        last = err;
      } else {
        const j = (await r.json()) as T & { error?: boolean; reason?: string };
        if (j && typeof j === 'object' && (j as { error?: boolean }).error) throw new Error('API : ' + ((j as { reason?: string }).reason ?? 'erreur'));
        return j;
      }
    } catch (e) {
      if (e instanceof HttpError && e.status !== 429 && e.status < 500) throw e;
      last = e;
    } finally {
      clearTimeout(timer);
    }
    if (i < tries) await new Promise((res) => setTimeout(res, 3000 * i));
  }
  throw last instanceof Error ? last : new Error(String(last));
}

/** Retire les paramètres sensibles d'une URL avant de la publier dans la provenance. */
export function publicUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const k of ['key', 'apikey', 'token', 'password']) u.searchParams.delete(k);
    const s = u.toString();
    return s.length > 300 ? s.slice(0, 300) + '…' : s;
  } catch { return '(url non publiable)'; }
}
