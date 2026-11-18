import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { ArticleBrut, CollecteDuJour } from '../src/lib/schema/index.js';
import {
	creneauDe,
	dateParis,
	grouper,
	idArticle,
	parseFlux,
	rubriqueDe,
	type Creneau,
	type MotsCles
} from './collecte-lib.js';
import { DATA, loadSources } from './lib.js';

// Usage : npm run collect [-- --creneau 07h|12h|17h] [-- --auto]
//   sans option : créneau de l'heure de Paris (7-11 h : 07h, 12-16 h : 12h, 17-23 h : 17h ; avant 7 h : 07h)
//   --creneau   : force le créneau
//   --auto      : tâche planifiée. Ne fait rien avant 7 h ni si le créneau est déjà collecté
//                 (GitHub lance la tâche à deux heures UTC pour couvrir l'heure d'été, parfois en retard)
const args = process.argv.slice(2);
const val = (nom: string) => args[args.indexOf(nom) + 1];

const maintenant = new Date();
const paris = dateParis(maintenant);
let creneau: Creneau | null;
const auto = args.includes('--auto');
if (args.includes('--creneau')) creneau = val('--creneau') as Creneau;
else if (auto) creneau = creneauDe(paris.heure);
else creneau = creneauDe(paris.heure) ?? '07h';
if (!creneau || !['07h', '12h', '17h'].includes(creneau)) {
	console.log(`Heure de Paris : ${paris.heure}h, pas de collecte prévue. Rien à faire.`);
	process.exit(0);
}
if (auto && existsSync(`${DATA}/raw/${paris.date}-${creneau}.json`)) {
	console.log(`Créneau ${creneau} du ${paris.date} déjà collecté. Rien à faire.`);
	process.exit(0);
}

const rubriques = parse(readFileSync('config/rubriques.yaml', 'utf8')) as {
	id: string;
	mots_cles?: string[];
}[];
const motsCles: MotsCles = Object.fromEntries(rubriques.map((r) => [r.id, r.mots_cles ?? []]));

const FENETRE_MS = 24 * 3600 * 1000;
const sources = loadSources();

async function telecharger(url: string): Promise<string> {
	let derniere: unknown;
	for (let essai = 0; essai < 2; essai++) {
		try {
			const r = await fetch(url, {
				headers: {
					// Certains sites refusent les robots sans « Mozilla » : on reste identifiable.
					'User-Agent': 'Mozilla/5.0 (compatible; CartoucheRSS/1.0; lecteur RSS personnel)',
					Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
				},
				signal: AbortSignal.timeout(20_000),
				redirect: 'follow'
			});
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			return await r.text();
		} catch (e) {
			derniere = e;
		}
	}
	throw derniere;
}

const resultats = await Promise.all(
	sources.map(async (s) => {
		try {
			const items = parseFlux(await telecharger(s.url_flux));
			const recents = items.filter(
				(i) => maintenant.getTime() - Date.parse(i.publie_le) <= FENETRE_MS
			);
			const articles = recents.flatMap((i): ArticleBrut[] => {
				const rubrique = rubriqueDe(s.rubriques, i.titre, i.resume, motsCles);
				if (!rubrique) return [];
				return [
					{
						id: idArticle(s.id, i.url),
						source_id: s.id,
						media: s.nom,
						titre: i.titre,
						url: i.url,
						publie_le: i.publie_le,
						resume: i.resume,
						langue: s.langue,
						rubrique_suggeree: rubrique,
						agence_origine: s.agence_origine
					}
				];
			});
			return { source: s.id, lus: items.length, gardes: articles.length, articles, erreur: null };
		} catch (e) {
			return { source: s.id, lus: 0, gardes: 0, articles: [] as ArticleBrut[], erreur: String(e) };
		}
	})
);

for (const r of resultats) {
	console.log(
		r.erreur ? `ECHEC ${r.source} : ${r.erreur}` : `ok    ${r.source} : ${r.gardes}/${r.lus} gardés`
	);
}

// Un même lien repris par deux sources ne compte qu'une fois.
const vus = new Set<string>();
const articles = resultats
	.flatMap((r) => r.articles)
	.filter((a) => (vus.has(a.url) ? false : (vus.add(a.url), true)))
	.sort((a, b) => b.publie_le.localeCompare(a.publie_le));

const echecs = resultats.filter((r) => r.erreur).length;
if (!articles.length) {
	console.error('Aucun article collecté : rien d’écrit.');
	process.exit(1);
}

const collecte = CollecteDuJour.parse({
	date: paris.date,
	creneau,
	collecte_le: maintenant.toISOString(),
	exemple: false,
	articles,
	groupes: grouper(articles)
});
mkdirSync(`${DATA}/raw`, { recursive: true });
const fichier = `${DATA}/raw/${paris.date}-${creneau}.json`;
writeFileSync(fichier, JSON.stringify(collecte, null, '\t') + '\n');
console.log(
	`${fichier} : ${articles.length} articles, ${collecte.groupes.length} sujets, ${echecs} source(s) en échec sur ${sources.length}`
);
