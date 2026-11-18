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
		gap: 0 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.85rem;
	}
	a {
		display: inline-block;
		padding: 0.5rem 0;
	}
</style>
