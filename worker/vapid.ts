// Identification VAPID (RFC 8292) pour le Web Push, avec la seule API WebCrypto.
// Les notifications sont envoyées sans contenu : pas de chiffrement de message à gérer.

const base64url = (octets: ArrayBuffer | Uint8Array): string =>
	btoa(String.fromCharCode(...new Uint8Array(octets)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

const texteVersBase64url = (s: string) => base64url(new TextEncoder().encode(s));

export type ClesVapid = {
	/** Clé publique (65 octets, base64url) : donnée aux navigateurs. */
	publique: string;
	/** Clé privée au format JWK, en JSON : secret, jamais dans le dépôt. */
	privee: string;
};

export async function genererCles(): Promise<ClesVapid> {
	const paire = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
		'sign',
		'verify'
	]);
	return {
		publique: base64url(await crypto.subtle.exportKey('raw', paire.publicKey)),
		privee: JSON.stringify(await crypto.subtle.exportKey('jwk', paire.privateKey))
	};
}

/** En-tête Authorization pour un envoi vers `endpoint` (valable 12 h). */
export async function enteteVapid(
	endpoint: string,
	cles: ClesVapid,
	sujet: string,
	maintenant = Date.now()
): Promise<string> {
	const jeton =
		texteVersBase64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' })) +
		'.' +
		texteVersBase64url(
			JSON.stringify({
				aud: new URL(endpoint).origin,
				exp: Math.floor(maintenant / 1000) + 12 * 3600,
				sub: sujet
			})
		);
	const cle = await crypto.subtle.importKey(
		'jwk',
		JSON.parse(cles.privee),
		{ name: 'ECDSA', namedCurve: 'P-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign(
		{ name: 'ECDSA', hash: 'SHA-256' },
		cle,
		new TextEncoder().encode(jeton)
	);
	return `vapid t=${jeton}.${base64url(signature)}, k=${cles.publique}`;
}
