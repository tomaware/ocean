/**
 * OCEAN — réception des avis et commentaires du site (onglet « Avis »).
 *
 * Ce script envoie chaque message reçu sur la boîte Gmail du compte Google qui le déploie.
 * L'adresse n'apparaît nulle part dans le site : le site ne connaît que l'adresse /exec du script.
 *
 * Mise en place (une seule fois, à faire par Tom) :
 *  1. https://script.google.com → Nouveau projet → coller ce fichier à la place de Code.gs → Enregistrer.
 *  2. Déployer → Nouveau déploiement → type « Application Web »
 *       Exécuter en tant que : Moi        Qui peut accéder : Tout le monde
 *     → Autoriser l'accès (Google demande le droit d'envoyer des e-mails en ton nom).
 *  3. Copier l'URL qui finit par /exec et l'envoyer à Claude (ou la coller dans src/services/feedback.ts).
 *  Test : ouvrir l'URL /exec dans le navigateur → « OCEAN retours : OK ».
 *
 * Garde-fous : champ piège anti-robot, message de 3 à 5 000 caractères, 40 messages par jour au plus
 * (le quota Gmail d'un compte gratuit est de 100 e-mails par jour).
 */

const MAX_PAR_JOUR = 40;
const TYPES = { commentaire: 'Avis', bug: 'Bug', idee: 'Idée', prevision: 'Prévision ratée' };

function doGet() {
  return ContentService.createTextOutput('OCEAN retours : OK');
}

function doPost(e) {
  try {
    const m = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (m.site) return reponse_(true);                                  // champ piège rempli : robot, on ignore sans le dire
    const texte = String(m.message || '').trim();
    if (texte.length < 3 || texte.length > 5000) return reponse_(false, 'Message vide ou trop long.');
    if (!compter_()) return reponse_(false, 'Trop de messages aujourd’hui, réessaie demain.');

    const type = TYPES[m.type] || 'Avis';
    const nom = court_(m.name, 80);
    const mail = court_(m.email, 120);
    const ctx = m.context || {};
    const extrait = texte.replace(/\s+/g, ' ').slice(0, 60);
    const corps = [
      texte,
      '',
      '———',
      'Type : ' + type,
      'De : ' + (nom || 'anonyme') + (mail ? ' <' + mail + '>' : ''),
      'Page : ' + court_(ctx.page, 200),
      'Appareil : ' + court_(ctx.device, 200),
      'Données du : ' + court_(ctx.data, 40),
      'Reçu le : ' + Utilities.formatDate(new Date(), 'Europe/Paris', 'dd/MM/yyyy HH:mm'),
    ].join('\n');

    const opt = { name: 'OCEAN' };
    if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(mail)) opt.replyTo = mail;   // « Répondre » écrit directement à la personne
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[OCEAN] ' + type + ' — ' + extrait, corps, opt);
    return reponse_(true);
  } catch (err) {
    return reponse_(false, 'Erreur du serveur.');
  }
}

/** Compte les messages du jour (heure de Paris) ; faux au-delà de MAX_PAR_JOUR. */
function compter_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const cle = 'n-' + Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyyMMdd');
    const cache = CacheService.getScriptCache();
    const n = Number(cache.get(cle) || 0);
    if (n >= MAX_PAR_JOUR) return false;
    cache.put(cle, String(n + 1), 6 * 3600);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function court_(v, n) {
  return String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim().slice(0, n);
}

function reponse_(ok, erreur) {
  return ContentService.createTextOutput(JSON.stringify(ok ? { ok: true } : { ok: false, error: erreur }))
    .setMimeType(ContentService.MimeType.JSON);
}
