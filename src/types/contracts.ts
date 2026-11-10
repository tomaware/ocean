// Contrats de données OCEAN, partagés par le pipeline (/pipeline) et l'application (/src).
// Unités stockées : SI (m/s, m, s, °, °C). Les nœuds ne servent qu'à l'affichage.
// Temps : millisecondes depuis l'époque, UTC.

export type Discipline = 'wing' | 'kite' | 'surf' | 'downwind';
export type Level = 'debutant' | 'intermediaire' | 'confirme';
export type Unit = 'm/s' | 'deg' | 'm' | 's' | 'degC' | '1' | 'mm' | '%';   // '1' = sans unité (ex. confiance 0-1)

/** D'où vient une donnée : toujours conservé, jusqu'à l'interface. */
export interface Provenance {
  source: string;          // ex. 'open-meteo', 'candhis', 'super-prevision', 'metar'
  url?: string;            // URL publique de la source (jamais une URL contenant une clé)
  fetchedAt: number;       // quand OCEAN l'a récupérée
  issuedAt?: number;       // quand la source l'a produite (si connu)
  note?: string;
}

// ---------------------------------------------------------------- Spot Registry
export interface SpotGeometryPoint { lat: number; lon: number }
export interface SpotGeometryPath { path: [number, number][] }

export interface Spot {
  id: string;                                   // identifiant stable, jamais le nom
  name: string;
  kind: 'spot' | 'run';
  geometry: SpotGeometryPoint | SpotGeometryPath;
  disciplines: Discipline[];
  waterBody: 'sea' | 'lagoon';
  // direction du large vue de la plage (°) ; avoid = secteurs de vent déconseillés (plan d'eau fermé), [de, à] en °
  orientation: { seaward: number | null; avoid?: [number, number][]; confidence?: 'low' | 'medium' | 'high'; source?: string } | null;
  swellWindow?: { min: number; max: number; ideal?: number };
  buoys?: string[];
  windStations?: { windsUp?: string; metar?: string | null };
  legacy: Record<string, string>;               // identifiants dans les apps actuelles
  confidence: 'low' | 'medium' | 'high';
  sources: string[];
  [extra: string]: unknown;
}

export interface Buoy { code: string; name: string; lat: number; lon: number; depthM?: number; nearshore: boolean; status: string }
export interface Station { icao: string; name: string; lat: number; lon: number }
export interface Registry { version: number; updated: string; spots: Spot[]; buoys: Buoy[]; stations: Station[] }

// ---------------------------------------------------------------- ① Collecte
/** Point où une source est interrogée, et qui s'en sert. */
export interface CollectPoint {
  id: string;
  lat: number;
  lon: number;
  usedBy: string[];         // ex. ['surf', 'downwind']
}

/** Prévisions horaires d'une source : values[pointId][model][variable][i] correspond à times[i]. */
export interface ForecastBlock {
  id: string;               // ex. 'open-meteo-marine'
  kind: 'forecast' | 'corrected';
  variables: Record<string, Unit>;
  models: string[];
  times: number[];
  values: Record<string, Record<string, Record<string, (number | null)[]>>>;
  provenance: Provenance;
}

/** Mesures (pas de temps irrégulier) : stations[id] = { t: [...], variable: [...] }. */
export interface ObservationBlock {
  id: string;               // ex. 'candhis', 'metar'
  kind: 'observed';
  variables: Record<string, Unit>;
  stations: Record<string, { t: number[]; [variable: string]: (number | null)[] }>;
  provenance: Provenance;
}

export interface SourceStatus {
  id: string;
  ok: boolean;
  message: string;
  durationMs: number;
  points: number;
  models: string[];
  values: number;           // valeurs reçues
  missing: number;          // dont manquantes (null)
  rejected: number;         // dont rejetées comme aberrantes (remplacées par null)
  first?: number;
  last?: number;
  lastObservationAgeMin?: Record<string, number>;
}

export interface Check { id: string; ok: boolean; detail: string }

export interface CollectBundle {
  version: 1;
  generatedAt: number;
  points: CollectPoint[];
  forecasts: ForecastBlock[];
  observations: ObservationBlock[];
  status: SourceStatus[];
  checks: Check[];
}
