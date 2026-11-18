import { describe, expect, it } from 'vitest';
import type { CollecteDuJour, Edition } from '../src/lib/schema/index.js';
import { verifierEdition } from './regles-edition.js';

const art = (id: string, source_id: string, agence: 'afp' | null = null) => ({
	id,
	source_id,
	media: source_id,
	titre: 't',
	url: `https://x.fr/${id}`,
	publie_le: '2026-11-17T08:00:00.000Z',
	resume: '',
	langue: 'fr',
	rubrique_suggeree: null,
	agence_origine: agence
});
const collecte: CollecteDuJour = {
	date: '2026-11-17',
	creneau: '17h',
	collecte_le: '2026-11-17T16:00:00.000Z',
	exemple: false,
	articles: [art('1', 'a', 'afp'), art('2', 'b', 'afp'), art('3', 'c')],
	groupes: []
};
const edition = (faits: Edition['sujets'][0]['faits']): Edition => ({
	date: '2026-11-17',
	numero: 2,
	genere_le: '2026-11-17T17:00:00.000Z',
	modele: 'm',
	mode: 'normal',
	exemple: false,
	rubriques_actives: ['defense'],
	sujets: [
		{
			id: 's',
			rubrique: 'defense',
			etiquettes: [],
			titre: 't',
			resume_court: 'r',
			synthese: 's',
			faits,
			angles: [],
			divergences: [],
			sources: ['https://x.fr/1'],
			importance: 50
		}
	]
});

describe('verifierEdition', () => {
	it('accepte un fait confirmé par deux sources indépendantes', () => {
		const e = edition([
			{ texte: 'f', niveau: 'confirme', sources: ['https://x.fr/1', 'https://x.fr/3'] }
		]);
		expect(verifierEdition(e, [collecte])).toEqual([]);
	});
	it('refuse « confirmé » quand deux médias reprennent la même dépêche AFP', () => {
		const e = edition([
			{ texte: 'f', niveau: 'confirme', sources: ['https://x.fr/1', 'https://x.fr/2'] }
		]);
		expect(verifierEdition(e, [collecte])[0]).toMatch(/moins de 2 sources indépendantes/);
	});
	it('refuse une URL inventée, sauf pour un document officiel', () => {
		const inventee = ['https://inventee.fr/a'];
		expect(
			verifierEdition(edition([{ texte: 'f', niveau: 'source_unique', sources: inventee }]), [
				collecte
			])[0]
		).toMatch(/absente de la collecte/);
		expect(
			verifierEdition(edition([{ texte: 'f', niveau: 'officiel', sources: inventee }]), [collecte])
		).toEqual([]);
	});
	it('limite le nombre de sujets d’une rubrique', () => {
		const e = edition([{ texte: 'f', niveau: 'officiel', sources: ['https://x.fr/1'] }]);
		expect(verifierEdition(e, [collecte], { defense: 0 })[0]).toMatch(/maximum 0/);
	});
});
