<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		dateLongue,
		heureParis,
		parRubrique,
		rubriquesVisibles,
		sourcesIndependantes
	} from '#lib/lecture.js';
	import type { RubriqueConfig, Saison } from '#lib/lecture.js';
	import { prefs } from '#lib/prefs.svelte.js';
	import type { ArticleBrut, CollecteDuJour } from '#lib/schema/index.js';

	let {
		collecte,
		rubriques,
		saisons
	}: { collecte: CollecteDuJour; rubriques: RubriqueConfig[]; saisons: Saison[] } = $props();

	const articles = $derived(new Map<string, ArticleBrut>(collecte.articles.map((a) => [a.id, a])));
	const visibles = $derived(
		rubriquesVisibles(rubriques, saisons, collecte.date, prefs.valeurs.politique)
	);
	const idCollecte = $derived(`${collecte.date}-${collecte.creneau}`);

	// Sujets repris par le plus de sources indépendantes d'abord. Plusieurs reprises d'une même
	// dépêche d'agence ne comptent que pour une source.
	const groupes = $derived(
		parRubrique(
			collecte.groupes
				.map((g, index) => {
					const liste = g.article_ids.flatMap((id) => articles.get(id) ?? []);
					const medias = [...new Set(liste.map((a) => a.media))];
					const independants = new Set(liste.map((a) => a.agence_origine ?? a.source_id)).size;
					return { ...g, index, liste, medias, independants };
				})
				.filter((g) => visibles.includes(g.rubrique) && g.liste.length > 0)
				.sort((a, b) => b.independants - a.independants),
			rubriques
		)
	);
	const MAX = 8;

	const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;
</script>

{#snippet sujet(g: (typeof groupes)[number]['elements'][number])}
	<li>
		<h3>
			<a
				href={resolve('/flux/[collecte]/[groupe]', {
					collecte: idCollecte,
					groupe: String(g.index)
				})}
			>
				{g.titre}
			</a>
		</h3>
		<p class="infos">
			{pluriel(g.medias.length, 'média')}{#if g.independants < g.medias.length}
				· {sourcesIndependantes(g.independants)}{/if}
		</p>
		<p class="medias">{g.medias.join(' · ')}</p>
	</li>
{/snippet}

<header class="entete">
	<p class="etiquette">Flux · collecte de {collecte.creneau.replace('h', ' h')}</p>
	<p class="date">{dateLongue(collecte.date)}</p>
	<p class="meta">
		{pluriel(collecte.articles.length, 'article')} · mis à jour à {heureParis(collecte.collecte_le)}
		· sans IA
	</p>
</header>

{#each groupes as groupe (groupe.rubrique.id)}
	<section aria-labelledby={`f-${groupe.rubrique.id}`}>
		<h2 id={`f-${groupe.rubrique.id}`} class="rubrique">{groupe.rubrique.nom}</h2>
		<ul class="sujets">
			{#each groupe.elements.slice(0, groupe.rubrique.max_sujets ?? MAX) as g (g.index)}
				{@render sujet(g)}
			{/each}
		</ul>
		<!-- Rubrique plafonnée (Culture : les grands sujets seulement) : pas de suite. -->
		{#if !groupe.rubrique.max_sujets && groupe.elements.length > MAX}
			<details>
				<summary>Voir {groupe.elements.length - MAX} autres sujets</summary>
				<ul class="sujets">
					{#each groupe.elements.slice(MAX) as g (g.index)}
						{@render sujet(g)}
					{/each}
				</ul>
			</details>
		{/if}
	</section>
{:else}
	<p>Aucun article pour ces réglages.</p>
{/each}

<style>
	.entete {
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--filet);
	}
	.entete p {
		margin: 0;
	}
	.date {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
	}
	.meta {
		font-size: 0.9rem;
		color: var(--texte-doux);
	}
	section {
		margin-top: 0.75rem;
	}
	.rubrique {
		margin: 0;
		padding-top: 0.4rem;
		border-top: 3px solid var(--texte);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.sujets {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.sujets > li {
		padding: 0.9rem 0;
		border-bottom: 1px solid var(--filet);
	}
	h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
	}
	h3 a {
		color: var(--texte);
		text-decoration: none;
	}
	h3 a:hover {
		text-decoration: underline;
	}
	p {
		margin: 0;
	}
	.infos {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--texte-doux);
	}
	.medias {
		font-size: 0.85rem;
		color: var(--texte-doux);
	}
	details {
		margin-top: 0.25rem;
	}
	summary {
		min-height: 44px;
		display: flex;
		align-items: center;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
	}
</style>
