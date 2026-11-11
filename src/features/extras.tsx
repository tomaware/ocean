// Onglets « Avis » (message envoyé sur la boîte mail de Tom) et « Widgets » (installation iPhone, Mac, Windows).
import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { Check, Copy, Download, Laptop, MessageSquare, Monitor, Smartphone } from 'lucide-preact';
import type { AllData } from '../services/data';
import { ago } from '../services/format';
import { usePrefs } from '../services/prefs';
import { previousHash } from '../services/nav';
import { deviceSummary, FEEDBACK_TYPES, FEEDBACK_URL, feedbackProblem, MAX_LEN, sendFeedback, type FeedbackType } from '../services/feedback';
import { Section, Seg } from '../components/ui';

// ------------------------------------------------------------------ Avis
type Sending = { state: 'idle' } | { state: 'sending' } | { state: 'sent' } | { state: 'error'; message: string };

export function FeedbackPage({ d, now }: { d: AllData; now: number }) {
  const [type, setType] = useState<FeedbackType>('commentaire');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [site, setSite] = useState('');            // champ piège : invisible, seuls les robots le remplissent
  const [st, setSt] = useState<Sending>({ state: 'idle' });
  const [tried, setTried] = useState(false);
  const from = previousHash() || '';
  const problem = feedbackProblem({ message, email });
  const ready = !!FEEDBACK_URL;

  const submit = async (e: Event) => {
    e.preventDefault();
    setTried(true);
    if (problem || !ready || st.state === 'sending') return;
    setSt({ state: 'sending' });
    try {
      await sendFeedback({ type, message, name, email, site, context: { page: from || '(arrivée directe)', device: deviceSummary(), data: new Date(d.meta.generatedAt).toISOString() } });
      setSt({ state: 'sent' }); setMessage('');
    } catch (err) {
      setSt({ state: 'error', message: (err as Error).message });
    }
  };

  return (
    <>
      <header class="page-head"><h1>Avis et commentaires</h1>
        <span class="muted">Une idée, un bug, une prévision qui s’est trompée ? Écris-le ici : le message arrive directement chez Tom.</span></header>
      {st.state === 'sent' ? (
        <div class="card stack" role="status">
          <strong class="row"><Check size={18} /> Merci, message envoyé.</strong>
          <span class="small muted">{email.trim() ? 'Tu recevras une réponse à l’adresse indiquée.' : 'Sans adresse e-mail, pas de réponse possible : c’est normal.'}</span>
          <div class="row"><button class="btn" type="button" onClick={() => setSt({ state: 'idle' })}>Écrire un autre message</button>
            {from && <a class="btn" href={from}>Revenir à l’écran précédent</a>}</div>
        </div>
      ) : (
        <form class="card stack fb" onSubmit={submit} noValidate>
          <div class="stack" style={{ gap: 'var(--s-2)' }}>
            <span class="small">Type de message</span>
            <Seg<FeedbackType> label="Type de message" value={type} onChange={setType} options={FEEDBACK_TYPES} />
          </div>
          <label class="field"><span class="small">Message</span>
            <textarea rows={7} maxLength={MAX_LEN + 200} required value={message} aria-invalid={tried && !!problem && message.trim().length < 3}
              placeholder={type === 'prevision' ? 'Quel spot, quel jour, ce qui était prévu et ce que tu as eu sur place…' : type === 'bug' ? 'Ce que tu faisais, ce qui s’est passé, ce que tu attendais…' : 'Ton message…'}
              onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)} />
            <span class="faint">{message.trim().length} / {MAX_LEN}</span></label>
          <div class="fb-who">
            <label class="field"><span class="small">Prénom (facultatif)</span>
              <input type="text" autoComplete="given-name" maxLength={80} value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} /></label>
            <label class="field"><span class="small">E-mail pour te répondre (facultatif)</span>
              <input type="email" inputMode="email" autoComplete="email" maxLength={120} value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} /></label>
          </div>
          <label class="hp" aria-hidden="true">Site web<input type="text" tabIndex={-1} autoComplete="off" value={site} onInput={(e) => setSite((e.target as HTMLInputElement).value)} /></label>
          <p class="faint">Joint au message pour aider à comprendre : l’écran d’où tu viens{from ? ` (${from.replace(/^#/, '')})` : ''}, le type d’appareil ({deviceSummary()}) et l’heure des données ({ago(d.meta.generatedAt, now)}). Rien d’autre n’est envoyé ni gardé par le site.</p>
          {tried && problem && <div class="notice warn" role="alert">{problem}</div>}
          {st.state === 'error' && <div class="notice warn" role="alert">Envoi impossible : {st.message}. Réessaie dans un moment.</div>}
          {!ready && <div class="notice">La réception des messages n’est pas encore branchée : le bouton s’activera dès qu’elle le sera.</div>}
          <div class="row"><button class="btn primary" type="submit" disabled={!ready || st.state === 'sending'}><MessageSquare size={16} /> {st.state === 'sending' ? 'Envoi…' : 'Envoyer'}</button></div>
        </form>
      )}
    </>
  );
}

