import type { Mode, ReglagePolitique, Temps } from './lecture.js';

const CLE = 'cartouche-prefs';

type Valeurs = { mode: Mode; temps: Temps; politique: ReglagePolitique };
const DEFAUT: Valeurs = { mode: 'edition', temps: '10', politique: 'auto' };

function lire(): Valeurs {
	try {
		return { ...DEFAUT, ...JSON.parse(localStorage.getItem(CLE) ?? '{}') };
	} catch {
		return { ...DEFAUT };
	}
}

/** Réglages de lecture, gardés dans le navigateur (localStorage). */
class Prefs {
	valeurs = $state<Valeurs>({ ...DEFAUT });
	prete = $state(false);

	charger() {
		this.valeurs = lire();
		this.prete = true;
	}

	definir<K extends keyof Valeurs>(cle: K, valeur: Valeurs[K]) {
		this.valeurs[cle] = valeur;
		try {
			localStorage.setItem(CLE, JSON.stringify(this.valeurs));
		} catch {
			/* navigation privée : le réglage vaut pour la session seulement */
		}
	}
}

export const prefs = new Prefs();
