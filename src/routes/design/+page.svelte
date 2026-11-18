<script lang="ts">
	import Cartouche from '#lib/components/Cartouche.svelte';
	import Cote from '#lib/components/Cote.svelte';
	import Niveau from '#lib/components/Niveau.svelte';
	import Trait from '#lib/components/Trait.svelte';

	const couleurs = [
		['--papier', 'Papier'],
		['--encre', 'Encre'],
		['--encre-douce', 'Encre douce'],
		['--trait', 'Bleu de plan'],
		['--cote', 'Cote']
	];
</script>

<svelte:head>
	<title>Carnet technique · Cartouche</title>
</svelte:head>

<div class="demo">
	<Cartouche numero={42} date="2026-11-17" heure="18:00" />

	<section>
		<p class="etiquette">Titres</p>
		<h1>Un lanceur fictif réussit son vol d'essai</h1>
		<h2>Ce que disent les médias</h2>
		<h3>Les réserves des ingénieurs</h3>
		<p>
			Texte courant en serif, lisible sur iPhone comme sur ordinateur. Les libellés, chiffres et
			étiquettes passent en chasse fixe, comme sur un plan.
		</p>
		<Trait />
	</section>

	<section>
		<p class="etiquette">Palette (clair et sombre selon l'iPhone)</p>
		<ul class="palette">
			{#each couleurs as [variable, nom] (variable)}
				<li>
					<span class="echantillon" style:background="var({variable})"></span>
					<span class="etiquette">{nom}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<p class="etiquette">Cote</p>
		<Cote valeur="5 sujets · 2 min" />
		<Cote valeur="15 sujets · 10 min" />
	</section>

	<section>
		<p class="etiquette">Niveaux de confirmation</p>
		<p class="niveaux">
			<Niveau niveau="confirme" />
			<Niveau niveau="source_unique" />
			<Niveau niveau="conteste" />
			<Niveau niveau="officiel" />
		</p>
	</section>

	<section>
		<p class="etiquette">Tracé épais</p>
		<Trait epais duree={1000} />
	</section>
</div>

<style>
	.demo {
		max-width: var(--largeur-texte);
		margin: 0 auto;
		padding: 1rem 1rem 3rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	section {
		background: var(--papier);
		padding: 0.75rem;
		border: 1px solid var(--trait);
	}
	.palette {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: 0.75rem;
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
	}
	.echantillon {
		display: block;
		height: 2.5rem;
		border: 1px solid var(--trait);
	}
	.niveaux {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0.5rem 0 0;
	}
</style>
