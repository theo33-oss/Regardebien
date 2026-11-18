// Worker Cloudflare : sert l'appli (fichiers statiques) et gère les notifications de 18 h.
//   GET  /api/cle          clé publique VAPID (pour s'abonner)
//   POST /api/abonner      enregistre un abonnement (corps : l'abonnement du navigateur)
//   POST /api/desabonner   supprime un abonnement (corps : { endpoint })
//   POST /api/notifier     envoie la notification (en-tête Authorization: Bearer <NOTIFIER_SECRET>, corps : { date })
//
// Variables et secrets, à créer dans Cloudflare (voir docs/GUIDE-MISE-EN-LIGNE.md) :
//   VAPID_PUBLIC, VAPID_PRIVATE (secret), VAPID_SUBJECT (mailto: ou https://), NOTIFIER_SECRET (secret)
//   Espace KV lié sous le nom ABONNES.
import { enteteVapid } from './vapid.js';

export interface KV {
	get(cle: string): Promise<string | null>;
	put(cle: string, valeur: string): Promise<void>;
	delete(cle: string): Promise<void>;
	list(options?: { prefix?: string; cursor?: string }): Promise<{
		keys: { name: string }[];
		list_complete: boolean;
		cursor?: string;
	}>;
}

export interface Env {
	ABONNES: KV;
	ASSETS: { fetch(requete: Request): Promise<Response> };
	VAPID_PUBLIC: string;
	VAPID_PRIVATE: string;
	VAPID_SUBJECT: string;
	NOTIFIER_SECRET: string;
}

type Abonnement = { endpoint: string; keys?: { p256dh: string; auth: string } };

const json = (corps: unknown, status = 200) =>
	new Response(JSON.stringify(corps), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
	});

async function cleAbonne(endpoint: string): Promise<string> {
	const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
	return 'abo:' + [...new Uint8Array(h)].map((o) => o.toString(16).padStart(2, '0')).join('');
}

/** Comparaison en temps constant. */
function egal(a: string, b: string): boolean {
	let ecart = a.length ^ b.length;
	for (let i = 0; i < Math.max(a.length, b.length); i++)
		ecart |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
	return ecart === 0;
}

const endpointValide = (e: unknown): e is string =>
	typeof e === 'string' && /^https:\/\/[^/]+\//.test(e) && e.length < 2048;

export async function notifier(
	env: Env,
	date: string,
	envoyer: typeof fetch = fetch
): Promise<{ envoyes: number; supprimes: number; deja: boolean }> {
	// Une seule notification par édition, même si le déclencheur est relancé.
	if ((await env.ABONNES.get('derniere-notification')) === date)
		return { envoyes: 0, supprimes: 0, deja: true };
	let envoyes = 0;
	let supprimes = 0;
	let cursor: string | undefined;
	do {
		const page = await env.ABONNES.list({ prefix: 'abo:', cursor });
		for (const { name } of page.keys) {
			const abo = JSON.parse((await env.ABONNES.get(name)) ?? 'null') as Abonnement | null;
			if (!abo) continue;
			const r = await envoyer(abo.endpoint, {
				method: 'POST',
				headers: {
					Authorization: await enteteVapid(
						abo.endpoint,
						{ publique: env.VAPID_PUBLIC, privee: env.VAPID_PRIVATE },
						env.VAPID_SUBJECT
					),
					TTL: '3600',
					Urgency: 'normal',
					'Content-Length': '0'
				}
			});
			if (r.ok) envoyes++;
			else if (r.status === 404 || r.status === 410) {
				await env.ABONNES.delete(name);
				supprimes++;
			}
		}
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor);
	await env.ABONNES.put('derniere-notification', date);
	return { envoyes, supprimes, deja: false };
}

export async function traiter(requete: Request, env: Env): Promise<Response> {
	const url = new URL(requete.url);
	if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(requete);

	if (url.pathname === '/api/cle' && requete.method === 'GET')
		return new Response(env.VAPID_PUBLIC, { headers: { 'cache-control': 'no-store' } });

	if (requete.method !== 'POST') return json({ erreur: 'méthode non autorisée' }, 405);

	if (url.pathname === '/api/notifier') {
		const attendu = `Bearer ${env.NOTIFIER_SECRET}`;
		if (!env.NOTIFIER_SECRET || !egal(requete.headers.get('authorization') ?? '', attendu))
			return json({ erreur: 'non autorisé' }, 401);
		const { date } = (await requete.json().catch(() => ({}))) as { date?: string };
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ erreur: 'date attendue' }, 400);
		return json(await notifier(env, date));
	}

	const corps = (await requete.json().catch(() => null)) as Abonnement | null;
	if (!corps || !endpointValide(corps.endpoint))
		return json({ erreur: 'abonnement invalide' }, 400);

	if (url.pathname === '/api/abonner') {
		if (!corps.keys?.p256dh || !corps.keys?.auth) return json({ erreur: 'clés manquantes' }, 400);
		await env.ABONNES.put(
			await cleAbonne(corps.endpoint),
			JSON.stringify({ endpoint: corps.endpoint, keys: corps.keys })
		);
		return json({ ok: true });
	}
	if (url.pathname === '/api/desabonner') {
		await env.ABONNES.delete(await cleAbonne(corps.endpoint));
		return json({ ok: true });
	}
	return json({ erreur: 'introuvable' }, 404);
}

export default {
	fetch: (requete: Request, env: Env) => traiter(requete, env)
};
