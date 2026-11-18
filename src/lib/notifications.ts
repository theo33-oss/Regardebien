import { asset } from '$app/paths';

// Abonnement aux notifications de 18 h (Web Push).
// Elles exigent un serveur qui garde les abonnements (worker/, hébergé hors GitHub Pages) :
// sans lui, la section n'apparaît pas dans les Réglages.
// Sur iPhone, elles ne fonctionnent que si l'appli est installée sur l'écran d'accueil.

export type EtatNotifications =
	| 'indisponible' // navigateur sans notifications
	| 'installer' // iPhone : appli pas encore ajoutée à l'écran d'accueil
	| 'bloque' // refusé dans les réglages du système
	| 'inactif'
	| 'actif';

const enAppli = () =>
	window.matchMedia('(display-mode: standalone)').matches ||
	(navigator as Navigator & { standalone?: boolean }).standalone === true;
const surIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export async function etatNotifications(): Promise<EtatNotifications> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window))
		return surIphone() && !enAppli() ? 'installer' : 'indisponible';
	if (surIphone() && !enAppli()) return 'installer';
	if (Notification.permission === 'denied') return 'bloque';
	const reg = await navigator.serviceWorker.getRegistration();
	const abonnement = await reg?.pushManager.getSubscription();
	return abonnement && Notification.permission === 'granted' ? 'actif' : 'inactif';
}

function cleVersOctets(base64url: string): Uint8Array<ArrayBuffer> {
	const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// Adresse d'une fonction du serveur de notifications (même site, dossier api/).
const api = (chemin: string) => asset(`api/${chemin}` as 'robots.txt');

/** Le serveur de notifications répond-il ? (Non sur GitHub Pages : page statique seulement.) */
export async function serveurDisponible(): Promise<boolean> {
	try {
		const r = await fetch(api('cle'));
		return r.ok && !(r.headers.get('content-type') ?? '').includes('html');
	} catch {
		return false;
	}
}

async function appeler(chemin: string, corps: unknown) {
	const r = await fetch(api(chemin), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(corps)
	});
	if (!r.ok) throw new Error(`api/${chemin} : HTTP ${r.status}`);
}

export async function activerNotifications(): Promise<void> {
	if ((await Notification.requestPermission()) !== 'granted') return;
	const reg = await navigator.serviceWorker.ready;
	const cle = await (await fetch(api('cle'))).text();
	const abonnement =
		(await reg.pushManager.getSubscription()) ??
		(await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: cleVersOctets(cle.trim())
		}));
	await appeler('abonner', abonnement.toJSON());
}

export async function desactiverNotifications(): Promise<void> {
	const reg = await navigator.serviceWorker.getRegistration();
	const abonnement = await reg?.pushManager.getSubscription();
	if (!abonnement) return;
	await appeler('desabonner', { endpoint: abonnement.endpoint }).catch(() => {});
	await abonnement.unsubscribe();
}
