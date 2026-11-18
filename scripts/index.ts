import { writeFileSync } from 'node:fs';
import type { Index } from '../src/lib/schema/index.js';
import { loadCollectes, loadEditions } from './lib.js';

// Les fichiers marqués "exemple" sont ignorés.
const editions = loadEditions()
	.filter((e) => !e.edition.exemple)
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
	.filter((c) => !c.collecte.exemple)
	.map(({ fichier, collecte }) => ({ date: collecte.date, creneau: collecte.creneau, fichier }))
	.sort((a, b) => (a.date + a.creneau).localeCompare(b.date + b.creneau));

const index: Index = { genere_le: new Date().toISOString(), editions, collectes };
writeFileSync('data/index.json', JSON.stringify(index, null, '\t') + '\n');
console.log(`data/index.json : ${editions.length} édition(s), ${collectes.length} collecte(s)`);
