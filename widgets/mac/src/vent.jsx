// OCEAN Vent — widget de bureau pour Mac (Übersicht)
// Le vent du spot de ton choix : maintenant (balise en direct si branchée), dans 2 h, puis 4 jours ;
// en grand, aujourd'hui et demain heure par heure. Mêmes données et mêmes étoiles que l'app OCEAN et les widgets iPhone.
//
//  • Glisser la carte pour la déplacer ; ⚙ (au survol, coin en haut à droite) pour les réglages.
//  • Clic sur la carte : fiche du spot dans OCEAN.
//  • Tout est retenu (spot, mode, taille, thème, position) d'un lancement à l'autre.
//
// Mode perso (balise Winds-Up en direct) : le lien de ta super prévision est lu dans le trousseau du Mac
// (élément « ocean.superprevision »), jamais dans ce fichier. Il se branche dans les réglages (⚙).
import { run } from "uebersicht";

// ================================================================ RÉGLAGES DE DÉPART
// (seulement au tout premier lancement ; ensuite tout se règle avec ⚙ et reste retenu)
const SPOT = "la-grande-motte";      // la-franqui, la-grande-motte, le-ponant, port-camargue, beauduc, le-jai, almanarre
const MODE = "secu";                 // "secu" (Sécu first) ou "offshore"
const TAILLE = "moyen";              // "petit", "moyen" ou "grand"
const THEME = "auto";                // "auto" (comme le Mac), "clair" ou "sombre"
// ================================================================

//@@CORE@@

const FICHIER = "ocean-vent.jsx", MARQUEUR = "OCEAN_MAC_VENT_FIN", KEY = "ocean.mac.vent";
const DEFAUTS = { spot: SPOT, mode: MODE, taille: TAILLE, theme: THEME, x: null, y: null };

export const refreshFrequency = 5 * 60 * 1000;   // balise toutes les 5 min ; les prévisions changent toutes les heures
export const command = [curl(DATA), `echo "${SEP}"`, LIVE_CMD, majAuto(FICHIER, MARQUEUR)].join("; ");
export const className = "top: 0; left: 0;";
export const initialState = { output: undefined, prefs: null, settings: false, pos: null };
export const updateState = reducer(KEY, DEFAUTS);

const refresh = (dispatch) => () => run(command).then((output) => dispatch({ type: "DATA", output })).catch(() => {});
// le lien est tapé par toi dans une fenêtre du Mac et rangé directement dans le trousseau : le widget ne le voit jamais en clair
const setLink = (dispatch) => run(`L=$(osascript -e 'text returned of (display dialog "Lien …/exec?key=… de ta super prévision (gardé dans le trousseau du Mac) :" default answer "" with title "OCEAN" buttons {"Annuler", "Enregistrer"} default button 2)' 2>/dev/null) && case "$L" in https://script.google.com/*/exec*) security add-generic-password -U -a "$USER" -s ocean.superprevision -w "$L" && echo ok;; *) echo bad;; esac`)
  .then(refresh(dispatch)).catch(() => {});
const unsetLink = (dispatch) => run(`security delete-generic-password -s ocean.superprevision >/dev/null 2>&1; echo ok`).then(refresh(dispatch)).catch(() => {});

export function parse(output) {
  const [a, b] = String(output || "").split(SEP);
  const { data, cached } = withCache(KEY, jsonOf(a));
  const nolink = String(b || "").trim() === NOLINK;
  return { wind: data, cached, live: nolink ? null : jsonOf(b), nolink };
}

export function view(state, dispatch = () => {}, now = Date.now()) {
  const prefs = state.prefs || prefsOf(KEY, DEFAUTS);
  const { wind, live, cached, nolink } = parse(state.output);
  const place = placeOf(state, prefs, 40);
  const set = (p) => dispatch({ type: "PREFS", prefs: { ...prefs, ...p } });
  if (!wind) return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} card={<Empty nom="Vent" />} panel={null} />;
  const level = prefs.mode === "offshore" ? "offshore" : "secu";
  const sp = findSpot(wind.spots, prefs.spot, "la-grande-motte");
  const m = ventModel(wind, sp, level, liveFor(sp, wind, live, now), now);
  const panel = <Panel titre="Vent" side={place.side} dispatch={dispatch} refresh={refresh(dispatch)}>
    <div className="lab">Spot</div><Chips items={wind.spots.map((s) => [s.id, s.short])} isOn={(v) => v === sp.id} onPick={(v) => set({ spot: v })} />
    <div className="lab">Mode</div><Seg value={level} options={MODES} onPick={(v) => set({ mode: v })} />
    <div className="lab">Taille</div><Seg value={prefs.taille} options={TAILLES} onPick={(v) => set({ taille: v })} />
    <div className="lab">Thème</div><Seg value={prefs.theme} options={THEMES} onPick={(v) => set({ theme: v })} />
    <div className="lab">Balise en direct (mode perso)</div>
    <div className="row"><span className="ink2 s11">{nolink ? "Non branchée : vent prévu." : "Super prévision branchée."}</span>
      <span data-btn="1" className="linkbtn" onClick={stop(() => setLink(dispatch))}>{nolink ? "Brancher…" : "Changer…"}</span>
      {nolink ? null : <span data-btn="1" className="linkbtn" onClick={stop(() => unsetLink(dispatch))}>Retirer</span>}</div>
  </Panel>;
  return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} cached={cached}
    card={<VentCard m={m} size={prefs.taille} now={now} />} panel={panel} />;
}
export const render = (state, dispatch) => view(state, dispatch);
// OCEAN_MAC_VENT_FIN
