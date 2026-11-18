import { asset } from '$app/paths';
import { CollecteDuJour, Edition, Index } from '#lib/schema/index.js';
import type { RubriqueConfig, Saison } from './lecture.js';

// Les fichiers de static/data/ sont générés : leurs noms ne sont pas connus des types de SvelteKit.
const url = (chemin: string) => asset(`data/${chemin}` as 'data/index.json');

async function lireJson(chemin: string): Promise<unknown> {
	const r = await fetch(url(chemin), { cache: 'no-cache' });
	if (!r.ok) throw new Error(`${chemin} : HTTP ${r.status}`);
	return r.json();
}

export const chargerIndex = async (): Promise<Index> => Index.parse(await lireJson('index.json'));

/** Une édition invalide est traitée comme absente (l'appli bascule sur Flux). */
export async function chargerEdition(fichier: string): Promise<Edition | null> {
	try {
		return Edition.parse(await lireJson(fichier));
	} catch {
		return null;
	}
}

export async function chargerCollecte(fichier: string): Promise<CollecteDuJour | null> {
	try {
		return CollecteDuJour.parse(await lireJson(fichier));
	} catch {
		return null;
	}
}

export async function chargerConfig(): Promise<{ rubriques: RubriqueConfig[]; saisons: Saison[] }> {
	const [rubriques, saisons] = await Promise.all([
		lireJson('rubriques.json'),
		lireJson('saisons.json')
	]);
	return { rubriques: rubriques as RubriqueConfig[], saisons: (saisons ?? []) as Saison[] };
}

/** Précharge les éditions récentes : le service worker les garde pour la lecture hors-ligne. */
export function prechargerEditions(index: Index, n = 7): void {
	for (const e of index.editions.slice(0, n)) void fetch(url(e.fichier)).catch(() => {});
}

let cache: Promise<{ index: Index; rubriques: RubriqueConfig[]; saisons: Saison[] }> | null = null;

/** Index et configuration, chargés une seule fois par visite. */
export function chargerEnsemble() {
	cache ??= Promise.all([chargerIndex(), chargerConfig()])
		.then(([index, config]) => ({ index, ...config }))
		.catch((e) => {
			cache = null;
			throw e;
		});
	return cache;
}

/** Oublie les données chargées : la prochaine lecture repart du serveur. */
export function oublierDonnees() {
	cache = null;
}
