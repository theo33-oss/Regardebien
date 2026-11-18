<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Selecteurs from '#lib/components/Selecteurs.svelte';
	import VueEdition from '#lib/components/VueEdition.svelte';
	import { chargerEdition, chargerEnsemble } from '#lib/donnees.js';
	import { dateLongue } from '#lib/lecture.js';
	import type { Edition } from '#lib/schema/index.js';
	import { onMount } from 'svelte';

	let contexte = $state<{
		edition: Edition;
		rubriques: Awaited<ReturnType<typeof chargerEnsemble>>['rubriques'];
		saisons: Awaited<ReturnType<typeof chargerEnsemble>>['saisons'];
	} | null>(null);
	let erreur = $state<string | null>(null);

	onMount(async () => {
		try {
			const { index, rubriques, saisons } = await chargerEnsemble();
			const entree = index.editions.find((e) => e.date === page.params.date);
			const edition = entree ? await chargerEdition(entree.fichier) : null;
			if (!edition) erreur = 'Cette édition est introuvable ou illisible.';
			else contexte = { edition, rubriques, saisons };
		} catch {
			erreur = 'Les données n’ont pas pu être chargées.';
		}
	});
</script>

<svelte:head>
	<title>Édition du {dateLongue(page.params.date ?? '')} · Cartouche</title>
</svelte:head>

<a class="retour" href={resolve('/archive')}>← Archive</a>
{#if erreur}
	<p>{erreur}</p>
{:else if !contexte}
	<p class="etiquette">Chargement…</p>
{:else}
	<Selecteurs mode={false} />
	<VueEdition
		edition={contexte.edition}
		rubriques={contexte.rubriques}
		saisons={contexte.saisons}
	/>
{/if}

<style>
	.retour {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--police-technique);
		font-size: 0.85rem;
	}
</style>
