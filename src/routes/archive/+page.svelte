<script lang="ts">
	import { resolve } from '$app/paths';
	import { chargerEnsemble } from '#lib/donnees.js';
	import type { Index } from '#lib/schema/index.js';
	import { onMount } from 'svelte';

	let index = $state<Index | null>(null);
	let erreur = $state(false);
	onMount(() =>
		chargerEnsemble().then(
			(e) => (index = e.index),
			() => (erreur = true)
		)
	);

	const formatDate = (d: string) =>
		new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'UTC' }).format(
			new Date(`${d}T12:00:00Z`)
		);
</script>

<svelte:head>
	<title>Archive · Cartouche</title>
</svelte:head>

<h1>Archive</h1>
<p class="etiquette">Les 7 dernières éditions sont lisibles hors-ligne.</p>

{#if erreur}
	<p>Les données n'ont pas pu être chargées.</p>
{:else if !index}
	<p class="etiquette">Chargement…</p>
{:else}
	<ul>
		{#each index.editions as e, i (e.fichier)}
			<li>
				<a href={resolve('/edition/[date]', { date: e.date })}>
					<span class="etiquette">
						Édition n° {String(e.numero).padStart(3, '0')}
						{#if e.mode === 'degrade'}· dégradée{/if}
						{#if i < 7}· hors-ligne{/if}
					</span>
					<strong>{formatDate(e.date)}</strong>
					<span class="titres">{e.titres.join(' · ')}</span>
				</a>
			</li>
		{:else}
			<li class="vide">Aucune édition pour le moment. La première paraîtra à 18 h.</li>
		{/each}
	</ul>
{/if}

<style>
	h1 {
		margin: 0;
	}
	p.etiquette {
		margin: 0;
	}
	ul {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		border-bottom: 1px solid var(--filet);
	}
	li a {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.9rem 0;
		text-decoration: none;
		color: var(--texte);
	}
	strong {
		font-size: 1.05rem;
	}
	.titres {
		color: var(--texte-doux);
		font-size: 0.92rem;
	}
	.vide {
		padding: 0.9rem 0;
		color: var(--texte-doux);
	}
</style>
