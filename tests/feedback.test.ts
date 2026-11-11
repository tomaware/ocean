// Onglet « Avis » : contrôle du formulaire, envoi au script Google, et le script lui-même (retours/ocean-retours.gs)
// exécuté avec une imitation des services Google (MailApp, Session, CacheService…).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { feedbackProblem, sendFeedback, type Feedback } from '../src/services/feedback.ts';

const F: Feedback = { type: 'prevision', message: '  Beauduc samedi : 25 nd prévus, 12 sur place  ', name: ' Léa ', email: 'lea@example.org', site: '',
  context: { page: '#/spot/beauduc', device: 'iOS · Safari · 390×844 · système clair', data: '2026-11-11T09:00:00.000Z' } };

test('avis : message obligatoire, longueur maximale, e-mail facultatif mais valide', () => {
  assert.equal(feedbackProblem({ message: ' ', email: '' }), 'Écris ton message.');
  assert.match(feedbackProblem({ message: 'x'.repeat(5001), email: '' })!, /trop long/);
  assert.match(feedbackProblem({ message: 'Super appli', email: 'pas-un-mail' })!, /invalide/);
  assert.equal(feedbackProblem({ message: 'Super appli', email: '' }), null);
  assert.equal(feedbackProblem({ message: 'Super appli', email: 'a@b.fr' }), null);
});

test('avis : envoi en text/plain (sans pré-requête), réponse du script lue', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const ok = (async (url: string, init: RequestInit) => { calls.push({ url, init }); return new Response('{"ok":true}', { status: 200 }); }) as typeof fetch;
  await sendFeedback(F, 'https://script.google.com/macros/s/X/exec', ok);
  assert.equal((calls[0].init.headers as Record<string, string>)['Content-Type'], 'text/plain;charset=utf-8');
  const body = JSON.parse(String(calls[0].init.body));
  assert.equal(body.message, 'Beauduc samedi : 25 nd prévus, 12 sur place'); assert.equal(body.name, 'Léa');
  const refused = (async () => new Response('{"ok":false,"error":"Trop de messages aujourd’hui, réessaie demain."}')) as typeof fetch;
  await assert.rejects(sendFeedback(F, 'https://x/exec', refused), /Trop de messages/);
  await assert.rejects(sendFeedback(F, '', ok), /pas encore branchée/);
});

/** Exécute le script Google avec des services imités ; renvoie les e-mails envoyés. */
function gas() {
  const sent: { to: string; subject: string; body: string; opt: any }[] = [];
  const store = new Map<string, string>();
  const env = {
    ContentService: { createTextOutput: (t: string) => ({ text: t, setMimeType() { return this; } }), MimeType: { JSON: 'json' } },
    MailApp: { sendEmail: (to: string, subject: string, body: string, opt: any) => { sent.push({ to, subject, body, opt }); } },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'proprietaire@exemple.test' }) },
    Utilities: { formatDate: (d: Date, _tz: string, f: string) => (f === 'yyyyMMdd' ? '20261111' : '11/11/2026 10:20') },
    CacheService: { getScriptCache: () => ({ get: (k: string) => store.get(k) ?? null, put: (k: string, v: string) => { store.set(k, v); } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  };
  const src = readFileSync('retours/ocean-retours.gs', 'utf8');
  const fn = new Function(...Object.keys(env), `${src}\nreturn { doPost, doGet };`);
  const api = fn(...Object.values(env)) as { doPost: (e: any) => { text: string }; doGet: () => { text: string } };
  const post = (m: object) => JSON.parse(api.doPost({ postData: { contents: JSON.stringify(m) } }).text);
  return { sent, post, api };
}

test('script Google : e-mail au propriétaire du script, réponse à l’auteur, contexte joint', () => {
  const { sent, post, api } = gas();
  assert.equal(api.doGet().text, 'OCEAN retours : OK');
  assert.deepEqual(post({ ...F, message: F.message.trim(), name: 'Léa' }), { ok: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'proprietaire@exemple.test');                     // l'adresse vient du compte Google, pas du site
  assert.equal(sent[0].subject, '[OCEAN] Prévision ratée — Beauduc samedi : 25 nd prévus, 12 sur place');
  assert.equal(sent[0].opt.replyTo, 'lea@example.org');
  for (const x of ['Léa <lea@example.org>', '#/spot/beauduc', 'iOS · Safari', '2026-11-11T09:00']) assert.ok(sent[0].body.includes(x), x);
});

test('script Google : robots, messages vides, e-mail invalide, plafond quotidien', () => {
  const { sent, post } = gas();
  assert.deepEqual(post({ ...F, site: 'http://spam' }), { ok: true }); assert.equal(sent.length, 0);   // piège : rien d'envoyé
  assert.equal(post({ message: ' ' }).ok, false);
  post({ message: 'Sans adresse', email: 'pas un mail\nBcc: x@y.z' });
  assert.equal(sent[0].opt.replyTo, undefined); assert.ok(!sent[0].body.includes('\nBcc'));
  for (let i = 0; i < 45; i++) post({ message: `msg ${i}` });
  assert.equal(sent.length, 40);
  assert.match(post({ message: 'encore' }).error, /Trop de messages/);
});
