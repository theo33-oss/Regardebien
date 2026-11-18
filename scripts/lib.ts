import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { CollecteDuJour, Edition, Source } from '../src/lib/schema/index.js';

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
