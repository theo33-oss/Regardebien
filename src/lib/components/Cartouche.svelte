<script lang="ts">
	import { dateLongue } from '#lib/lecture.js';

	// En-tête d'une édition : numéro, date, heure de parution.
	let { numero, date, heure }: { numero: number; date: string; heure: string } = $props();
</script>

<header class="entete">
	<p class="etiquette">Édition n° {String(numero).padStart(3, '0')}</p>
	<p class="date">{dateLongue(date)}</p>
	<p class="heure">Parue à {heure}</p>
</header>

<style>
	.entete {
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--filet);
	}
	p {
		margin: 0;
	}
	.date {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
	}
	.heure {
		font-size: 0.9rem;
		color: var(--texte-doux);
	}
</style>
