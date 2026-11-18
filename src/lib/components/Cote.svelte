<script lang="ts">
	// Cote de plan : ligne de repère avec talons aux extrémités ; la valeur apparaît une fois le trait tracé.
	import { onMount } from 'svelte';
	import { draw, fade } from 'svelte/transition';

	let { valeur }: { valeur: string } = $props();

	let visible = $state(false);
	onMount(() => (visible = true));
</script>

<div class="cote">
	<svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
		{#if visible}
			<path
				d="M0.5 1 V11 M0.5 6 H99.5 M99.5 1 V11"
				fill="none"
				stroke="currentColor"
				stroke-width="1"
				vector-effect="non-scaling-stroke"
				in:draw={{ duration: 800 }}
			/>
		{/if}
	</svg>
	{#if visible}
		<span class="valeur" in:fade={{ duration: 300, delay: 700 }}>{valeur}</span>
	{/if}
</div>

<style>
	.cote {
		position: relative;
		height: 1.5rem;
		color: var(--cote);
	}
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
	.valeur {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 0 0.5rem;
		background: var(--papier);
		font-family: var(--police-technique);
		font-size: 0.8rem;
		white-space: nowrap;
	}
</style>
