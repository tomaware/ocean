// OCEAN Créneaux — widget de bureau pour Mac (Übersicht)
// Les meilleurs créneaux wing, tous spots confondus ; en grand, le meilleur créneau en haut puis la grille
// spots × jours. Mêmes données et mêmes étoiles que l'app OCEAN et les widgets iPhone.
//
//  • Glisser la carte pour la déplacer ; ⚙ (au survol, coin en haut à droite) pour les réglages.
//  • Clic sur un créneau ou une case : fiche du spot au bon jour dans OCEAN.
//  • Tout est retenu (mode, spots suivis, taille, thème, position) d'un lancement à l'autre.
import { run } from "uebersicht";

// ================================================================ RÉGLAGES DE DÉPART
// (seulement au tout premier lancement ; ensuite tout se règle avec ⚙ et reste retenu)
const MODE = "secu";                 // "secu" (Sécu first) ou "offshore"
const SPOTS = "tous";                // "tous" ou "proches" (moins de 55 km de Montpellier)
const TAILLE = "moyen";              // "petit", "moyen" ou "grand"
const THEME = "auto";                // "auto" (comme le Mac), "clair" ou "sombre"
// ================================================================

//@@CORE@@

const FICHIER = "ocean-creneaux.jsx", MARQUEUR = "OCEAN_MAC_CRENEAUX_FIN", KEY = "ocean.mac.creneaux";
const DEFAUTS = { mode: MODE, spots: SPOTS, taille: TAILLE, theme: THEME, x: null, y: null };

export const refreshFrequency = 15 * 60 * 1000;   // les prévisions changent toutes les heures
export const command = [curl(DATA), majAuto(FICHIER, MARQUEUR)].join("; ");
export const className = "top: 0; left: 0;";
export const initialState = { output: undefined, prefs: null, settings: false, pos: null };
export const updateState = reducer(KEY, DEFAUTS);

const refresh = (dispatch) => () => run(command).then((output) => dispatch({ type: "DATA", output })).catch(() => {});

export function parse(output) {
  const { data, cached } = withCache(KEY, jsonOf(output));
  return { wind: data, cached };
}

export function view(state, dispatch = () => {}, now = Date.now()) {
  const prefs = state.prefs || prefsOf(KEY, DEFAUTS);
  const { wind, cached } = parse(state.output);
  const place = placeOf(state, prefs, 230);
  const set = (p) => dispatch({ type: "PREFS", prefs: { ...prefs, ...p } });
  if (!wind) return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} card={<Empty nom="Créneaux" />} panel={null} />;
  const level = prefs.mode === "offshore" ? "offshore" : "secu";
  const cm = creneauxModel(wind, level, prefs.spots, now);
  // spots suivis : « Tous », « Proches », ou un choix spot par spot (un appui ajoute ou retire)
  const chosen = Array.isArray(prefs.spots) ? prefs.spots : prefs.spots === "proches" ? NEAR : wind.spots.map((s) => s.id);
  const toggle = (id) => { const next = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    set({ spots: next.length === wind.spots.length || !next.length ? "tous" : next }); };
  const panel = <Panel titre="Créneaux" side={place.side} dispatch={dispatch} refresh={refresh(dispatch)}>
    <div className="lab">Mode</div><Seg value={level} options={MODES} onPick={(v) => set({ mode: v })} />
    <div className="lab">Spots suivis</div>
    <Seg value={Array.isArray(prefs.spots) ? "choix" : prefs.spots} options={[["tous", "Tous"], ["proches", "Proches"], ["choix", "Au choix"]]}
      onPick={(v) => set({ spots: v === "choix" ? chosen : v })} />
    <Chips items={wind.spots.map((s) => [s.id, s.short])} isOn={(v) => chosen.includes(v)} onPick={toggle} />
    <div className="lab">Taille</div><Seg value={prefs.taille} options={TAILLES} onPick={(v) => set({ taille: v })} />
    <div className="lab">Thème</div><Seg value={prefs.theme} options={THEMES} onPick={(v) => set({ theme: v })} />
  </Panel>;
  return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} cached={cached}
    card={<CreneauxCard cm={cm} size={prefs.taille} now={now} />} panel={panel} />;
}
export const render = (state, dispatch) => view(state, dispatch);
// OCEAN_MAC_CRENEAUX_FIN
