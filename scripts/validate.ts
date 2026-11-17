import { existsSync } from 'node:fs';
import { Index } from '../src/lib/schema/index.js';
import { loadCollectes, loadEditions, loadSources, readJson } from './lib.js';

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
if (existsSync('data/index.json')) {
	verifier('data/index.json', () => Index.parse(readJson('data/index.json')));
}
if (erreurs) process.exit(1);
