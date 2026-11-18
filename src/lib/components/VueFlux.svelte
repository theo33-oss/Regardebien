<script lang="ts">
	import { dateLongue, heureParis, parRubrique, rubriquesVisibles } from '#lib/lecture.js';
	import type { RubriqueConfig, Saison } from '#lib/lecture.js';
	import { prefs } from '#lib/prefs.svelte.js';
	import type { ArticleBrut, CollecteDuJour } from '#lib/schema/index.js';
	import Cote from './Cote.svelte';

	let {
		collecte,
		rubriques,
		saisons
	}: { collecte: CollecteDuJour; rubriques: RubriqueConfig[]; saisons: Saison[] } = $props();

	const articles = $derived(new Map<string, ArticleBrut>(collecte.articles.map((a) => [a.id, a])));
	const visibles = $derived(
		rubriquesVisibles(rubriques, saisons, collecte.date, prefs.valeurs.politique)
	);
	// Sujets repris par le plus de médias d'abord. Plusieurs reprises d'une même agence ne comptent que pour une source.
	const groupes = $derived(
		parRubrique(
			collecte.groupes
				.filter((g) => visibles.includes(g.rubrique))
				.map((g) => {
					const liste = g.article_ids.flatMap((id) => articles.get(id) ?? []);
					const independants = new Set(liste.map((a) => a.agence_origine ?? a.source_id)).size;
					return { ...g, liste, independants };
				})
				.filter((g) => g.liste.length > 0)
				.sort((a, b) => b.independants - a.independants),
			rubriques
		)
	);
	const MAX = 8;
</script>

<header class="entete">
	<p class="etiquette">
		Flux · collecte de {collecte.creneau.replace('h', ' h')} · {dateLongue(collecte.date)}
	</p>
	<p class="etiquette">
		{collecte.articles.length} articles · mis à jour à {heureParis(collecte.collecte_le)}
	</p>
</header>
<Cote valeur="Sans IA : articles regroupés par sujet" />

{#snippet sujet(g: { titre: string; liste: ArticleBrut[] })}
	<li>
		<h3>{g.titre}</h3>
		<ul class="medias">
			{#each g.liste as a (a.id)}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={a.url} target="_blank" rel="noopener noreferrer">{a.media}</a>
					<span class="etiquette">{heureParis(a.publie_le)}</span>
				</li>
			{/each}
		</ul>
	</li>
{/snippet}

{#each groupes as groupe (groupe.rubrique.id)}
	<section aria-labelledby={`f-${groupe.rubrique.id}`}>
		<h2 id={`f-${groupe.rubrique.id}`} class="rubrique">{groupe.rubrique.nom}</h2>
		<ul class="sujets">
			{#each groupe.elements.slice(0, groupe.rubrique.max_sujets ?? MAX) as g, i (g.titre + i)}
				{@render sujet(g)}
			{/each}
		</ul>
		<!-- Rubrique plafonnée (Culture : les grands sujets seulement) : pas de suite. -->
		{#if !groupe.rubrique.max_sujets && groupe.elements.length > MAX}
			<details>
				<summary>Voir {groupe.elements.length - MAX} autres sujets</summary>
				<ul class="sujets">
					{#each groupe.elements.slice(MAX) as g, i (g.titre + i)}
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
		background: var(--papier);
		padding: 0.5rem 0.75rem;
		border: 2px solid var(--trait);
	}
	.entete p {
		margin: 0;
	}
	.rubrique {
		display: inline-block;
		margin: 0 0 0.6rem;
		padding: 0.1rem 0.5rem;
		background: var(--papier);
		font-family: var(--police-technique);
		font-size: 0.9rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		border-bottom: 2px solid var(--trait);
	}
	.sujets,
	.medias {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.sujets {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.sujets > li {
		padding: 0.75rem;
		background: var(--papier);
		border: 1px solid var(--trait);
	}
	h3 {
		font-size: 1rem;
		margin-bottom: 0.3rem;
	}
	.medias li {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.medias a {
		padding: 0.4rem 0;
		min-height: 36px;
	}
	details {
		margin-top: 0.75rem;
	}
	summary {
		min-height: 44px;
		display: flex;
		align-items: center;
		font-family: var(--police-technique);
		font-size: 0.85rem;
		cursor: pointer;
	}
</style>