// ------------------------------------------------------------------ Widgets
type Os = 'iphone' | 'mac' | 'windows';
const detectOs = (): Os => { const ua = navigator.userAgent; return /Windows/.test(ua) ? 'windows' : /Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua) && navigator.maxTouchPoints < 2 ? 'mac' : 'iphone'; };

export const WIDGETS = [
  { file: 'ocean-vent.js', name: 'OCEAN Vent', what: 'Un spot au choix : le vent maintenant (balise) et dans 2 h, puis 4 jours (étoiles, vent max, direction).', sizes: 'petit, moyen, grand, écran verrouillé' },
  { file: 'ocean-creneaux.js', name: 'OCEAN Créneaux', what: 'Les meilleurs créneaux wing tous spots confondus ; en grand, la grille spots × 5 jours remplie par étoiles.', sizes: 'petit, moyen, grand, écran verrouillé' },
  { file: 'ocean-vague.js', name: 'OCEAN Vague', what: 'Un spot surf au choix : les vagues maintenant (taille, période, houle, vent), 4 jours ; en grand, aujourd’hui et demain heure par heure et le meilleur créneau surf.', sizes: 'petit, moyen, grand, écran verrouillé' },
];

function useScripts(): Record<string, string | null> {
  const [s, set] = useState<Record<string, string | null>>({});
  useEffect(() => {
    // texte chargé d'avance : sur iPhone, la copie doit se faire tout de suite au toucher du bouton
    for (const w of WIDGETS) fetch(`./widgets/${w.file}`).then((r) => (r.ok && !/html/.test(r.headers.get('content-type') ?? '') ? r.text() : null)).catch(() => null)
      .then((t) => set((o) => ({ ...o, [w.file]: t })));
  }, []);
  return s;
}

function CopyButton({ text, label }: { text: string | null | undefined; label: string }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const copy = async () => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setOk(true); } catch { setOk(false); }
    setTimeout(() => setOk(null), 2500);
  };
  return <button class="btn primary" type="button" disabled={!text} onClick={copy}>{ok ? <Check size={16} /> : <Copy size={16} />} {ok ? 'Copié' : ok === false ? 'Copie refusée : utilise Télécharger' : label}</button>;
}

const Steps = ({ children }: { children: ComponentChildren }) => <ol class="steps">{children}</ol>;

