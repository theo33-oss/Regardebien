// Appli entièrement côté navigateur : les données sont lues dans /data au chargement.
// Seules les pages sans paramètre sont pré-rendues (coquille vide) ; le reste passe par 200.html.
export const ssr = false;
export const prerender = 'auto';
