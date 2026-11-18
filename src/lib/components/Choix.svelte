<script lang="ts" generics="T extends string">
	// Choix exclusif présenté comme des onglets de plan (boutons radio, au moins 44 px de haut).
	let {
		legende,
		options,
		valeur,
		onchoisir
	}: {
		legende: string;
		options: { valeur: T; libelle: string }[];
		valeur: T;
		onchoisir: (v: T) => void;
	} = $props();

	const nom = `choix-${Math.random().toString(36).slice(2, 8)}`;
</script>

<fieldset>
	<legend class="etiquette">{legende}</legend>
	<div class="options">
		{#each options as o (o.valeur)}
			<label class:actif={o.valeur === valeur}>
				<input
					type="radio"
					name={nom}
					value={o.valeur}
					checked={o.valeur === valeur}
					onchange={() => onchoisir(o.valeur)}
				/>
				{o.libelle}
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		min-width: 0;
	}
	legend {
		padding: 0;
		margin-bottom: 0.25rem;
	}
	.options {
		display: flex;
		border: 1px solid var(--trait);
		background: var(--papier);
	}
	label {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0 0.75rem;
		font-family: var(--police-technique);
		font-size: 0.85rem;
		text-align: center;
		cursor: pointer;
		color: var(--encre);
	}
	label + label {
		border-left: 1px solid var(--trait);
	}
	label.actif {
		background: var(--trait);
		color: var(--papier);
	}
	input {
		position: absolute;
		opacity: 0;
		inset: 0;
		cursor: pointer;
	}
	label:has(input:focus-visible) {
		outline: 2px solid var(--cote);
		outline-offset: -2px;
	}
</style>
