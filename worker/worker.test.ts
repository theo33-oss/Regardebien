import { describe, expect, it } from 'vitest';
import { traiter, type Env, type KV } from './index.js';
import { enteteVapid, genererCles } from './vapid.js';

function faux(): KV & { donnees: Map<string, string> } {
	const donnees = new Map<string, string>();
	return {
		donnees,
		get: async (c) => donnees.get(c) ?? null,
		put: async (c, v) => void donnees.set(c, v),
		delete: async (c) => void donnees.delete(c),
		list: async ({ prefix = '' } = {}) => ({
			keys: [...donnees.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })),
			list_complete: true
		})
	};
}
async function environnement(): Promise<Env & { kv: ReturnType<typeof faux> }> {
	const cles = await genererCles();
	const kv = faux();
	return {
		kv,
		ABONNES: kv,
		ASSETS: { fetch: async () => new Response('statique') },
		VAPID_PUBLIC: cles.publique,
		VAPID_PRIVATE: cles.privee,
		VAPID_SUBJECT: 'mailto:test@example.invalid',
		NOTIFIER_SECRET: 'secret'
	};
}
const post = (chemin: string, corps: unknown, entetes: Record<string, string> = {}) =>
	new Request(`https://cartouche.example${chemin}`, {
		method: 'POST',
		body: JSON.stringify(corps),
		headers: entetes
	});
const abo = (n: number) => ({
	endpoint: `https://push.example/abo/${n}`,
	keys: { p256dh: 'p', auth: 'a' }
});

describe('VAPID', () => {
	it('signe un jeton ES256 vérifiable avec la clé publique', async () => {
		const cles = await genererCles();
		const entete = await enteteVapid('https://push.example/abo/1', cles, 'mailto:a@b.invalid');
		const [, jeton, k] = /^vapid t=([^,]+), k=(.+)$/.exec(entete) ?? [];
		expect(k).toBe(cles.publique);
		const [h, c, s] = jeton.split('.');
		const octets = (b64: string) =>
			Uint8Array.from(atob(b64.replace(/-/g, '+').replace(/_/g, '/')), (x) => x.charCodeAt(0));
		expect(JSON.parse(new TextDecoder().decode(octets(c))).aud).toBe('https://push.example');
		const pub = await crypto.subtle.importKey(
			'raw',
			octets(cles.publique),
			{ name: 'ECDSA', namedCurve: 'P-256' },
			false,
			['verify']
		);
		const ok = await crypto.subtle.verify(
			{ name: 'ECDSA', hash: 'SHA-256' },
			pub,
			octets(s),
			new TextEncoder().encode(`${h}.${c}`)
		);
		expect(ok).toBe(true);
	});
});

describe('API', () => {
	it('abonne et désabonne', async () => {
		const env = await environnement();
		expect((await traiter(post('/api/abonner', abo(1)), env)).status).toBe(200);
		expect(env.kv.donnees.size).toBe(1);
		await traiter(post('/api/desabonner', { endpoint: abo(1).endpoint }), env);
		expect(env.kv.donnees.size).toBe(0);
	});
	it('refuse un abonnement non https', async () => {
		const env = await environnement();
		const r = await traiter(
			post('/api/abonner', { endpoint: 'http://x/', keys: abo(1).keys }),
			env
		);
		expect(r.status).toBe(400);
	});
	it('refuse /api/notifier sans le bon secret', async () => {
		const env = await environnement();
		expect((await traiter(post('/api/notifier', { date: '2026-11-18' }), env)).status).toBe(401);
		const mauvais = post('/api/notifier', { date: '2026-11-18' }, { authorization: 'Bearer faux' });
		expect((await traiter(mauvais, env)).status).toBe(401);
	});
	it('sert les fichiers statiques hors /api', async () => {
		const env = await environnement();
		const r = await traiter(new Request('https://cartouche.example/archive'), env);
		expect(await r.text()).toBe('statique');
	});
	it('envoie à tous, supprime les abonnements expirés, une seule fois par édition', async () => {
		const env = await environnement();
		for (const n of [1, 2]) await traiter(post('/api/abonner', abo(n)), env);
		const appels: string[] = [];
		const { notifier } = await import('./index.js');
		const envoyer = (async (url: string, init: RequestInit) => {
			appels.push(url);
			expect((init.headers as Record<string, string>).Authorization).toMatch(/^vapid t=/);
			return new Response(null, { status: url.endsWith('/2') ? 410 : 201 });
		}) as unknown as typeof fetch;
		expect(await notifier(env, '2026-11-18', envoyer)).toEqual({
			envoyes: 1,
			supprimes: 1,
			deja: false
		});
		expect(env.kv.donnees.has('abo:' + [...env.kv.donnees.keys()][0].slice(4))).toBe(true);
		expect(await notifier(env, '2026-11-18', envoyer)).toEqual({
			envoyes: 0,
			supprimes: 0,
			deja: true
		});
		expect(appels).toHaveLength(2);
	});
});
