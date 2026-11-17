import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CollecteDuJour, Edition } from './index';

const lire = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

describe('schémas', () => {
	it('accepte la collecte exemple', () => {
		expect(CollecteDuJour.safeParse(lire('data/raw/exemple.json')).success).toBe(true);
	});
	it("accepte l'édition exemple", () => {
		expect(Edition.safeParse(lire('data/editions/exemple.json')).success).toBe(true);
	});
	it('rejette un JSON volontairement faux', () => {
		const faux = lire('data/editions/exemple.json');
		faux.sujets[0].faits[0].niveau = 'peut-etre';
		faux.sujets[0].importance = 150;
		expect(Edition.safeParse(faux).success).toBe(false);
	});
	it('rejette un fait sans source', () => {
		const faux = lire('data/editions/exemple.json');
		faux.sujets[0].faits[0].sources = [];
		expect(Edition.safeParse(faux).success).toBe(false);
	});
});
