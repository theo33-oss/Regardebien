<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Faits from '#lib/components/Faits.svelte';
	import Sources from '#lib/components/Sources.svelte';
	import { chargerEdition, chargerEnsemble } from '#lib/donnees.js';
	import type { Sujet } from '#lib/schema/index.js';
	import { onMount } from 'svelte';

	let sujet = $state<Sujet | null>(null);
	let rubrique = $state('');
	let erreur = $state<string | null>(null);

	onMount(async () => {
		try {
			const { index, rubriques } = await chargerEnsemble();
			const entree = index.editions.find((e) => e.date === page.params.date);
			const edition = entree ? await chargerEdition(entree.fichier) : null;
			const trouve = edition?.sujets.find((s) => s.id === page.params.sujet);
			if (!trouve) erreur = 'Ce sujet est introuvable.';
			else {
				sujet = trouve;
				rubrique = rubriques.find((r) => r.id === trouve.rubrique)?.nom ?? trouve.rubrique;
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
	>← Édition du {page.params.date}</a
>

{#if erreur}
	<p>{erreur}</p>
{:else if !sujet}
	<p class="etiquette">Chargement…</p>
{:else}
	<article>
		<p class="etiquette">
			{rubrique}{#if sujet.etiquettes.length}
				· {sujet.etiquettes.join(', ')}{/if}
		</p>
		<h1>{sujet.titre}</h1>
		<p class="court">{sujet.resume_court}</p>

		<h2 class="etiquette">Synthèse</h2>
		<p>{sujet.synthese}</p>

		<h2 class="etiquette">Faits clés</h2>
		<Faits faits={sujet.faits} />

		{#if sujet.angles.length}
			<h2 class="etiquette">Angles des médias</h2>
			<ul class="angles">
				{#each sujet.angles as a (a.medias.join() + a.texte)}
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
				{#each sujet.divergences as d (d)}
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
		font-family: var(--police-technique);
		font-size: 0.85rem;
	}
	article {
		padding: 1rem;
		background: var(--papier);
		border: 1px solid var(--trait);
	}
	article > .etiquette:first-child {
		margin: 0 0 0.25rem;
	}
	h2.etiquette {
		margin: 1.5rem 0 0.5rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--trait);
		font-weight: 400;
	}
	.court {
		font-size: 1.1rem;
		color: var(--encre-douce);
	}
	ul.angles,
	ul.divergences {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.angles li {
		padding-left: 0.75rem;
		border-left: 2px solid var(--cote);
	}
	.angles p {
		margin: 0.2rem 0 0.1rem;
	}
	.divergences li::before {
		content: '≠ ';
		color: var(--cote);
		font-family: var(--police-technique);
	}
</style>
