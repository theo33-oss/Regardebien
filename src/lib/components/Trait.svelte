<script lang="ts">
	// Trait horizontal qui se dessine à l'affichage (transition `draw`).
	import { onMount } from 'svelte';
	import { draw } from 'svelte/transition';

	let { duree = 700, epais = false }: { duree?: number; epais?: boolean } = $props();

	let visible = $state(false);
	onMount(() => (visible = true));
</script>

<svg class="trait" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
	{#if visible}
		<path
			d="M0 1 H100"
			fill="none"
			stroke="currentColor"
			stroke-width={epais ? 2.5 : 1}
			vector-effect="non-scaling-stroke"
			in:draw={{ duration: duree }}
		/>
	{/if}
</svg>

<style>
	.trait {
		display: block;
		width: 100%;
		height: 4px;
		color: var(--trait);
	}
</style>
