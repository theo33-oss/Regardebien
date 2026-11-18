# Mise en ligne de Cartouche, pas à pas

Tout est gratuit. Compte à prévoir : GitHub (déjà fait), Cloudflare, et ton compte Claude pour la routine de 18 h.
À chaque étape, la ligne « Vérifier » dit comment savoir que c'est bon.

> Les écrans de Cloudflare et de GitHub changent de temps en temps : si un nom de menu a bougé, cherche le mot en gras.

## 1. Mettre le code sur `main`

Dans GitHub, onglet **Pull requests**, ouvre la pull request en attente, puis **Merge pull request**.
Vérifier : l'onglet **Actions** montre un workflow « Vérification » qui passe au vert.

## 2. Autoriser GitHub à écrire les collectes

**Settings, Actions, General, Workflow permissions** : choisis **Read and write permissions**, puis **Save**.
Vérifier : **Actions, Collecte RSS, Run workflow** crée un fichier `data/raw/…` dans le dépôt.

Les flux RSS qui échouent s'affichent en `ECHEC` dans l'étape « Collecte » : corrige ou retire la ligne dans `config/sources.yaml`.

## 3. Cloudflare : publier le site

1. Crée un compte sur cloudflare.com (offre gratuite).
2. **Workers & Pages, Create, Import a repository** (ou « Connect to Git ») : autorise GitHub, choisis le dépôt `Regardebien` (privé, c'est possible).
3. Nom du projet : `cartouche`. Branche : `main`.
4. **Build command** : `npm run build`. **Deploy command** : `npx wrangler deploy`. Laisse le reste par défaut.
5. Lance le premier déploiement. Il échoue tant que l'étape 4 n'est pas faite (espace KV) : c'est normal.

Cloudflare indique l'adresse du site, du type `https://cartouche.xxxx.workers.dev`. Note-la : c'est ton `SITE_URL`.

> Le projet utilise **Workers avec fichiers statiques** (et non Pages), parce que le site a besoin d'un petit programme pour les notifications. Si Cloudflare propose un autre assistant au moment où tu fais ça, dis-le-moi avant d'aller plus loin.

## 4. L'espace KV (liste des abonnés aux notifications)

1. Cloudflare : **Storage & databases, KV, Create** : nom `cartouche-abonnes`.
2. Copie l'**ID** de l'espace.
3. Dans GitHub, ouvre le fichier `wrangler.jsonc`, crayon (modifier), remplace `REMPLACER_PAR_L_ID_DE_L_ESPACE_KV` par l'ID, puis **Commit changes** sur `main`.

Vérifier : Cloudflare redéploie seul, et le déploiement réussit. Ouvre l'adresse du site : Cartouche s'affiche.

## 5. Les clés des notifications

Les notifications ont besoin d'une paire de clés (publique et secrète) et d'un mot de passe partagé entre GitHub et Cloudflare.

1. Sur ton ordinateur, installe Node.js (version LTS, nodejs.org), puis dans GitHub Desktop : **Repository, Open in Command Prompt**, et lance :
   `npm ci` puis `npm run vapid`.
   La commande affiche `VAPID_PUBLIC` et `VAPID_PRIVATE`. Ne les colle nulle part ailleurs que dans les champs ci-dessous.
2. Invente un mot de passe long (30 caractères au hasard) : ce sera `NOTIFIER_SECRET`.
3. Cloudflare, ton Worker `cartouche`, **Settings, Variables and Secrets, Add** :

   | Nom               | Type       | Valeur                                                       |
   | ----------------- | ---------- | ------------------------------------------------------------ |
   | `VAPID_PUBLIC`    | Texte      | la clé publique affichée                                     |
   | `VAPID_SUBJECT`   | Texte      | l'adresse du site (`https://cartouche.xxxx.workers.dev`)     |
   | `VAPID_PRIVATE`   | **Secret** | la clé privée affichée (toute la ligne qui commence par `{`) |
   | `NOTIFIER_SECRET` | **Secret** | ton mot de passe long                                        |

4. GitHub, **Settings, Secrets and variables, Actions** :
   - onglet **Secrets, New repository secret** : `NOTIFIER_SECRET` = le même mot de passe ;
   - onglet **Variables, New repository variable** : `SITE_URL` = l'adresse du site (sans `/` à la fin).

Vérifier : ouvre `https://<ton-site>/api/cle` dans un navigateur : une longue suite de lettres s'affiche.

## 6. La routine de 18 h

La routine est une tâche planifiée Claude Code, qui rédige l'édition.

1. Sur claude.ai/code, crée une **tâche planifiée** (« routine ») sur le dépôt `theo33-oss/Regardebien`, branche `main`, avec l'autorisation de pousser sur `main`.
2. Fréquence : tous les jours à **18:00**, fuseau **Europe/Paris**.
3. Instruction : `Suis les instructions de routine/edition.md.`
4. Lance-la une première fois à la main après une collecte, puis regarde le résultat.

Vérifier : un fichier `data/editions/AAAA-MM-JJ.json` apparaît dans le dépôt, le site affiche l'édition, et le workflow « Notification de 18 h » passe au vert.

## 7. Sur l'iPhone

1. Ouvre l'adresse du site dans **Safari** (pas dans une autre appli).
2. **Partager, Sur l'écran d'accueil, Ajouter**.
3. Ouvre Cartouche **depuis l'icône** de l'écran d'accueil.
4. **Réglages, Notification de 18 h, Activer**, puis accepte la demande de l'iPhone.

Les notifications ne marchent que dans l'appli installée (limite d'iOS).

## En cas de problème

| Symptôme                         | À regarder                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Le site affiche toujours le Flux | L'édition du jour n'est pas encore là : voir l'onglet Actions et la routine   |
| Pas de notification              | Workflow « Notification de 18 h » : message d'erreur ; variables de l'étape 5 |
| Le déploiement Cloudflare échoue | `wrangler.jsonc` : l'ID du KV est-il remplacé ?                               |
| Un flux RSS ne remonte rien      | Ligne `ECHEC` du workflow « Collecte RSS » : corriger l'adresse               |
