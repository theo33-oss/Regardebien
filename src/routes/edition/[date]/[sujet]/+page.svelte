<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Faits from '#lib/components/Faits.svelte';
	import Sources from '#lib/components/Sources.svelte';
	import { chargerEdition, chargerEnsemble } from '#lib/donnees.js';
	import { dateLongue, nomRubrique } from '#lib/lecture.js';
	import type { Sujet } from '#lib/schema/index.js';
	import { onMount } from 'svelte';

	let sujet = $state<Sujet | null>(null);
	/** Rubrique principale puis étiquettes, par leur nom. */
	let noms = $state<string[]>([]);
	let erreur = $state<string | null>(null);

	onMount(async () => {
		try {
			const { index, rubriques: config } = await chargerEnsemble();
			const entree = index.editions.find((e) => e.date === page.params.date);
			const edition = entree ? await chargerEdition(entree.fichier) : null;
			const trouve = edition?.sujets.find((s) => s.id === page.params.sujet);
			if (!trouve) erreur = 'Ce sujet est introuvable.';
			else {
				sujet = trouve;
				noms = [trouve.rubrique, ...trouve.etiquettes].map((id) => nomRubrique(config, id));
			}
		} catch {
			erreur = 'Les données n’ont pas pu être chargées.';
		}
	});
</script>

<svelte:head>
	<title>{sujet?.titre ?? 'Sujet'} · Cartouche</title>
</svelte:head>

<a class="retour" href={resolve('/edition/[date]', { date: page.params.date ?? '' })}
	>← Édition du {dateLongue(page.params.date ?? '')}</a
>

{#if erreur}
	<p>{erreur}</p>
{:else if !sujet}
	<p class="etiquette">Chargement…</p>
{:else}
	<article>
		<p class="etiquette">{noms.join(' · ')}</p>
		<h1>{sujet.titre}</h1>
		<p class="court">{sujet.resume_court}</p>

		<h2 class="etiquette">Synthèse</h2>
		<p>{sujet.synthese}</p>

		<h2 class="etiquette">Faits clés</h2>
		<Faits faits={sujet.faits} />

		{#if sujet.angles.length}
			<h2 class="etiquette">Angles des médias</h2>
			<ul class="angles">
				{#each sujet.angles as a, i (i)}
					<li>
						<strong>{a.medias.join(', ')}</strong>
						<p>{a.texte}</p>
						<Sources urls={a.sources} />
					</li>
				{/each}
			</ul>
		{/if}

		{#if sujet.divergences.length}
			<h2 class="etiquette">Divergences</h2>
			<ul class="divergences">
				{#each sujet.divergences as d, i (i)}
					<li>{d}</li>
				{/each}
			</ul>
		{/if}

		<h2 class="etiquette">Toutes les sources</h2>
		<Sources urls={sujet.sources} />
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
	article > .etiquette:first-child {
		margin: 0 0 0.25rem;
	}
	h2.etiquette {
		margin: 1.5rem 0 0.5rem;
		padding-top: 0.4rem;
		border-top: 3px solid var(--texte);
		color: var(--accent);
		font-size: 0.8rem;
		letter-spacing: 0.08em;
	}
	.court {
		font-size: 1.1rem;
		color: var(--texte-doux);
	}
	ul.angles,
	ul.divergences {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
	}
	.angles li {
		padding: 0.9rem 0;
		border-top: 1px solid var(--filet);
	}
	.angles p {
		margin: 0.2rem 0 0.1rem;
	}
	.divergences li {
		padding: 0.6rem 0;
		border-top: 1px solid var(--filet);
	}
	.divergences li::before {
		content: '≠ ';
		color: var(--accent);
		font-weight: 700;
	}
</style>
