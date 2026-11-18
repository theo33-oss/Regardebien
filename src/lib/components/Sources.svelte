<script lang="ts">
	import { domaine } from '#lib/lecture.js';

	let { urls }: { urls: string[] } = $props();
</script>

<ul class="sources">
	{#each [...new Set(urls)] as url (url)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<li><a href={url} target="_blank" rel="noopener noreferrer">{domaine(url)}</a></li>
	{/each}
</ul>

<style>
	.sources {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-family: var(--police-technique);
		font-size: 0.8rem;
	}
	a {
		display: inline-block;
		padding: 0.5rem 0;
	}
</style>
