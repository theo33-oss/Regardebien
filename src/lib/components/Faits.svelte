<script lang="ts">
	import type { Fait } from '#lib/schema/index.js';
	import Niveau from './Niveau.svelte';
	import Sources from './Sources.svelte';

	let { faits }: { faits: Fait[] } = $props();
</script>

<ul class="faits">
	{#each faits as fait, i (i)}
		<li>
			<Niveau niveau={fait.niveau} />
			<p>{fait.texte}</p>
			<Sources urls={fait.sources} />
		</li>
	{/each}
</ul>

<style>
	.faits {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
	}
	li {
		padding: 0.9rem 0;
		border-top: 1px solid var(--filet);
	}
	p {
		margin: 0.5rem 0 0.1rem;
	}
</style>
