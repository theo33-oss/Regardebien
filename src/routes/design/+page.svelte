<script lang="ts">
	import Cartouche from '#lib/components/Cartouche.svelte';
	import Niveau from '#lib/components/Niveau.svelte';

	const couleurs = [
		['--fond', 'Fond'],
		['--surface', 'Surface'],
		['--texte', 'Texte'],
		['--texte-doux', 'Texte doux'],
		['--filet', 'Filet'],
		['--accent', 'Accent'],
		['--lien', 'Lien']
	];
</script>

<svelte:head>
	<title>Style · Cartouche</title>
</svelte:head>

<div class="demo">
	<Cartouche numero={42} date="2026-11-17" heure="18:00" />

	<section>
		<p class="etiquette">Titres et texte</p>
		<h1>Un lanceur fictif réussit son vol d'essai</h1>
		<h2>Ce que disent les médias</h2>
		<h3>Les réserves des ingénieurs</h3>
		<p>
			Texte courant dans la police du système, lisible sur iPhone comme sur ordinateur, avec un
			<a href="#essai">lien</a> et un fond neutre.
		</p>
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
		<p class="etiquette">Niveaux de confirmation</p>
		<p class="niveaux">
			<Niveau niveau="confirme" />
			<Niveau niveau="source_unique" />
			<Niveau niveau="conteste" />
			<Niveau niveau="officiel" />
		</p>
	</section>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	section {
		padding-top: 1rem;
		border-top: 1px solid var(--filet);
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
		border: 1px solid var(--filet);
		border-radius: 6px;
	}
	.niveaux {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0.5rem 0 0;
	}
</style>
