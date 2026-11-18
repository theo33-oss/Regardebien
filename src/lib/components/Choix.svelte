<script lang="ts" generics="T extends string">
	// Choix exclusif présenté comme un sélecteur segmenté (boutons radio, au moins 44 px de haut).
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
		margin-bottom: 0.3rem;
	}
	.options {
		display: flex;
		gap: 2px;
		padding: 3px;
		border-radius: 10px;
		background: var(--surface);
	}
	label {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 40px;
		padding: 0 0.75rem;
		border-radius: 8px;
		font-size: 0.92rem;
		font-weight: 500;
		text-align: center;
		cursor: pointer;
		color: var(--texte-doux);
	}
	label.actif {
		background: var(--fond);
		color: var(--texte);
		font-weight: 600;
		box-shadow:
			0 0 0 1px var(--filet),
			0 1px 2px rgb(0 0 0 / 0.08);
	}
	input {
		position: absolute;
		opacity: 0;
		inset: 0;
		cursor: pointer;
	}
	label:has(input:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
</style>
