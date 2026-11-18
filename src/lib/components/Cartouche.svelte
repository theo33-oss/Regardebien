<script lang="ts">
	// Cartouche de plan : n° d'édition, date, heure.
	let { numero, date, heure }: { numero: number; date: string; heure: string } = $props();

	const dateLongue = $derived(
		new Intl.DateTimeFormat('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(`${date}T12:00:00Z`))
	);
</script>

<header class="cartouche">
	<div class="titre">
		<span class="etiquette">Plan n°</span>
		<strong>Cartouche</strong>
	</div>
	<div>
		<span class="etiquette">Édition</span>
		<strong>N° {String(numero).padStart(3, '0')}</strong>
	</div>
	<div>
		<span class="etiquette">Date</span>
		<strong>{dateLongue}</strong>
	</div>
	<div>
		<span class="etiquette">Heure</span>
		<strong>{heure}</strong>
	</div>
</header>

<style>
	.cartouche {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 2px solid var(--trait);
		background: var(--papier);
		font-family: var(--police-technique);
	}
	.cartouche > div {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0.5rem 0.75rem;
		border-left: 1px solid var(--trait);
		border-top: 1px solid var(--trait);
	}
	.titre {
		grid-column: 1 / -1;
		border-left: 0 !important;
		border-top: 0 !important;
	}
	.cartouche > div:nth-child(2) {
		border-left: 0;
	}
	strong {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--encre);
	}
	.titre strong {
		font-size: 1.15rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	@media (min-width: 40rem) {
		.cartouche {
			grid-template-columns: 2fr 1fr 2fr 1fr;
		}
		.titre {
			grid-column: auto;
			border-left: 0 !important;
		}
		.cartouche > div {
			border-top: 0;
		}
		.cartouche > div:nth-child(2) {
			border-left: 1px solid var(--trait);
		}
	}
</style>
