<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import favicon from '#lib/assets/favicon.svg';
	import { prefs } from '#lib/prefs.svelte.js';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => prefs.charger());

	const liens = [
		{ href: '/', libelle: 'Aujourd’hui' },
		{ href: '/archive', libelle: 'Archive' },
		{ href: '/reglages', libelle: 'Réglages' }
	] as const;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
		max-width: var(--largeur-texte);
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
		background: var(--papier);
		border-bottom: 2px solid var(--trait);
		font-family: var(--police-technique);
	}
	.marque {
		font-weight: 700;
		letter-spacing: 0.14em;
		color: var(--encre);
		text-decoration: none;
		padding: 0.75rem 0;
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
		font-size: 0.85rem;
		text-decoration: none;
		color: var(--encre-douce);
		border-bottom: 3px solid transparent;
	}
	li a[aria-current='page'] {
		color: var(--encre);
		border-bottom-color: var(--cote);
	}
	main {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
</style>
