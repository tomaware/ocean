// OCEAN Vague — widget de bureau pour Mac (Übersicht)
// Le surf sur le spot de ton choix : vagues prévues pour l'heure, 4 jours ; en grand, aujourd'hui et demain
// heure par heure et le meilleur créneau surf. Mêmes données et mêmes étoiles que l'app OCEAN et le widget iPhone.
//
//  • Glisser la carte pour la déplacer ; ⚙ (au survol, coin en haut à droite) pour les réglages.
//  • Clic sur la carte : fiche du spot dans OCEAN.
//  • Tout est retenu (spot, taille, thème, position) d'un lancement à l'autre.
import { run } from "uebersicht";

// ================================================================ RÉGLAGES DE DÉPART
// (seulement au tout premier lancement ; ensuite tout se règle avec ⚙ et reste retenu)
const SPOT = "carnon";               // carnon, palavas, sete, vias, saintes-maries, la-couronne
const TAILLE = "moyen";              // "petit", "moyen" ou "grand"
const THEME = "auto";                // "auto" (comme le Mac), "clair" ou "sombre"
// ================================================================

//@@CORE@@

const FICHIER = "ocean-vague.jsx", MARQUEUR = "OCEAN_MAC_VAGUE_FIN", KEY = "ocean.mac.vague";
const DEFAUTS = { spot: SPOT, taille: TAILLE, theme: THEME, x: null, y: null };

export const refreshFrequency = 15 * 60 * 1000;   // les prévisions changent toutes les heures
export const command = [curl(SURF), majAuto(FICHIER, MARQUEUR)].join("; ");
export const className = "top: 0; left: 0;";
export const initialState = { output: undefined, prefs: null, settings: false, pos: null };
export const updateState = reducer(KEY, DEFAUTS);

const refresh = (dispatch) => () => run(command).then((output) => dispatch({ type: "DATA", output })).catch(() => {});

export function parse(output) {
  const { data, cached } = withCache(KEY, jsonOf(output));
  return { surf: data, cached };
}

export function view(state, dispatch = () => {}, now = Date.now()) {
  const prefs = state.prefs || prefsOf(KEY, DEFAUTS);
  const { surf, cached } = parse(state.output);
  const place = placeOf(state, prefs, 420);
  const set = (p) => dispatch({ type: "PREFS", prefs: { ...prefs, ...p } });
  if (!surf) return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} card={<Empty nom="Vague" />} panel={null} />;
  const sp = findSpot(surf.spots, prefs.spot, "carnon");
  const panel = <Panel titre="Vague" side={place.side} dispatch={dispatch} refresh={refresh(dispatch)}>
    <div className="lab">Spot</div><Chips items={surf.spots.map((s) => [s.id, s.short])} isOn={(v) => v === sp.id} onPick={(v) => set({ spot: v })} />
    <div className="lab">Taille</div><Seg value={prefs.taille} options={TAILLES} onPick={(v) => set({ taille: v })} />
    <div className="lab">Thème</div><Seg value={prefs.theme} options={THEMES} onPick={(v) => set({ theme: v })} />
  </Panel>;
  return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} cached={cached}
    card={<VagueCard m={vagueModel(surf, sp, now)} size={prefs.taille} now={now} />} panel={panel} />;
}
export const render = (state, dispatch) => view(state, dispatch);
// OCEAN_MAC_VAGUE_FIN
