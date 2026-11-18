<script lang="ts">
	import {
		heureParis,
		nomRubrique,
		parRubrique,
		rubriquesVisibles,
		selectionner
	} from '#lib/lecture.js';
	import type { RubriqueConfig, Saison } from '#lib/lecture.js';
	import { prefs } from '#lib/prefs.svelte.js';
	import type { Edition } from '#lib/schema/index.js';
	import CarteSujet from './CarteSujet.svelte';
	import Cartouche from './Cartouche.svelte';
	import Cote from './Cote.svelte';

	let {
		edition,
		rubriques,
		saisons
	}: { edition: Edition; rubriques: RubriqueConfig[]; saisons: Saison[] } = $props();

	// « Auto » : la rubrique saisonnière suit l'édition. Toujours / Jamais l'emportent.
	const visibles = $derived(
		prefs.valeurs.politique === 'auto'
			? edition.rubriques_actives
			: rubriquesVisibles(rubriques, saisons, edition.date, prefs.valeurs.politique)
	);
	const retenus = $derived(selectionner(edition.sujets, prefs.valeurs.temps, visibles));
	const groupes = $derived(parRubrique(retenus, rubriques));
	const libelleTemps = $derived(
		prefs.valeurs.temps === 'tout'
			? 'Toute l’édition'
			: `${retenus.length} sujets · ${prefs.valeurs.temps} min`
	);
</script>

<Cartouche numero={edition.numero} date={edition.date} heure={heureParis(edition.genere_le)} />

{#if edition.mode === 'degrade'}
	<p class="mention">
		Édition en mode dégradé : synthèse partielle, certains sujets peuvent être incomplets.
	</p>
{/if}
{#if edition.exemple}
	<p class="mention">Données d'exemple (développement).</p>
{/if}

<Cote valeur={libelleTemps} />

{#each groupes as groupe (groupe.rubrique.id)}
	<section aria-labelledby={`r-${groupe.rubrique.id}`}>
		<h2 id={`r-${groupe.rubrique.id}`} class="rubrique">{groupe.rubrique.nom}</h2>
		<div class="liste">
			{#each groupe.elements as sujet, i (`${i}-${sujet.id}`)}
				<CarteSujet {sujet} date={edition.date} noms={(id) => nomRubrique(rubriques, id)} />
			{/each}
		</div>
	</section>
{:else}
	<p>Aucun sujet pour ces réglages.</p>
{/each}

<style>
	.mention {
		margin: 0;
		padding: 0.5rem 0.75rem;
		border: 1px dashed var(--cote);
		background: var(--papier);
		color: var(--cote);
		font-family: var(--police-technique);
		font-size: 0.85rem;
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
	.liste {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
