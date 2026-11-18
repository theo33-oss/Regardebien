<script lang="ts">
	import { resolve } from '$app/paths';
	import Selecteurs from '#lib/components/Selecteurs.svelte';
	import VueEdition from '#lib/components/VueEdition.svelte';
	import VueFlux from '#lib/components/VueFlux.svelte';
	import {
		chargerCollecte,
		chargerEdition,
		chargerEnsemble,
		prechargerEditions
	} from '#lib/donnees.js';
	import { dateParis } from '#lib/lecture.js';
	import { prefs } from '#lib/prefs.svelte.js';
	import type { CollecteDuJour, Edition } from '#lib/schema/index.js';
	import { onMount } from 'svelte';

	type Etat = {
		rubriques: Awaited<ReturnType<typeof chargerEnsemble>>['rubriques'];
		saisons: Awaited<ReturnType<typeof chargerEnsemble>>['saisons'];
		edition: Edition | null;
		collecte: CollecteDuJour | null;
		/** Pourquoi on affiche le Flux alors que l'Édition est demandée. */
		repli: 'absente' | 'invalide' | null;
		derniere: string | null;
	};

	let etat = $state<Etat | null>(null);
	let erreur = $state(false);

	onMount(async () => {
		try {
			const { index, rubriques, saisons } = await chargerEnsemble();
			prechargerEditions(index);
			const aujourdhui = dateParis();
			// En développement, l'édition d'exemple tient lieu d'édition du jour.
			const duJour = index.editions.find(
				(e) => e.date === aujourdhui || (import.meta.env.DEV && e.fichier.includes('exemple'))
			);
			const edition = duJour ? await chargerEdition(duJour.fichier) : null;
			const dernier = index.collectes.at(-1);
			const collecte = dernier ? await chargerCollecte(dernier.fichier) : null;
			etat = {
				rubriques,
				saisons,
				edition,
				collecte,
				repli: edition ? null : duJour ? 'invalide' : 'absente',
				derniere: index.editions[0]?.date ?? null
			};
		} catch {
			erreur = true;
		}
	});

	const afficherEdition = $derived(prefs.valeurs.mode === 'edition' && !!etat?.edition);
</script>

<svelte:head>
	<title>Cartouche</title>
</svelte:head>

<Selecteurs />

{#if erreur}
	<p>Les données n'ont pas pu être chargées. Vérifie ta connexion et recharge la page.</p>
{:else if !etat}
	<p class="etiquette">Chargement…</p>
{:else}
	{#if prefs.valeurs.mode === 'edition' && etat.repli}
		<p class="mention">
			{etat.repli === 'invalide'
				? 'L’édition du jour est illisible : affichage du Flux.'
				: 'L’édition du jour n’est pas encore parue : affichage du Flux.'}
			{#if etat.derniere}
				<a href={resolve('/archive')}>Dernières éditions</a>
			{/if}
		</p>
	{/if}

	{#if afficherEdition && etat.edition}
		<VueEdition edition={etat.edition} rubriques={etat.rubriques} saisons={etat.saisons} />
	{:else if etat.collecte}
		<VueFlux collecte={etat.collecte} rubriques={etat.rubriques} saisons={etat.saisons} />
	{:else}
		<p>Rien à afficher pour le moment : aucune collecte n'est encore disponible.</p>
	{/if}
{/if}

<style>
	.mention {
		margin: 0;
		padding: 0.5rem 0.75rem;
		border: 1px dashed var(--encre-douce);
		background: var(--papier);
		color: var(--encre-douce);
		font-family: var(--police-technique);
		font-size: 0.8rem;
	}
</style>