export function WidgetsPage() {
  const prefs = usePrefs();
  const [os, setOs] = useState<Os>(detectOs());
  const scripts = useScripts();
  return (
    <>
      <header class="page-head"><h1>Installer les widgets</h1>
        <span class="muted">Le vent de ton spot et les meilleurs créneaux, sans ouvrir l’app. Mêmes données et mêmes étoiles qu’OCEAN, mises à jour toutes les heures.</span></header>
      <Seg<Os> label="Appareil" value={os} onChange={setOs} options={[['iphone', 'iPhone'], ['mac', 'Mac'], ['windows', 'Windows']]} />

      <div class="wgrid">
        {WIDGETS.map((w) => (
          <div key={w.file} class="card stack wcard">
            <strong>{w.name}</strong>
            <span class="small">{w.what}</span>
            <span class="faint">Tailles : {w.sizes}</span>
          </div>
        ))}
      </div>

      {os === 'iphone' && (
        <Section title={<span class="row"><Smartphone size={18} /> iPhone</span>}>
          <div class="card stack">
            <Steps>
              <li>Installe <a href="https://apps.apple.com/app/scriptable/id1405459188" target="_blank" rel="noopener">Scriptable</a> (App Store, gratuit). C’est l’app qui fait tourner les widgets OCEAN.</li>
              <li>Copie le script du widget (sur l’iPhone, depuis cette page) :
                <div class="wbtns">{WIDGETS.map((w) => (
                  <div key={w.file} class="row">
                    <CopyButton text={scripts[w.file]} label={`Copier « ${w.name} »`} />
                    <a class="btn" href={`./widgets/${w.file}`} download={`${w.name}.js`}><Download size={16} /> Télécharger</a>
                  </div>))}
                  {Object.keys(scripts).length === WIDGETS.length && WIDGETS.some((w) => !scripts[w.file]) && <span class="notice warn">Scripts indisponibles pour l’instant : réessaie plus tard.</span>}
                </div>
              </li>
              <li>Ouvre Scriptable → <b>+</b> en haut à droite → colle le texte. Touche le titre en haut pour le renommer <b>exactement</b> « OCEAN Vent » (ou « OCEAN Créneaux »), puis <b>OK</b>.</li>
              <li>Écran d’accueil : appui long sur un espace vide → <b>Modifier</b> → <b>Ajouter un widget</b> (ou <b>+</b> en haut à gauche) → cherche <b>Scriptable</b> → choisis la taille → <b>Ajouter le widget</b>.</li>
              <li>Appui long sur le nouveau widget → <b>Modifier le widget</b> → <b>Script</b> : « OCEAN Vent ». Laisse le reste tel quel : toucher le widget ouvre la fiche du spot dans OCEAN.</li>
              <li>Écran verrouillé (facultatif) : appui long sur l’écran verrouillé → <b>Personnaliser</b> → <b>Écran verrouillé</b> → zone des widgets → Scriptable, puis même réglage du script.</li>
            </Steps>
          </div>
          <div class="card stack">
            <strong>Régler un widget</strong>
            <span class="small">Champ <b>Parameter</b> du widget (appui long → Modifier le widget). Laisse-le vide pour les réglages par défaut.</span>
            <table class="params">
              <thead><tr><th>Widget</th><th>Parameter</th><th>Effet</th></tr></thead>
              <tbody>
                <tr><td>Vent</td><td><code>Beauduc</code>, <code>Le Jaï</code>, <code>G-Motte</code>…</td><td>Spot affiché (par défaut : La Grande-Motte)</td></tr>
                <tr><td>Vague</td><td><code>Sète</code>, <code>Palavas</code>, <code>Stes-Maries</code>…</td><td>Spot surf affiché (par défaut : Carnon)</td></tr>
                <tr><td>Vent / Créneaux</td><td><code>offshore</code></td><td>Mode OffShore au lieu de Sécu first (ex. <code>Beauduc offshore</code>)</td></tr>
                <tr><td>Créneaux</td><td><code>proches</code></td><td>Seulement les spots à moins de 55 km de Montpellier</td></tr>
                <tr><td>Créneaux</td><td><code>G-Motte, Beauduc, Le Jaï</code></td><td>Seulement ces spots</td></tr>
              </tbody>
            </table>
            <span class="small">Pour changer le spot de tous tes widgets d’un coup : ouvre « OCEAN Vent » dans Scriptable (▶︎) → <b>Choisir le spot</b>.</span>
            {prefs.perso.enabled && <span class="small"><b>Mode perso</b> : ▶︎ → <b>Brancher ma super prévision</b> et colle ton lien privé. Il reste dans le trousseau de l’iPhone ; le widget affiche alors les balises Winds-Up en direct.</span>}
            <span class="faint">En haut à droite : « ● Winds-Up abonné · 6 min » quand le vent vient de la balise, « prévision corrigée » sinon (vent prévu pour l’heure). iOS rafraîchit les widgets environ tous les quarts d’heure, parfois moins souvent.</span>
          </div>
        </Section>
      )}

      {os === 'mac' && (
        <Section title={<span class="row"><Laptop size={18} /> Mac</span>}>
          <div class="card stack">
            <strong>Le widget OCEAN sur le bureau</strong>
            <span class="small">Les cartes <b>Vent</b>, <b>Créneaux</b> et <b>Vague</b> (surf), chacune en petit, moyen ou grand, sans iPhone. Il tourne dans Übersicht, une app gratuite que l’installateur télécharge si besoin.</span>
            <div class="row"><a class="btn primary" href="./widgets/ocean-widget-mac.zip" download><Download size={16} /> Télécharger le widget Mac (.zip)</a></div>
            <Steps>
              <li>Double-clic sur le fichier téléchargé pour l’extraire.</li>
              <li>Dans le dossier, <b>clic droit</b> sur <b>installer.command</b> → <b>Ouvrir</b> → <b>Ouvrir</b> (la première fois, macOS bloque le double-clic sur un fichier venu d’Internet ; sinon : Réglages Système → Confidentialité et sécurité → <b>Ouvrir quand même</b>).</li>
              <li>Le Terminal installe tout ; s’il pose une question sur la super prévision, appuie sur <b>Entrée</b>. Le widget apparaît en haut à droite du bureau et revient à chaque démarrage.</li>
            </Steps>
            <span class="small"><b>Régler</b> : clic sur <b>⚙ réglages</b> sous le widget, change les valeurs du bloc « TES RÉGLAGES » (spot, mode, taille de chaque carte, spot surf…) puis <b>⌘S</b>. Une nouvelle version installée garde tes réglages.</span>
            {prefs.perso.enabled && <span class="small"><b>Mode perso</b> : colle le lien de ta super prévision quand l’installateur le demande ; il est rangé dans le trousseau du Mac et le widget affiche alors les balises Winds-Up en direct.</span>}
            <span class="faint">Pour l’enlever : clic droit sur <b>desinstaller.command</b> → Ouvrir.</span>
          </div>
          <div class="card stack">
            <strong>Ou : les widgets de l’iPhone sur le bureau du Mac</strong>
            <span class="small">Il faut d’abord les installer sur l’iPhone (onglet iPhone), un Mac sous macOS Sonoma (14) ou plus récent, un iPhone sous iOS 17 ou plus récent, connecté au même compte Apple et à proximité ou sur le même Wi-Fi.</span>
            <Steps>
              <li>Menu Pomme → <b>Réglages Système</b> → <b>Bureau et Dock</b> → section Widgets : active <b>Utiliser des widgets pour iPhone</b>.</li>
              <li>Clic sur le fond d’écran en maintenant la touche <b>Contrôle</b> → <b>Modifier les widgets</b>.</li>
              <li>Cherche <b>Scriptable</b> (widgets de l’iPhone), clique sur la taille voulue ou fais-la glisser sur le bureau, puis <b>Terminé</b>.</li>
              <li>Contrôle-clic sur le widget → <b>Modifier « Scriptable »</b> → Script : « OCEAN Vent », « OCEAN Créneaux » ou « OCEAN Vague » (et Parameter si besoin) → <b>OK</b>.</li>
            </Steps>
            <span class="faint">Les données viennent de l’iPhone : s’il est éteint ou loin, le widget garde son dernier affichage.</span>
          </div>
          <div class="card stack">
            <strong>L’app OCEAN dans le Dock</strong>
            <Steps>
              <li>Ouvre OCEAN dans Safari, puis menu <b>Fichier</b> → <b>Ajouter au Dock</b> → <b>Ajouter</b>.</li>
              <li>OCEAN s’ouvre alors dans sa propre fenêtre, comme une app.</li>
            </Steps>
          </div>
        </Section>
      )}

      {os === 'windows' && (
        <Section title={<span class="row"><Monitor size={18} /> Windows</span>}>
          <div class="card stack">
            <strong>Le widget OCEAN sur le bureau</strong>
            <span class="small">Les cartes <b>Vent</b> (ton spot, maintenant, dans 2 h et 4 jours), <b>Créneaux</b> (les meilleurs créneaux, ou la grille spots × 5 jours) et <b>Vague</b> (surf : à afficher au clic droit → Carte Vague), chacune en petit, moyen ou grand. Windows 10 ou 11, rien d’autre à installer.</span>
            <div class="row"><a class="btn primary" href="./widgets/ocean-widget-windows.zip" download><Download size={16} /> Télécharger le widget Windows (.zip)</a></div>
            <Steps>
              <li>Clic droit sur le fichier téléchargé → <b>Extraire tout…</b> → <b>Extraire</b>.</li>
              <li>Dans le dossier extrait, double-clic sur <b>installer.cmd</b>. Si Windows affiche « Windows a protégé votre ordinateur » : <b>Informations complémentaires</b> → <b>Exécuter quand même</b>.</li>
              <li>La fenêtre noire affiche « Terminé ! » : appuie sur une touche. Le widget apparaît en haut à droite de l’écran (<b>Windows + D</b> pour afficher le bureau) et se relance à chaque démarrage.</li>
            </Steps>
          </div>
          <div class="card stack">
            <strong>Régler le widget</strong>
            <span class="small"><b>Clic droit</b> sur le widget : spot du vent, spot de la vague, mode Sécu first ou OffShore, taille de chaque carte (Vent, Créneaux, Vague : petit, moyen, grand, masquée), spots des créneaux (tous ou proches de Montpellier), côte à côte ou l’une sous l’autre, thème, écran.</span>
            <span class="small"><b>Glisser</b> pour le déplacer ; <b>clic</b> sur une carte, un créneau ou une case : ouvre la fiche du spot dans OCEAN, au bon jour.</span>
            {prefs.perso.enabled && <span class="small"><b>Mode perso</b> : clic droit → <b>Brancher ma super prévision…</b> et colle ton lien privé (gardé chiffré sur le PC). Le widget affiche alors les balises Winds-Up en direct ; s’il trouve le lien de ton ancien widget Winds-Up, il le reprend tout seul.</span>}
            <span class="faint">Pour l’enlever : double-clic sur <b>desinstaller.cmd</b> dans le même dossier.</span>
          </div>
          <div class="card stack">
            <strong>L’app OCEAN dans la barre des tâches</strong>
            <Steps>
              <li>Ouvre OCEAN dans <b>Microsoft Edge</b> → menu <b>···</b> → <b>Applications</b> → <b>Installer ce site en tant qu’application</b> → <b>Installer</b>, puis coche <b>Épingler à la barre des tâches</b>.</li>
              <li>Avec Chrome : menu <b>⋮</b> → <b>Caster, enregistrer et partager</b> → <b>Installer la page en tant qu’application</b>.</li>
            </Steps>
          </div>
        </Section>
      )}
    </>
  );
}
