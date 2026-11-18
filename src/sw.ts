/// <reference lib="webworker" />
// Service worker de Cartouche, écrit sans bibliothèque :
//  - la coquille de l'appli (pages, scripts, styles, icônes) est mise en cache à l'installation ;
//  - les données (/data/) passent par le réseau d'abord, le cache en secours : lecture hors-ligne des éditions déjà vues ;
//  - réception des notifications Web Push (envoi sans contenu : le texte est composé ici).

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: { url: string; revision: string | null }[];
};

const entrees = self.__WB_MANIFEST;
const urls = entrees.map((e) => new URL(e.url, self.location.origin).href);
const CACHE_DONNEES = 'donnees';
// Le nom du cache change quand le contenu de l'appli change : l'ancien est alors supprimé.
const CACHE_COQUILLE = 'coquille-' + hacher(entrees.map((e) => `${e.url}@${e.revision}`).join('|'));

function hacher(s: string): string {
	let h = 5381;
	for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
	return (h >>> 0).toString(36);
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_COQUILLE);
			await cache.addAll(urls.map((u) => new Request(u, { cache: 'reload' })));
			await self.skipWaiting();
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const nom of await caches.keys())
				if (nom.startsWith('coquille-') && nom !== CACHE_COQUILLE) await caches.delete(nom);
			await self.clients.claim();
		})()
	);
});

async function reseauPuisCache(requete: Request, delaiMs: number): Promise<Response> {
	const cache = await caches.open(CACHE_DONNEES);
	try {
		const reponse = await Promise.race([
			fetch(requete),
			new Promise<never>((_, rejeter) => setTimeout(() => rejeter(new Error('délai')), delaiMs))
		]);
		if (reponse.ok) void cache.put(requete, reponse.clone());
		return reponse;
	} catch (erreur) {
		const enCache = await cache.match(requete, { ignoreVary: true });
		if (enCache) return enCache;
		throw erreur;
	}
}

self.addEventListener('fetch', (event) => {
	const requete = event.request;
	const url = new URL(requete.url);
	if (requete.method !== 'GET' || url.origin !== self.location.origin) return;

	if (url.pathname.startsWith('/data/')) {
		event.respondWith(reseauPuisCache(requete, 4000));
		return;
	}

	if (requete.mode === 'navigate') {
		// Appli à page unique : hors-ligne, toute adresse se lit dans la coquille (la page d'accueil, vide : l'appli s'affiche côté navigateur).
		event.respondWith(
			(async () => {
				try {
					return await fetch(requete);
				} catch {
					return (
						(await caches.match(requete, { ignoreVary: true })) ??
						(await caches.match('/')) ??
						Response.error()
					);
				}
			})()
		);
		return;
	}

	event.respondWith(
		(async () => (await caches.match(requete, { ignoreVary: true })) ?? fetch(requete))()
	);
});

self.addEventListener('push', (event) => {
	event.waitUntil(
		(async () => {
			let titres: string[] = [];
			try {
				const r = await fetch('/data/index.json', { cache: 'no-store' });
				titres = (await r.json()).editions?.[0]?.titres ?? [];
			} catch {
				/* hors-ligne : message générique */
			}
			await self.registration.showNotification('Cartouche · édition du jour', {
				body: titres.length ? titres.slice(0, 3).join('\n') : 'L’édition du jour est parue.',
				icon: '/icone-192.png',
				badge: '/icone-192.png',
				tag: 'edition',
				data: { url: '/' }
			});
		})()
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		(async () => {
			const fenetres = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
			if (fenetres.length) return fenetres[0].focus();
			return self.clients.openWindow('/');
		})()
	);
});
