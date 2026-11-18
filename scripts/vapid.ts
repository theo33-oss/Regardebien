import { genererCles } from '../worker/vapid.js';

// Génère une paire de clés VAPID pour les notifications. À lancer une seule fois.
const { publique, privee } = await genererCles();
console.log('Clés VAPID générées. Ne les mets JAMAIS dans le dépôt.\n');
console.log('VAPID_PUBLIC  (variable Cloudflare, non secrète) :\n' + publique + '\n');
console.log('VAPID_PRIVATE (secret Cloudflare) :\n' + privee + '\n');
console.log('Voir docs/GUIDE-MISE-EN-LIGNE.md, étape « Notifications ».');
