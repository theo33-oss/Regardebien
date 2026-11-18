<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Sujet } from '#lib/schema/index.js';
	import Faits from './Faits.svelte';

	let { sujet, date }: { sujet: Sujet; date: string } = $props();
	let ouvert = $state(false);
	const idPanneau = $derived(`synthese-${sujet.id}`);
</script>

<article class="carte">
	{#if sujet.etiquettes.length}
		<p class="etiquette">{sujet.etiquettes.join(' · ')}</p>
	{/if}
	<!-- Niveau 1 : titre + 2 lignes -->
	<h3>{sujet.titre}</h3>
	<p class="court">{sujet.resume_court}</p>

	<div class="actions">
		<button
			type="button"
			aria-expanded={ouvert}
			aria-controls={idPanneau}
			onclick={() => (ouvert = !ouvert)}
		>
			{ouvert ? 'Réduire' : 'Synthèse'}
		</button>
		<a href={resolve('/edition/[date]/[sujet]', { date, sujet: sujet.id })}>Détail et sources →</a>
	</div>

	{#if ouvert}
		<!-- Niveau 2 : synthèse complète et faits clés -->
		<div id={idPanneau} class="panneau">
			<p>{sujet.synthese}</p>
			<Faits faits={sujet.faits} />
		</div>
	{/if}
</article>

<style>
	.carte {
		padding: 0.9rem 0.9rem 0.4rem;
		background: var(--papier);
		border: 1px solid var(--trait);
	}
	.carte > p.etiquette {
		margin: 0 0 0.25rem;
	}
	h3 {
		margin-bottom: 0.3rem;
	}
	.court {
		margin-bottom: 0.5rem;
		color: var(--encre-douce);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.25rem 1rem;
	}
	.actions a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--police-technique);
		font-size: 0.85rem;
	}
	button {
		min-height: 44px;
		padding: 0 0.9rem;
		border: 1px solid var(--trait);
		background: transparent;
		color: var(--trait);
		font-family: var(--police-technique);
		font-size: 0.85rem;
		cursor: pointer;
	}
	.panneau {
		padding: 0.5rem 0 0.75rem;
		border-top: 1px dashed var(--trait);
		margin-top: 0.25rem;
	}
</style>
