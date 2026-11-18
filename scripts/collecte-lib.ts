import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import type { ArticleBrut, GroupeArticles, Rubrique } from '../src/lib/schema/index.js';

export type ItemFlux = { titre: string; url: string; publie_le: string; resume: string };
export type MotsCles = Record<string, string[]>;

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	processEntities: true,
	htmlEntities: true
});

const liste = <T>(x: T | T[] | undefined): T[] =>
	x === undefined ? [] : Array.isArray(x) ? x : [x];

/** Texte d'un nœud XML (chaîne, nombre ou objet avec attributs). */
function texte(n: unknown): string {
	if (n === undefined || n === null) return '';
	if (typeof n === 'string' || typeof n === 'number') return String(n);
	if (typeof n === 'object' && '#text' in n) return String((n as Record<string, unknown>)['#text']);
	return '';
}

export function nettoyer(html: string, max = 400): string {
	const brut = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return brut.length > max ? brut.slice(0, max - 1).trimEnd() + '…' : brut;
}

function lienAtom(link: unknown): string {
	const liens = liste(link) as (Record<string, string> | string)[];
	for (const l of liens) {
		if (typeof l === 'string') return l;
		if (!l['@_rel'] || l['@_rel'] === 'alternate') return l['@_href'] ?? '';
	}
	return '';
}

/** Lit un flux RSS 2.0 ou Atom. Ignore les entrées sans titre, lien ou date valide. */
export function parseFlux(xml: string): ItemFlux[] {
	const doc = parser.parse(xml);
	const brut: { titre: string; url: string; date: string; resume: string }[] = [];
	for (const it of liste(doc?.rss?.channel?.item)) {
		brut.push({
			titre: texte(it.title),
			url: texte(it.link) || texte(it.guid),
			date: texte(it.pubDate) || texte(it['dc:date']),
			resume: texte(it.description) || texte(it['content:encoded'])
		});
	}
	for (const e of liste(doc?.feed?.entry)) {
		brut.push({
			titre: texte(e.title),
			url: lienAtom(e.link),
			date: texte(e.published) || texte(e.updated),
			resume: texte(e.summary) || texte(e.content)
		});
	}
	const items: ItemFlux[] = [];
	for (const b of brut) {
		const titre = nettoyer(b.titre, 300);
		const d = new Date(b.date.trim());
		if (!titre || !/^https?:\/\//.test(b.url.trim()) || Number.isNaN(d.getTime())) continue;
		items.push({
			titre,
			url: b.url.trim(),
			publie_le: d.toISOString(),
			resume: nettoyer(b.resume)
		});
	}
	return items;
}

export function normaliserTexte(s: string): string {
	return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Rubrique d'un article. Source à une seule rubrique : celle-ci. Sinon, mots-clés ; null si aucun. */
export function rubriqueDe(
	rubriquesSource: Rubrique[],
	titre: string,
	resume: string,
	motsCles: MotsCles
): Rubrique | null {
	if (rubriquesSource.length === 1) return rubriquesSource[0];
	const t = normaliserTexte(`${titre} ${resume}`);
	let meilleure: Rubrique | null = null;
	let max = 0;
	for (const r of rubriquesSource) {
		const n = (motsCles[r] ?? []).filter((m) => t.includes(normaliserTexte(m))).length;
		if (n > max) {
			max = n;
			meilleure = r;
		}
	}
	return meilleure;
}

export function idArticle(sourceId: string, url: string): string {
	return `${sourceId}-${createHash('sha1').update(url).digest('hex').slice(0, 8)}`;
}

const MOTS_VIDES = new Set(
	'dans pour avec sans sous plus mais cette ces une des les aux par sur apres avant vers entre contre tout tous leur leurs elle elles ils nous vous aussi comme fait faire selon encore depuis alors the and for with from that this have after into over says'.split(
		' '
	)
);

function jetons(titre: string): Set<string> {
	return new Set(
		normaliserTexte(titre)
			.split(/[^a-z0-9]+/)
			.filter((m) => m.length >= 4 && !MOTS_VIDES.has(m))
	);
}

/** Regroupe par rubrique les articles aux titres proches (au moins 2 mots significatifs communs, et la moitié du plus court titre). */
export function grouper(articles: ArticleBrut[]): GroupeArticles[] {
	const groupes: GroupeArticles[] = [];
	const parRubrique = new Map<Rubrique, ArticleBrut[]>();
	for (const a of articles) {
		if (!a.rubrique_suggeree) continue;
		parRubrique.set(a.rubrique_suggeree, [...(parRubrique.get(a.rubrique_suggeree) ?? []), a]);
	}
	for (const [rubrique, liste] of parRubrique) {
		const j = liste.map((a) => jetons(a.titre));
		const parent = liste.map((_, i) => i);
		const racine = (i: number): number => (parent[i] === i ? i : (parent[i] = racine(parent[i])));
		for (let i = 0; i < liste.length; i++) {
			for (let k = i + 1; k < liste.length; k++) {
				if (liste[i].source_id === liste[k].source_id) continue;
				const commun = [...j[i]].filter((m) => j[k].has(m)).length;
				if (commun >= 2 && commun >= Math.min(j[i].size, j[k].size) / 2) {
					parent[racine(k)] = racine(i);
				}
			}
		}
		const paquets = new Map<number, ArticleBrut[]>();
		liste.forEach((a, i) => paquets.set(racine(i), [...(paquets.get(racine(i)) ?? []), a]));
		for (const p of paquets.values()) {
			p.sort((a, b) => a.publie_le.localeCompare(b.publie_le));
			groupes.push({ rubrique, titre: p[0].titre, article_ids: p.map((a) => a.id) });
		}
	}
	return groupes.sort((a, b) => b.article_ids.length - a.article_ids.length);
}

/** Date (AAAA-MM-JJ) et heure à Paris. */
export function dateParis(d: Date): { date: string; heure: number } {
	const p = Object.fromEntries(
		new Intl.DateTimeFormat('en-CA', {
			timeZone: 'Europe/Paris',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			hourCycle: 'h23'
		})
			.formatToParts(d)
			.map((x) => [x.type, x.value])
	);
	return { date: `${p.year}-${p.month}-${p.day}`, heure: Number(p.hour) };
}

export type Creneau = '07h' | '12h' | '17h';

/** Créneau correspondant à l'heure de Paris, ou null hors des heures de collecte. */
export function creneauDe(heure: number): Creneau | null {
	return heure === 7 ? '07h' : heure === 12 ? '12h' : heure === 17 ? '17h' : null;
}
