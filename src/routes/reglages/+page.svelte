<script lang="ts">
	import Choix from '#lib/components/Choix.svelte';
	import type { Mode, ReglagePolitique } from '#lib/lecture.js';
	import { prefs } from '#lib/prefs.svelte.js';
</script>

<svelte:head>
	<title>Réglages · Cartouche</title>
</svelte:head>

<h1>Réglages</h1>

<section>
	<Choix
		legende="Mode de lecture"
		options={[
			{ valeur: 'edition', libelle: 'Édition' },
			{ valeur: 'flux', libelle: 'Flux' }
		]}
		valeur={prefs.valeurs.mode}
		onchoisir={(v) => prefs.definir('mode', v as Mode)}
	/>
	<p class="aide">
		Édition : synthèse rédigée à 18 h. Flux : articles collectés à 7 h, 12 h et 17 h, sans IA.
	</p>
</section>

<section>
	<Choix
		legende="Rubrique Politique"
		options={[
			{ valeur: 'auto', libelle: 'Auto' },
			{ valeur: 'toujours', libelle: 'Toujours' },
			{ valeur: 'jamais', libelle: 'Jamais' }
		]}
		valeur={prefs.valeurs.politique}
		onchoisir={(v) => prefs.definir('politique', v as ReglagePolitique)}
	/>
	<p class="aide">
		Auto : affichée pendant les périodes électorales (présidentielle 2027 : du 12 mars au 16 mai
		2027). Toujours et Jamais l'emportent sur les dates.
	</p>
</section>

<style>
	section {
		padding: 0.75rem;
		background: var(--papier);
		border: 1px solid var(--trait);
	}
	.aide {
		margin: 0.6rem 0 0;
		font-size: 0.9rem;
		color: var(--encre-douce);
	}
</style>
