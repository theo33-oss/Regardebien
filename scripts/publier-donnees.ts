import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { construireIndex } from './lib.js';

// Prépare static/data/ pour l'appli (copié à chaque dev et build, jamais versionné).
// Avec --exemples (développement), les fichiers « exemple » sont inclus.
const exemples = process.argv.includes('--exemples');
const SORTIE = 'static/data';

rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE, { recursive: true });

const index = construireIndex(exemples);
writeFileSync(`${SORTIE}/index.json`, JSON.stringify(index));
for (const f of [
	...index.editions.map((e) => e.fichier),
	...index.collectes.map((c) => c.fichier)
]) {
	mkdirSync(`${SORTIE}/${f.split('/')[0]}`, { recursive: true });
	cpSync(`data/${f}`, `${SORTIE}/${f}`);
}
for (const nom of ['rubriques', 'saisons']) {
	const contenu = parse(readFileSync(`config/${nom}.yaml`, 'utf8'));
	writeFileSync(`${SORTIE}/${nom}.json`, JSON.stringify(contenu));
}
console.log(
	`static/data : ${index.editions.length} édition(s), ${index.collectes.length} collecte(s)${exemples ? ' (avec exemples)' : ''}`
);
