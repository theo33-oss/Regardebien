import type { Rubrique, Sujet } from './schema/index.js';

export type Temps = '2' | '10' | 'tout';
export type ReglagePolitique = 'auto' | 'toujours' | 'jamais';
export type Mode = 'flux' | 'edition';

export type RubriqueConfig = {
	id: Rubrique;
	nom: string;
	saisonniere?: boolean;
	max_sujets?: number;
};
export type Saison = {
	rubrique: Rubrique;
	nom: string;
	debut: string;
	fin: string;
	evenements?: { date: string; nom: string }[];
};

export const NB_SUJETS: Record<Temps, number> = { '2': 5, '10': 15, tout: Infinity };

/** Date du jour à Paris (AAAA-MM-JJ). */
export function dateParis(d = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Paris',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(d);
}

/** Heure à Paris (HH:MM) d'un horodatage ISO. */
export function heureParis(iso: string): string {
	return new Intl.DateTimeFormat('fr-FR', {
		timeZone: 'Europe/Paris',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(iso));
}

/** Une rubrique saisonnière est-elle de saison à cette date ? */
export function enSaison(saisons: Saison[], rubrique: Rubrique, date: string): boolean {
	return saisons.some((s) => s.rubrique === rubrique && date >= s.debut && date <= s.fin);
}

/**
 * Rubriques à afficher. Les rubriques normales le sont toujours ; une rubrique saisonnière
 * suit le réglage (Toujours / Jamais l'emportent sur les dates, Auto suit les saisons).
 */
export function rubriquesVisibles(
	rubriques: RubriqueConfig[],
	saisons: Saison[],
	date: string,
	reglagePolitique: ReglagePolitique
): Rubrique[] {
	return rubriques
		.filter((r) => {
			if (!r.saisonniere) return true;
			if (reglagePolitique === 'toujours') return true;
			if (reglagePolitique === 'jamais') return false;
			return enSaison(saisons, r.id, date);
		})
		.map((r) => r.id);
}

/** Sujets retenus pour un temps de lecture : les plus importants, toutes rubriques confondues. */
export function selectionner(sujets: Sujet[], temps: Temps, visibles: Rubrique[]): Sujet[] {
	const gardes = [...sujets]
		.filter((s) => visibles.includes(s.rubrique))
		.sort((a, b) => b.importance - a.importance)
		.slice(0, NB_SUJETS[temps]);
	return gardes;
}

/** Regroupe par rubrique, dans l'ordre de la config ; chaque groupe trié par importance. */
export function parRubrique<T extends { rubrique: Rubrique }>(
	elements: T[],
	rubriques: RubriqueConfig[]
): { rubrique: RubriqueConfig; elements: T[] }[] {
	return rubriques
		.map((rubrique) => ({ rubrique, elements: elements.filter((e) => e.rubrique === rubrique.id) }))
		.filter((g) => g.elements.length > 0);
}

/** Nom court d'un site à partir d'une URL. */
export function domaine(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
}
