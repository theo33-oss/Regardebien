# Cartouche, cahier des charges

« Cartouche » (nom de travail) est une web-app installée sur l'écran d'accueil d'un iPhone (PWA), lisible aussi sur ordinateur. Chaque jour vers 18h (heure de Paris), elle présente une édition des actualités de la journée, construite en croisant de nombreuses sources pour être la plus objective possible. Théo, le propriétaire, est ingénieur mécanique, à l'aise avec GitHub Desktop mais pas développeur web : toujours la solution la plus simple et la plus robuste.

## Modes

1. **Flux** (gratuit, sans IA) : articles collectés par RSS à 7h, 12h et 17h, regroupés par rubrique et par sujet, avec liens vers les sources.
2. **Édition** : une routine Claude Code planifiée à 18h lit la collecte du jour, regroupe par sujet, rédige une synthèse neutre, les angles de chaque média et le niveau de confirmation des faits.

Un interrupteur dans l'appli choisit le mode. Si l'édition du jour manque ou est invalide, l'appli bascule seule sur Flux avec une mention discrète.

## Rubriques (config/rubriques.yaml)

- **Aéronautique et spatial** : spatial et lanceurs, aviation civile, aviation militaire, vie des entreprises (contrats, levées de fonds, embauches, nouvelles usines).
- **Défense** : défense française (armées, opérations, LPM, budget), conflits et géopolitique, industrie de défense.
- **Culture** : seulement les grands sujets du moment, 2 à 4 sujets.
- **Technique** : ingénierie et industrie (mécanique, matériaux, fabrication), sciences.
- **Intelligence artificielle** : modèles et annonces, usages en ingénierie et industrie, régulation.
- **Politique** (saisonnière) : affichée d'office pendant les périodes de config/saisons.yaml, réglage Auto / Toujours / Jamais qui l'emporte. Première période : présidentielle 2027, du 12 mars au 16 mai 2027 (1er tour le 18 avril, 2nd tour le 2 mai). France en priorité, international pour les grandes échéances.

Un sujet n'apparaît que dans une rubrique principale, avec des étiquettes secondaires (ex. export de Rafale : rubrique Défense, étiquette Aéronautique).

## Objectivité

- Synthèse factuelle neutre, puis les angles : ce que chaque média ou groupe de médias met en avant, et les divergences.
- Chaque fait clé porte un niveau : `confirme` (au moins 2 sources indépendantes ; les reprises d'une même dépêche AFP, Reuters ou AP comptent pour une seule), `source_unique`, `conteste` (sources contradictoires), `officiel` (communiqué ou document primaire).
- Sources : médias français de sensibilités différentes, agences, presse étrangère, presse spécialisée. Tout est rédigé en français.

## Lecture

- 3 niveaux : (1) titre + 2 lignes, (2) synthèse complète et faits clés, (3) vue de détail avec angles, divergences et toutes les sources.
- Sélecteur de temps : 2 min (5 sujets les plus importants, toutes rubriques), 10 min (15 sujets), Tout.
- Archive des éditions passées ; lecture hors-ligne des 7 dernières.
- Notification à 18h avec 2 ou 3 titres, désactivable dans les réglages.

## Direction visuelle « Carnet technique »

Plan d'ingénieur, papier calque et grille millimétrée, cartouche de plan en en-tête (n° d'édition, date, heure), typographie technique, traits qui se dessinent, cotes qui apparaissent. Aucun code visuel « IA ». Détaillée au lot 2.

## Technique

- SvelteKit + Svelte 5 + TypeScript, adapter-static avec page de repli (`200.html`) pour les routes dynamiques. Transitions intégrées, dont `draw` pour les tracés SVG.
- PWA avec @vite-pwa/sveltekit (lot 5).
- Données : JSON versionnés dans `data/`, validés par les schémas zod de `src/lib/schema/`, partagés entre l'appli et les scripts. `data/index.json` est toujours régénéré par `npm run index`, jamais écrit à la main.
- Collecte : scripts Node TypeScript (tsx) lancés par GitHub Actions ; sources dans `config/sources.yaml`.
- Hébergement : Cloudflare, offre gratuite, compatible dépôt privé, déploiement à chaque push sur main. Au lot 6, vérifier dans la doc Cloudflare actuelle s'il faut Workers (assets statiques) ou Pages.
- Notifications : Web Push (VAPID) via une fonction Cloudflare et un espace KV pour les abonnements (lot 5).
- npm, Node LTS, dépôt privé.

## Modèle de données (src/lib/schema/index.ts)

| Type             | Rôle                                   | Champs principaux                                                                                                         |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Source`         | Un flux RSS                            | id, nom, url_flux, type (media_fr, agence, presse_etrangere, specialisee), sensibilite, langue, rubriques, agence_origine |
| `ArticleBrut`    | Un article collecté                    | id, source_id, media, titre, url, publie_le, resume, langue, rubrique_suggeree, agence_origine                            |
| `GroupeArticles` | Articles d'un même sujet (mode Flux)   | rubrique, titre, article_ids                                                                                              |
| `CollecteDuJour` | Une collecte (07h, 12h ou 17h)         | date, creneau, collecte_le, exemple, articles, groupes                                                                    |
| `Fait`           | Un fait clé                            | texte, niveau, sources (URL)                                                                                              |
| `Angle`          | Ce que met en avant un média ou groupe | medias, texte, sources (URL)                                                                                              |
| `Sujet`          | Un sujet de l'édition                  | id, rubrique, etiquettes, titre, resume_court, synthese, faits, angles, divergences, sources, importance (0 à 100)        |
| `Edition`        | L'édition du jour                      | date, numero, genere_le, modele, mode (normal ou degrade), exemple, rubriques_actives, sujets                             |
| `Index`          | Table des matières, générée            | genere_le, editions (date, numero, fichier, mode, titres), collectes                                                      |

Fichiers : `data/raw/AAAA-MM-JJ-HHh.json`, `data/editions/AAAA-MM-JJ.json`. Les fichiers `exemple.json` portent `exemple: true` et sont ignorés par l'index.

## Plan des lots

0 fondations · 1 sources et collecte RSS · 2 design · 3 écrans et modes de lecture · 4 édition rédigée par Claude · 5 PWA, hors-ligne, notifications · 6 mise en ligne, recette, guides.
