<script lang="ts">
	import {
		activerNotifications,
		desactiverNotifications,
		etatNotifications,
		serveurDisponible,
		type EtatNotifications
	} from '#lib/notifications.js';
	import { onMount } from 'svelte';
	import Choix from '#lib/components/Choix.svelte';
	import type { Mode, ReglagePolitique } from '#lib/lecture.js';
	import { prefs } from '#lib/prefs.svelte.js';

	let notifs = $state<EtatNotifications | null>(null);
	let occupe = $state(false);
	let echec = $state(false);

	onMount(async () => {
		if (await serveurDisponible()) notifs = await etatNotifications();
	});

	async function basculer() {
		occupe = true;
		echec = false;
		try {
			if (notifs === 'actif') await desactiverNotifications();
			else await activerNotifications();
		} catch {
			echec = true;
		}
		notifs = await etatNotifications();
		occupe = false;
	}

	const AIDE: Record<EtatNotifications, string> = {
		indisponible: 'Ce navigateur ne permet pas les notifications.',
		installer:
			'Sur iPhone, ajoute d’abord Cartouche à l’écran d’accueil (Partager, puis « Sur l’écran d’accueil »), ouvre l’appli depuis l’icône, puis reviens ici.',
		bloque:
			'Les notifications sont refusées. Autorise-les dans les réglages de l’appareil (sur iPhone : Réglages, Notifications, Cartouche).',
		inactif: 'Reçois 2 ou 3 titres chaque jour à 18 h.',
		actif: 'Notification active : 2 ou 3 titres chaque jour à 18 h.'
	};
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

<section>
	<h2 class="etiquette">Notification de 18 h</h2>
	{#if notifs}
		<p class="aide">{AIDE[notifs]}</p>
		{#if notifs === 'actif' || notifs === 'inactif'}
			<button type="button" disabled={occupe} onclick={basculer}>
				{notifs === 'actif' ? 'Désactiver' : 'Activer'}
			</button>
		{/if}
		{#if echec}
			<p class="aide erreur">L’opération a échoué. Réessaie dans un moment.</p>
		{/if}
	{/if}
</section>

<style>
	h1 {
		margin: 0;
	}
	section {
		padding: 1rem 0;
		border-top: 1px solid var(--filet);
	}
	h2 {
		margin: 0 0 0.4rem;
	}
	button {
		min-height: 44px;
		margin-top: 0.6rem;
		padding: 0 1.1rem;
		border: 1px solid var(--texte);
		border-radius: 8px;
		background: transparent;
		color: var(--texte);
		font: inherit;
		font-size: 0.92rem;
		font-weight: 600;
		cursor: pointer;
	}
	.erreur {
		color: var(--accent);
	}
	.aide {
		margin: 0.6rem 0 0;
		font-size: 0.9rem;
		color: var(--texte-doux);
	}
</style>
