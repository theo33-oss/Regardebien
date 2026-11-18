import { writeFileSync } from 'node:fs';
import { construireIndex } from './lib.js';

const index = construireIndex();
writeFileSync('data/index.json', JSON.stringify(index, null, '\t') + '\n');
console.log(
	`data/index.json : ${index.editions.length} édition(s), ${index.collectes.length} collecte(s)`
);
