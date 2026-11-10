// Lecture des données publiées (data/*.json), produites chaque heure par le pipeline. L'interface ne calcule aucune note.
import { useEffect, useState } from 'preact/hooks';

export type Discipline = 'wing' | 'surf' | 'downwind';
export type Level = 'debutant' | 'intermediaire' | 'confirme' | 'secu' | 'offshore';
export const LEVELS: Level[] = ['debutant', 'intermediaire', 'confirme'];
export const LEVEL_LABEL: Record<Level, string> = { debutant: 'Débutant', intermediaire: 'Intermédiaire', confirme: 'Confirmé', secu: 'Sécu first', offshore: 'Offshore' };
/** Choix proposés par discipline : wing = 2 modes (D-19), downwind = 3 niveaux du moteur actuel, surf = note par spot. */
export const LEVELS_FOR: Record<Discipline, Level[]> = { wing: ['secu', 'offshore'], downwind: ['debutant', 'intermediaire', 'confirme'], surf: [] };
/** Sessions de 2H : spots à moins de 55 km de Montpellier (au-delà, 2 h ne valent pas le trajet). */
export const HOME = { name: 'Montpellier', lat: 43.6108, lon: 3.8767, radiusKm: 55 };
/** VAGUE (Tom, 10/11) : Sessions de 2H limitées à Carnon, Palavas et Sète, et au lendemain seulement (pas de prévision plus loin). */
export const SESSION_SPOTS: Partial<Record<Discipline, string[]>> = { surf: ['carnon', 'palavas', 'sete'] };
export const SESSION_TOMORROW_ONLY: Discipline[] = ['surf'];
export const DISC_LABEL: Record<Discipline, string> = { wing: 'Wing foil', surf: 'Surf', downwind: 'Downwind' };

export type Session = { id: string; discipline: Discipline; spot: string; spotName: string; level: Level | 'tous'; start: number; end: number; hours: number;
  mean: number; peak: number; peakAt: number; label: string; tone: 'top' | 'ok'; text: string; why: string | null; confidence: number | null;
  envoie?: boolean; windyHours?: number | null };
export type PublicSpot = { id: string; name: string; kind: 'spot' | 'run'; disciplines: string[]; waterBody: string; geometry: any; orientation: any; confidence: string; notes: string | null };
export type Meta = { generatedAt: number; sources: { id: string; ok: boolean; message: string; points: number; models: string[]; lastObservationAgeMin: Record<string, number> | null }[];
  checks: { id: string; ok: boolean; detail: string }[]; disciplines: Record<Discipline, { available: boolean; source: string; note: string }>; rules: any };
export type AllData = { meta: Meta; spots: PublicSpot[]; sessions: { generatedAt: number; sessions: Session[]; best: Record<Level, Record<Discipline, Session | null>> };
  wing: any; surf: any; downwind: any; verify: any; meteo: any };

const FILES = ['meta', 'spots', 'sessions', 'wing', 'surf', 'downwind', 'verify', 'meteo'] as const;
let cache: Promise<AllData> | null = null;

export function loadAll(base = './data/'): Promise<AllData> {
  if (!cache) {
    cache = Promise.all(FILES.map((f) => fetch(`${base}${f}.json`, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(`${f}.json : HTTP ${r.status}`); return r.json(); })))
      .then((arr) => Object.fromEntries(FILES.map((f, i) => [f, arr[i]])) as unknown as AllData);
    cache.catch(() => { cache = null; });
  }
  return cache;
}

export function useData(): { data: AllData | null; error: string | null } {
  const [data, setData] = useState<AllData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { loadAll().then(setData, (e) => setError(String(e.message ?? e))); }, []);
  return { data, error };
}

export const spotDiscipline = (s: PublicSpot): Discipline => (s.disciplines.includes('wing') ? 'wing' : s.disciplines.includes('surf') ? 'surf' : 'downwind');
export function distanceKm(s: PublicSpot): number {
  const [la, lo] = spotPos(s), r = Math.PI / 180;
  const a = Math.sin(((la - HOME.lat) * r) / 2) ** 2 + Math.cos(HOME.lat * r) * Math.cos(la * r) * Math.sin(((lo - HOME.lon) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
export const spotPos = (s: PublicSpot): [number, number] => ('lat' in s.geometry ? [s.geometry.lat, s.geometry.lon] : s.geometry.path[Math.floor(s.geometry.path.length / 2)]);
