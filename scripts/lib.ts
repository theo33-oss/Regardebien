import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { CollecteDuJour, Edition, Source, type Index } from '../src/lib/schema/index.js';

export const DATA = 'data';

export function jsonFiles(dir: string): string[] {
	return readdirSync(join(DATA, dir))
		.filter((f) => f.endsWith('.json'))
		.sort();
}

export function readJson(path: string): unknown {
	return JSON.parse(readFileSync(path, 'utf8'));
}

export function loadEditions() {
	return jsonFiles('editions').map((f) => ({
		fichier: `editions/${f}`,
		edition: Edition.parse(readJson(join(DATA, 'editions', f)))
	}));
}

export function loadCollectes() {
	return jsonFiles('raw').map((f) => ({
		fichier: `raw/${f}`,
		collecte: CollecteDuJour.parse(readJson(join(DATA, 'raw', f)))
	}));
}

export function loadSources() {
	return Source.array().parse(parse(readFileSync('config/sources.yaml', 'utf8')) ?? []);
}

/** Lit un dossier en ignorant (avec un avertissement) les fichiers invalides. */
function lireTolerant<T>(
	dir: string,
	schema: { safeParse(x: unknown): { success: boolean; data?: T } }
) {
	return jsonFiles(dir).flatMap((f) => {
		let r: { success: boolean; data?: T };
		try {
			r = schema.safeParse(readJson(join(DATA, dir, f)));
		} catch {
			r = { success: false };
		}
		if (!r.success)
			console.warn(`AVERTISSEMENT ${dir}/${f} invalide : ignoré (voir npm run validate)`);
		return r.success ? [{ fichier: `${dir}/${f}`, donnee: r.data as T }] : [];
	});
}

/**
 * Table des matières des données. Les fichiers « exemple » sont ignorés, sauf demande explicite.
 * Un fichier invalide est écarté sans bloquer : la collecte et la mise en ligne continuent,
 * et l'appli affiche le Flux à la place d'une édition illisible. npm run validate reste strict.
 */
export function construireIndex(inclureExemples = false): Index {
	const editions = lireTolerant<Edition>('editions', Edition)
		.map(({ fichier, donnee }) => ({ fichier, edition: donnee }))
		.filter((e) => inclureExemples || !e.edition.exemple)
		.sort((a, b) => b.edition.numero - a.edition.numero)
		.map(({ fichier, edition }) => ({
			date: edition.date,
			numero: edition.numero,
			fichier,
			mode: edition.mode,
			titres: [...edition.sujets]
				.sort((a, b) => b.importance - a.importance)
				.slice(0, 3)
				.map((s) => s.titre)
		}));

	const collectes = lireTolerant<CollecteDuJour>('raw', CollecteDuJour)
		.map(({ fichier, donnee }) => ({ fichier, collecte: donnee }))
		.filter((c) => inclureExemples || !c.collecte.exemple)
		.map(({ fichier, collecte }) => ({
			date: collecte.date,
			creneau: collecte.creneau,
			fichier
		}))
		.sort((a, b) => (a.date + a.creneau).localeCompare(b.date + b.creneau));

	return { genere_le: new Date().toISOString(), editions, collectes };
}
