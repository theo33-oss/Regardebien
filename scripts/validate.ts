import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { Index } from '../src/lib/schema/index.js';
import { loadCollectes, loadEditions, loadSources, readJson } from './lib.js';
import { verifierEdition } from './regles-edition.js';

let erreurs = 0;
function verifier(nom: string, fn: () => unknown) {
	try {
		fn();
		console.log(`ok  ${nom}`);
	} catch (e) {
		erreurs++;
		console.error(`ERREUR ${nom}\n${e instanceof Error ? e.message : e}`);
	}
}

verifier('config/sources.yaml', loadSources);
verifier('data/raw/*.json', loadCollectes);
verifier('data/editions/*.json', loadEditions);
// Règles de fond sur les éditions réelles (niveaux, sources, limites par rubrique).
verifier('règles des éditions (sources, niveaux)', () => {
	const rubriques = parse(readFileSync('config/rubriques.yaml', 'utf8')) as {
		id: string;
		max_sujets?: number;
	}[];
	const max = Object.fromEntries(
		rubriques.filter((r) => r.max_sujets).map((r) => [r.id, r.max_sujets as number])
	);
	const collectes = loadCollectes().map((c) => c.collecte);
	const problemes = loadEditions()
		.filter((e) => !e.edition.exemple)
		.flatMap(({ fichier, edition }) =>
			verifierEdition(
				edition,
				collectes.filter((c) => c.date === edition.date),
				max
			).map((p) => `${fichier} : ${p}`)
		);
	if (problemes.length) throw new Error(problemes.join('\n'));
});
if (existsSync('data/index.json')) {
	verifier('data/index.json', () => Index.parse(readJson('data/index.json')));
}
if (erreurs) process.exit(1);
