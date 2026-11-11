// Avis et commentaires : envoyés au script Google de Tom (retours/ocean-retours.gs), qui les transfère sur sa boîte mail.
// Le site ne connaît que l'adresse /exec du script, jamais l'adresse e-mail.

/** Adresse /exec du script déployé par Tom. Déployé par Tom le 11/11/2026 (n'expose pas son adresse e-mail). */
export const FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycbxMi8WKJw6AjH352FCPARhqyz28lvTIJks75y5KXsOUzT-j77imoRfl8rYbDQYj37iEig/exec';

export type FeedbackType = 'commentaire' | 'bug' | 'idee' | 'prevision';
export const FEEDBACK_TYPES: [FeedbackType, string][] = [['commentaire', 'Avis'], ['idee', 'Idée'], ['bug', 'Bug'], ['prevision', 'Prévision ratée']];

export type Feedback = { type: FeedbackType; message: string; name: string; email: string; site: string;
  context: { page: string; device: string; data: string } };

export const MIN_LEN = 3, MAX_LEN = 5000;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** Ce qui manque avant de pouvoir envoyer (null = prêt). */
export function feedbackProblem(f: Pick<Feedback, 'message' | 'email'>): string | null {
  const n = f.message.trim().length;
  if (n < MIN_LEN) return 'Écris ton message.';
  if (n > MAX_LEN) return `Message trop long (${n} / ${MAX_LEN} caractères).`;
  if (f.email.trim() && !EMAIL.test(f.email.trim())) return 'Adresse e-mail invalide (ou laisse le champ vide).';
  return null;
}

/** Envoi en text/plain (pas de pré-requête CORS) ; le script répond {ok, error?}. */
export async function sendFeedback(f: Feedback, url = FEEDBACK_URL, doFetch: typeof fetch = fetch): Promise<void> {
  if (!url) throw new Error('La réception des avis n’est pas encore branchée.');
  const body = JSON.stringify({ ...f, message: f.message.trim(), name: f.name.trim(), email: f.email.trim() });
  const r = await doFetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body, redirect: 'follow' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!j?.ok) throw new Error(j?.error ?? 'Réponse inattendue du serveur.');
}

/** Appareil, sans identifiant : système, navigateur large, taille d'écran, thème. */
export function deviceSummary(): string {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'autre';
  const nav = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'autre';
  const dark = matchMedia?.('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair';
  return `${os} · ${nav} · ${innerWidth}×${innerHeight} · système ${dark}`;
}
