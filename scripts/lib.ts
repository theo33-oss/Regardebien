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

/** Table des matières des données. Les fichiers « exemple » sont ignorés, sauf demande explicite. */
export function construireIndex(inclureExemples = false): Index {
	const editions = loadEditions()
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

	const collectes = loadCollectes()
		.filter((c) => inclureExemples || !c.collecte.exemple)
		.map(({ fichier, collecte }) => ({
			date: collecte.date,
			creneau: collecte.creneau,
			fichier
		}))
		.sort((a, b) => (a.date + a.creneau).localeCompare(b.date + b.creneau));

	return { genere_le: new Date().toISOString(), editions, collectes };
}
