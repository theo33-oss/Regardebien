import { describe, expect, it } from 'vitest';
import type { ArticleBrut } from '../src/lib/schema/index.js';
import { creneauDe, dateParis, grouper, nettoyer, parseFlux, rubriqueDe } from './collecte-lib.js';

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel>
<item><title>Un lanceur &amp; son vol</title><link>https://a.fr/1</link>
<pubDate>Tue, 17 Nov 2026 09:12:00 +0100</pubDate><description><![CDATA[<p>Texte <b>riche</b></p>]]></description></item>
<item><title>Sans date</title><link>https://a.fr/2</link></item>
</channel></rss>`;

const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Entrée</title>
<link rel="alternate" href="https://b.fr/1"/><updated>2026-11-17T10:00:00Z</updated><summary>Résumé</summary></entry></feed>`;

describe('parseFlux', () => {
	it('lit RSS, nettoie le HTML, ignore les entrées sans date', () => {
		const r = parseFlux(RSS);
		expect(r).toHaveLength(1);
		expect(r[0]).toMatchObject({
			titre: 'Un lanceur & son vol',
			url: 'https://a.fr/1',
			publie_le: '2026-11-17T08:12:00.000Z',
			resume: 'Texte riche'
		});
	});
	it('lit Atom', () => {
		expect(parseFlux(ATOM)[0]).toMatchObject({ titre: 'Entrée', url: 'https://b.fr/1' });
	});
});

describe('nettoyer', () => {
	it('tronque', () => expect(nettoyer('a'.repeat(50), 10)).toHaveLength(10));
});

describe('rubriqueDe', () => {
	const mc = { defense: ['armée', 'rafale'], ia: ['intelligence artificielle'] };
	it('une seule rubrique : celle-ci', () =>
		expect(rubriqueDe(['culture'], 'x', '', mc)).toBe('culture'));
	it('plusieurs : mots-clés, accents ignorés', () => {
		expect(rubriqueDe(['defense', 'ia'], 'Export de Rafale', '', mc)).toBe('defense');
		expect(rubriqueDe(['defense', 'ia'], 'Météo', '', mc)).toBeNull();
	});
});

const art = (id: string, source_id: string, titre: string): ArticleBrut => ({
	id,
	source_id,
	media: source_id,
	titre,
	url: `https://x.fr/${id}`,
	publie_le: '2026-11-17T08:00:00.000Z',
	resume: '',
	langue: 'fr',
	rubrique_suggeree: 'defense',
	agence_origine: null
});

describe('grouper', () => {
	it('réunit les titres proches de sources différentes', () => {
		const g = grouper([
			art('1', 'a', 'Export de Rafale vers la Serbie : le contrat signé'),
			art('2', 'b', 'Rafale : la Serbie signe un contrat d’export'),
			art('3', 'c', 'Budget des armées : débat à l’Assemblée')
		]);
		expect(g).toHaveLength(2);
		expect(g[0].article_ids).toEqual(['1', '2']);
	});
});

describe('heure de Paris', () => {
	it('gère l’heure d’été et d’hiver', () => {
		expect(dateParis(new Date('2026-07-01T15:00:00Z'))).toEqual({ date: '2026-07-01', heure: 17 });
		expect(dateParis(new Date('2026-11-17T16:00:00Z'))).toEqual({ date: '2026-11-17', heure: 17 });
		expect(creneauDe(17)).toBe('17h');
		expect(creneauDe(9)).toBeNull();
	});
});
