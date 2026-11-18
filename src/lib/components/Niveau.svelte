<script lang="ts">
	// Niveau de confirmation d'un fait. Le sens ne repose pas sur la couleur seule : symbole + libellé.
	import type { Niveau } from '#lib/schema/index.js';

	let { niveau }: { niveau: Niveau } = $props();

	const LIBELLES: Record<Niveau, { symbole: string; texte: string }> = {
		confirme: { symbole: '●', texte: 'Confirmé' },
		source_unique: { symbole: '○', texte: 'Source unique' },
		conteste: { symbole: '▲', texte: 'Contesté' },
		officiel: { symbole: '■', texte: 'Officiel' }
	};
	const info = $derived(LIBELLES[niveau]);
</script>

<span class="niveau {niveau}">
	<span aria-hidden="true">{info.symbole}</span>
	{info.texte}
</span>

<style>
	.niveau {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		padding: 0.1rem 0.55rem;
		border: 1px solid currentColor;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
	}
	.confirme {
		color: var(--niveau-confirme);
	}
	.source_unique {
		color: var(--niveau-source-unique);
	}
	.conteste {
		color: var(--niveau-conteste);
	}
	.officiel {
		color: var(--niveau-officiel);
	}
</style>
