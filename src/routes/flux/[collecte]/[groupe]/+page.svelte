<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { chargerCollecte, chargerEnsemble } from '#lib/donnees.js';
	import { dateLongue, heureParis, nomRubrique, sourcesIndependantes } from '#lib/lecture.js';
	import type { ArticleBrut, CollecteDuJour } from '#lib/schema/index.js';
	import { onMount } from 'svelte';

	let contexte = $state<{
		collecte: CollecteDuJour;
		titre: string;
		rubrique: string;
		articles: ArticleBrut[];
	} | null>(null);
	let erreur = $state<string | null>(null);

	onMount(async () => {
		try {
			const { index, rubriques } = await chargerEnsemble();
			const entree = index.collectes.find((c) => c.fichier === `raw/${page.params.collecte}.json`);
			const collecte = entree ? await chargerCollecte(entree.fichier) : null;
			const groupe = collecte?.groupes[Number(page.params.groupe)];
			if (!collecte || !groupe) {
				erreur = 'Ce sujet est introuvable : la collecte a peut-être été remplacée.';
				return;
			}
			const parId = new Map(collecte.articles.map((a) => [a.id, a]));
			const articles = groupe.article_ids
				.flatMap((id) => parId.get(id) ?? [])
				.sort((a, b) => a.publie_le.localeCompare(b.publie_le));
			contexte = {
				collecte,
				titre: groupe.titre,
				rubrique: nomRubrique(rubriques, groupe.rubrique),
				articles
			};
		} catch {
			erreur = 'Les données n’ont pas pu être chargées.';
		}
	});

	const medias = $derived(contexte ? new Set(contexte.articles.map((a) => a.media)).size : 0);
	const independantes = $derived(
		contexte ? new Set(contexte.articles.map((a) => a.agence_origine ?? a.source_id)).size : 0
	);
	const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;
</script>

<svelte:head>
	<title>{contexte?.titre ?? 'Sujet'} · Cartouche</title>
</svelte:head>

<a class="retour" href={resolve('/')}>← Flux</a>

{#if erreur}
	<p>{erreur}</p>
{:else if !contexte}
	<p class="etiquette">Chargement…</p>
{:else}
	<article>
		<p class="etiquette">{contexte.rubrique}</p>
		<h1>{contexte.titre}</h1>
		<p class="bilan">
			{pluriel(contexte.articles.length, 'article')} · {pluriel(medias, 'média')} ·
			{sourcesIndependantes(independantes)}
		</p>
		{#if independantes < medias}
			<p class="note">
				Plusieurs médias reprennent la même dépêche d'agence : elle ne compte que pour une source.
			</p>
		{/if}
		<p class="note">
			Collecte de {contexte.collecte.creneau.replace('h', ' h')}, {dateLongue(
				contexte.collecte.date
			)}.
		</p>

		<ul class="articles">
			{#each contexte.articles as a (a.id)}
				<li>
					<p class="source">
						<strong>{a.media}</strong>
						· {heureParis(a.publie_le)}
						{#if a.agence_origine}
							· <span class="agence">Dépêche {a.agence_origine.toUpperCase()}</span>
						{/if}
						{#if a.langue !== 'fr'}
							· <span class="agence">Article en {a.langue === 'en' ? 'anglais' : a.langue}</span>
						{/if}
					</p>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<h2><a href={a.url} target="_blank" rel="noopener noreferrer">{a.titre}</a></h2>
					{#if a.resume}
						<p class="resume">{a.resume}</p>
					{/if}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a class="lire" href={a.url} target="_blank" rel="noopener noreferrer">
						Lire sur {a.media} →
					</a>
				</li>
			{/each}
		</ul>
	</article>
{/if}

<style>
	.retour {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
	}
	article > .etiquette {
		margin: 0 0 0.25rem;
	}
	.bilan {
		margin: 0 0 0.25rem;
		font-weight: 600;
	}
	.note {
		margin: 0 0 0.25rem;
		font-size: 0.85rem;
		color: var(--texte-doux);
	}
	.articles {
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
	}
	.articles > li {
		padding: 1rem 0;
		border-top: 1px solid var(--filet);
	}
	.source {
		margin: 0 0 0.2rem;
		font-size: 0.85rem;
		color: var(--texte-doux);
	}
	.source strong {
		color: var(--texte);
	}
	.agence {
		font-weight: 600;
	}
	h2 {
		margin: 0 0 0.3rem;
		font-size: 1.1rem;
	}
	h2 a {
		color: var(--texte);
		text-decoration: none;
	}
	h2 a:hover {
		text-decoration: underline;
	}
	.resume {
		margin: 0 0 0.2rem;
		color: var(--texte-doux);
	}
	.lire {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
	}
</style>
