<script lang="ts">
	import { prefs } from '#lib/prefs.svelte.js';
	import type { Mode, Temps } from '#lib/lecture.js';
	import Choix from './Choix.svelte';

	// mode=false : page d'une édition précise (archive), seul le temps de lecture a un sens.
	// temps=false : rien à doser (le Flux est affiché faute d'édition).
	let { mode = true, temps = true }: { mode?: boolean; temps?: boolean } = $props();
</script>

<div class="selecteurs" class:seul={!mode}>
	{#if mode}
		<Choix
			legende="Mode"
			options={[
				{ valeur: 'edition', libelle: 'Édition' },
				{ valeur: 'flux', libelle: 'Flux' }
			]}
			valeur={prefs.valeurs.mode}
			onchoisir={(v) => prefs.definir('mode', v as Mode)}
		/>
	{/if}
	{#if temps && (!mode || prefs.valeurs.mode === 'edition')}
		<Choix
			legende="Temps de lecture"
			options={[
				{ valeur: '2', libelle: '2 min' },
				{ valeur: '10', libelle: '10 min' },
				{ valeur: 'tout', libelle: 'Tout' }
			]}
			valeur={prefs.valeurs.temps}
			onchoisir={(v) => prefs.definir('temps', v as Temps)}
		/>
	{/if}
</div>

<style>
	.selecteurs {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: 1fr;
	}
	@media (min-width: 36rem) {
		.selecteurs:not(.seul) {
			grid-template-columns: 1fr 1.5fr;
		}
	}
</style>
