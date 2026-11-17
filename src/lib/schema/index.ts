import { z } from 'zod';

export const RUBRIQUES = [
	'aero-spatial',
	'defense',
	'culture',
	'technique',
	'ia',
	'politique'
] as const;
export const Rubrique = z.enum(RUBRIQUES);
export type Rubrique = z.infer<typeof Rubrique>;

/** Niveau de confirmation d'un fait. */
export const Niveau = z.enum(['confirme', 'source_unique', 'conteste', 'officiel']);
export type Niveau = z.infer<typeof Niveau>;

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date AAAA-MM-JJ attendue');
const IsoDateTime = z.iso.datetime({ offset: true });
const Url = z.url();
const Creneau = z.enum(['07h', '12h', '17h']);
const Agence = z.enum(['afp', 'reuters', 'ap']);

export const Source = z.object({
	id: z.string().min(1),
	nom: z.string().min(1),
	url_flux: Url,
	type: z.enum(['media_fr', 'agence', 'presse_etrangere', 'specialisee']),
	sensibilite: z.enum([
		'gauche',
		'centre-gauche',
		'centre',
		'centre-droit',
		'droite',
		'non_applicable'
	]),
	langue: z.string().min(2),
	rubriques: z.array(Rubrique).min(1),
	/** Agence dont le média reprend surtout les dépêches (pour compter une seule source). */
	agence_origine: Agence.nullable().default(null)
});
export type Source = z.infer<typeof Source>;

export const ArticleBrut = z.object({
	id: z.string().min(1),
	source_id: z.string().min(1),
	media: z.string().min(1),
	titre: z.string().min(1),
	url: Url,
	publie_le: IsoDateTime,
	resume: z.string().default(''),
	langue: z.string().min(2),
	rubrique_suggeree: Rubrique.nullable().default(null),
	agence_origine: Agence.nullable().default(null)
});
export type ArticleBrut = z.infer<typeof ArticleBrut>;

/** Articles du mode Flux regroupés par rubrique et par sujet. */
export const GroupeArticles = z.object({
	rubrique: Rubrique,
	titre: z.string().min(1),
	article_ids: z.array(z.string()).min(1)
});
export type GroupeArticles = z.infer<typeof GroupeArticles>;

export const CollecteDuJour = z.object({
	date: IsoDate,
	creneau: Creneau,
	collecte_le: IsoDateTime,
	exemple: z.boolean().default(false),
	articles: z.array(ArticleBrut),
	groupes: z.array(GroupeArticles).default([])
});
export type CollecteDuJour = z.infer<typeof CollecteDuJour>;

export const Fait = z.object({
	texte: z.string().min(1),
	niveau: Niveau,
	/** URL des sources qui appuient ce fait. */
	sources: z.array(Url).min(1)
});
export type Fait = z.infer<typeof Fait>;

export const Angle = z.object({
	/** Média ou groupe de médias concerné. */
	medias: z.array(z.string().min(1)).min(1),
	texte: z.string().min(1),
	sources: z.array(Url).min(1)
});
export type Angle = z.infer<typeof Angle>;

export const Sujet = z.object({
	id: z.string().min(1),
	rubrique: Rubrique,
	etiquettes: z.array(Rubrique).default([]),
	titre: z.string().min(1),
	/** Niveau 1 : titre + 2 lignes. */
	resume_court: z.string().min(1),
	/** Niveau 2 : synthèse neutre. */
	synthese: z.string().min(1),
	faits: z.array(Fait).min(1),
	/** Niveau 3 : angles et divergences. */
	angles: z.array(Angle).default([]),
	divergences: z.array(z.string()).default([]),
	sources: z.array(Url).min(1),
	importance: z.number().int().min(0).max(100)
});
export type Sujet = z.infer<typeof Sujet>;

export const Edition = z.object({
	date: IsoDate,
	numero: z.number().int().positive(),
	genere_le: IsoDateTime,
	modele: z.string().min(1),
	mode: z.enum(['normal', 'degrade']),
	exemple: z.boolean().default(false),
	rubriques_actives: z.array(Rubrique).min(1),
	sujets: z.array(Sujet).min(1)
});
export type Edition = z.infer<typeof Edition>;

export const Index = z.object({
	genere_le: IsoDateTime,
	editions: z.array(
		z.object({
			date: IsoDate,
			numero: z.number().int().positive(),
			fichier: z.string().min(1),
			mode: z.enum(['normal', 'degrade']),
			titres: z.array(z.string()).max(3)
		})
	),
	collectes: z.array(z.object({ date: IsoDate, creneau: Creneau, fichier: z.string().min(1) }))
});
export type Index = z.infer<typeof Index>;
