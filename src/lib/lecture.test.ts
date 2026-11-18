import { describe, expect, it } from 'vitest';
import {
	dateLongue,
	enSaison,
	parRubrique,
	rubriquesVisibles,
	selectionner,
	type RubriqueConfig,
	type Saison
} from './lecture.js';
import type { Sujet } from './schema/index.js';

const rubriques: RubriqueConfig[] = [
	{ id: 'defense', nom: 'Défense' },
	{ id: 'culture', nom: 'Culture', max_sujets: 4 },
	{ id: 'politique', nom: 'Politique', saisonniere: true }
];
const saisons: Saison[] = [
	{ rubrique: 'politique', nom: 'Présidentielle', debut: '2027-03-12', fin: '2027-05-16' }
];

const sujet = (id: string, rubrique: Sujet['rubrique'], importance: number): Sujet => ({
	id,
	rubrique,
	etiquettes: [],
	titre: id,
	resume_court: '',
	synthese: '',
	faits: [],
	angles: [],
	divergences: [],
	sources: [],
	importance
});

describe('saisons', () => {
	it('bornes incluses', () => {
		expect(enSaison(saisons, 'politique', '2027-03-12')).toBe(true);
		expect(enSaison(saisons, 'politique', '2027-05-16')).toBe(true);
		expect(enSaison(saisons, 'politique', '2027-03-11')).toBe(false);
	});
	it('Auto suit les dates, Toujours et Jamais l’emportent', () => {
		expect(rubriquesVisibles(rubriques, saisons, '2026-11-17', 'auto')).not.toContain('politique');
		expect(rubriquesVisibles(rubriques, saisons, '2027-04-01', 'auto')).toContain('politique');
		expect(rubriquesVisibles(rubriques, saisons, '2026-11-17', 'toujours')).toContain('politique');
		expect(rubriquesVisibles(rubriques, saisons, '2027-04-01', 'jamais')).not.toContain(
			'politique'
		);
	});
});

describe('temps de lecture', () => {
	const tous = Array.from({ length: 20 }, (_, i) => sujet(`s${i}`, 'defense', i));
	it('2 min : 5 sujets les plus importants', () => {
		const r = selectionner(tous, '2', ['defense']);
		expect(r.map((s) => s.id)).toEqual(['s19', 's18', 's17', 's16', 's15']);
	});
	it('10 min : 15 ; Tout : tout', () => {
		expect(selectionner(tous, '10', ['defense'])).toHaveLength(15);
		expect(selectionner(tous, 'tout', ['defense'])).toHaveLength(20);
	});
	it('ignore les rubriques masquées', () => {
		expect(selectionner([sujet('p', 'politique', 99)], 'tout', ['defense'])).toHaveLength(0);
	});
});

describe('parRubrique', () => {
	it('suit l’ordre de la config et saute les rubriques vides', () => {
		const g = parRubrique([sujet('c', 'culture', 1), sujet('d', 'defense', 1)], rubriques);
		expect(g.map((x) => x.rubrique.id)).toEqual(['defense', 'culture']);
	});
});

describe('dateLongue', () => {
	it('écrit la date en français', () => {
		expect(dateLongue('2026-11-18')).toBe('18 novembre 2026');
		expect(dateLongue('n’importe quoi')).toBe('n’importe quoi');
	});
});
