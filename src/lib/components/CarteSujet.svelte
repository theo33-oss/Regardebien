<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Sujet } from '#lib/schema/index.js';
	import Faits from './Faits.svelte';

	// noms : nom affiché d'une rubrique secondaire (étiquette) à partir de son identifiant.
	let { sujet, date, noms }: { sujet: Sujet; date: string; noms: (id: string) => string } =
		$props();
	let ouvert = $state(false);
	const idPanneau = $derived(`synthese-${sujet.id}`);
</script>

<article>
	{#if sujet.etiquettes.length}
		<p class="etiquette">{sujet.etiquettes.map(noms).join(' · ')}</p>
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
			{ouvert ? 'Réduire ▲' : 'Synthèse ▼'}
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
	article {
		padding: 1rem 0 0.4rem;
		border-bottom: 1px solid var(--filet);
	}
	article > p.etiquette {
		margin: 0 0 0.25rem;
	}
	h3 {
		margin-bottom: 0.3rem;
	}
	.court {
		margin-bottom: 0.4rem;
		color: var(--texte-doux);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0 1rem;
	}
	.actions a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
	}
	button {
		min-height: 44px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--texte);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
	}
	.panneau {
		padding: 0.25rem 0 0.75rem;
	}
</style>
