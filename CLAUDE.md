# Cartouche

Web-app d'actualités (PWA iPhone) : une édition quotidienne vers 18h, croisant de nombreuses sources, la plus objective possible. Deux modes : Flux (RSS, sans IA) et Édition (rédigée par une routine Claude). Propriétaire : Théo, ingénieur mécanique, pas développeur web. Cahier des charges complet : `docs/SPEC.md`.

## Commandes

- `npm run dev` : serveur local
- `npm run build` : build statique
- `npm run check` : svelte-check (types)
- `npm run lint` : prettier + eslint
- `npm test` : Vitest
- `npm run validate` : valide config/ et data/ contre les schémas zod
- `npm run index` : régénère data/index.json (jamais à la main)
- `npm run collect` : collecte RSS (écrit data/raw/) ; `npm run donnees` : copie data/ vers static/data (fait seul par dev et build)
- `npm run vapid` : génère les clés des notifications (à ne jamais committer)

## Arborescence

- `config/` : sources.yaml, rubriques.yaml, saisons.yaml
- `data/raw/` collectes ; `data/editions/` éditions ; `data/index.json` généré
- `scripts/` : collecte et outils Node (tsx)
- `routine/` : prompts de la routine de 18h
- `src/lib/schema/` : schémas zod et types, partagés appli et scripts
- `src/routes/` : l'appli SvelteKit (Svelte 5, adapter-static) ; `src/sw.ts` : service worker
- `worker/` : worker Cloudflare (abonnements et envoi des notifications) ; `wrangler.jsonc` : config de mise en ligne
- `docs/` : SPEC.md, GUIDE-MISE-EN-LIGNE.md, RECETTE.md

## Règles de travail

- Fais seulement ce que demande le lot en cours. Aucune fonctionnalité, page ou abstraction en plus.
- Demande avant d'ajouter une dépendance non prévue, de supprimer un fichier ou de modifier un schéma zod existant.
- Aucun secret dans le code ou les commits : variables d'environnement et secrets GitHub ou Cloudflare, documentés par leur nom.
- Commits petits, messages en français.
- Après chaque étape, une ligne : ce qui est fait et la commande qui le prouve.
- Un fait clé porte toujours un niveau (confirme, source_unique, conteste, officiel) et ses URL. Une dépêche reprise par plusieurs médias compte pour une seule source.
- Tout le contenu affiché est en français. Pas de code visuel « IA ».
