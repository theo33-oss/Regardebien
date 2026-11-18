import type { CollecteDuJour, Edition } from '../src/lib/schema/index.js';

/**
 * Règles de fond du cahier des charges, que le schéma zod ne peut pas exprimer.
 * Retourne la liste des problèmes (vide si l'édition est conforme).
 */
export function verifierEdition(
	edition: Edition,
	collectes: CollecteDuJour[],
	maxSujetsParRubrique: Record<string, number> = {}
): string[] {
	const problemes: string[] = [];
	// URL -> identité de la source. Une dépêche reprise par plusieurs médias compte pour une seule.
	const origine = new Map<string, string>();
	for (const c of collectes)
		for (const a of c.articles) origine.set(a.url, a.agence_origine ?? a.source_id);

	const ids = new Set<string>();
	const parRubrique: Record<string, number> = {};
	for (const s of edition.sujets) {
		const ou = `sujet « ${s.id} »`;
		if (ids.has(s.id)) problemes.push(`${ou} : identifiant en double`);
		ids.add(s.id);
		parRubrique[s.rubrique] = (parRubrique[s.rubrique] ?? 0) + 1;
		if (!edition.rubriques_actives.includes(s.rubrique))
			problemes.push(`${ou} : rubrique « ${s.rubrique} » absente de rubriques_actives`);
		if (s.etiquettes.includes(s.rubrique))
			problemes.push(`${ou} : la rubrique principale ne doit pas être aussi une étiquette`);

		const inconnues = (urls: string[]) => urls.filter((u) => !origine.has(u));
		for (const f of s.faits) {
			const independantes = new Set(f.sources.map((u) => origine.get(u) ?? u)).size;
			if (f.niveau === 'confirme' && independantes < 2)
				problemes.push(
					`${ou} : fait « confirme » avec moins de 2 sources indépendantes (${f.texte.slice(0, 50)}…)`
				);
			if (f.niveau === 'source_unique' && independantes > 1)
				problemes.push(
					`${ou} : fait « source_unique » avec ${independantes} sources indépendantes, à passer en « confirme »`
				);
			// Seul un document primaire (officiel) peut citer une URL hors collecte.
			if (f.niveau !== 'officiel' && inconnues(f.sources).length)
				problemes.push(`${ou} : URL absente de la collecte du jour : ${inconnues(f.sources)[0]}`);
		}
		for (const a of s.angles)
			if (inconnues(a.sources).length)
				problemes.push(
					`${ou} : angle avec une URL absente de la collecte : ${inconnues(a.sources)[0]}`
				);
	}
	for (const [r, max] of Object.entries(maxSujetsParRubrique))
		if ((parRubrique[r] ?? 0) > max)
			problemes.push(`rubrique « ${r} » : ${parRubrique[r]} sujets, maximum ${max}`);
	return problemes;
}
