<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { asset, resolve } from '$app/paths';
	import { prefs } from '#lib/prefs.svelte.js';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(async () => {
		prefs.charger();
		// Service worker : lecture hors-ligne et notifications (absent en développement).
		const { registerSW } = await import('virtual:pwa-register');
		registerSW({ immediate: true });
	});

	const liens = [
		{ href: '/', libelle: 'Aujourd’hui' },
		{ href: '/archive', libelle: 'Archive' },
		{ href: '/reglages', libelle: 'Réglages' }
	] as const;
</script>

<svelte:head>
	<link rel="icon" href={asset('icone.svg')} type="image/svg+xml" />
</svelte:head>

<div class="page">
	<nav aria-label="Navigation principale">
		<a class="marque" href={resolve('/')}>CARTOUCHE</a>
		<ul>
			{#each liens as l (l.href)}
				<li>
					<a
						href={resolve(l.href)}
						aria-current={page.url.pathname === l.href ? 'page' : undefined}
					>
						{l.libelle}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
	<main>
		{@render children()}
	</main>
</div>

<style>
	.page {
		max-width: var(--largeur);
		margin: 0 auto;
		padding: 0 1rem 3rem;
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0 1rem;
		margin: 0 -1rem 1rem;
		padding: 0 1rem;
		border-bottom: 1px solid var(--filet);
	}
	.marque {
		padding: 0.6rem 0;
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		color: var(--texte);
		text-decoration: none;
	}
	ul {
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li a {
		display: flex;
		align-items: center;
		min-height: 44px;
		padding: 0 0.6rem;
		font-size: 0.9rem;
		font-weight: 500;
		text-decoration: none;
		color: var(--texte-doux);
		border-bottom: 3px solid transparent;
	}
	li a[aria-current='page'] {
		color: var(--texte);
		font-weight: 600;
		border-bottom-color: var(--accent);
	}
	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
