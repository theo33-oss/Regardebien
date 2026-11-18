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
		gap: 1rem;
	}
	li {
		padding-left: 0.75rem;
		border-left: 2px solid var(--trait);
	}
	p {
		margin: 0.4rem 0 0.1rem;
	}
</style>
