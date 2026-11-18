# Mise en ligne de Cartouche sur GitHub Pages, pas à pas

Tout reste sur GitHub : le code, les données, la collecte, et le site (GitHub Pages). Aucun service tiers.
À chaque étape, la ligne « Vérifier » dit comment savoir que c'est bon.

> Les écrans de GitHub changent de temps en temps : si un nom de menu a bougé, cherche le mot en gras.

## À savoir avant de commencer

- **Le site sera public.** Même si le dépôt reste privé, une page GitHub Pages est lisible par quiconque connaît son adresse. Le contenu (articles collectés, éditions) n'a rien de secret, mais l'adresse ne doit pas être diffusée si tu veux la garder pour toi.
- **Dépôt privé et Pages : compte payant.** Sur un compte GitHub gratuit, GitHub Pages ne fonctionne que pour un dépôt **public**. Avec un compte **GitHub Pro** (ou une organisation payante), il fonctionne aussi pour un dépôt privé. Si ton dépôt est privé et que ton compte est gratuit, l'étape 3 ne proposera pas l'option : il faut alors soit passer le dépôt en public (**Settings → General → Danger Zone → Change visibility**), soit prendre GitHub Pro.
- **Pas de notification de 18 h.** Une notification sur iPhone demande un petit serveur qui garde la liste des appareils abonnés, et GitHub Pages ne sait servir que des pages. Le code du serveur existe (`worker/`) mais il n'est pas utilisé. Tu consultes l'appli (depuis l'icône) à ta convenance. Si tu veux un jour les notifications, il faudra accepter un hébergeur en plus : dis-le-moi.

## 1. Mettre le code sur `main`

Dans GitHub, onglet **Pull requests**, ouvre la pull request en attente, puis **Merge pull request**.
Vérifier : l'onglet **Actions** montre un workflow « Vérification » qui passe au vert.

## 2. Autoriser GitHub à écrire les collectes

**Settings, Actions, General, Workflow permissions** : choisis **Read and write permissions**, puis **Save**.

## 3. Activer GitHub Pages

**Settings, Pages**, rubrique **Build and deployment**, **Source** : choisis **GitHub Actions**.
Vérifier : ensuite, **Actions, Mise en ligne, Run workflow** (branche `main`) : le workflow passe au vert, et son résumé donne l'adresse du site, du type `https://theo33-oss.github.io/Regardebien/`.

Si le workflow échoue avec « Environment protection rules » ou une erreur d'environnement : **Settings, Environments, github-pages**, vérifie que la branche `main` est autorisée à déployer.

## 4. Lancer une première collecte

**Actions, Collecte RSS, Run workflow**. Elle se termine par une mise en ligne automatique (le workflow « Mise en ligne » démarre seul).
Vérifier : après quelques minutes, ouvre l'adresse du site : Cartouche s'affiche avec le Flux.

Les flux RSS qui échouent s'affichent en `ECHEC` dans l'étape « Collecte » : corrige ou retire la ligne dans `config/sources.yaml`.
Ensuite la collecte tourne seule à 7 h, 12 h et 17 h, et chaque collecte remet le site à jour.

## 5. Installer l'appli sur l'iPhone

1. Ouvre l'adresse du site dans **Safari** (pas dans une autre appli).
2. **Partager, Sur l'écran d'accueil, Ajouter**.
3. Ouvre Cartouche **depuis l'icône** de l'écran d'accueil.

L'appli garde en mémoire les 7 dernières éditions : elle s'ouvre aussi sans réseau.

## 6. La routine de 18 h

La routine est une tâche planifiée Claude Code, qui rédige l'édition.

1. Sur claude.ai/code, crée une **tâche planifiée** (« routine ») sur le dépôt `theo33-oss/Regardebien`.
2. Fréquence : tous les jours à **18:00**, fuseau **Europe/Paris**.
3. Instruction : `Suis les instructions de routine/edition.md.`
4. Si l'écran propose d'autoriser les envois sur toutes les branches (option du type « Allow unrestricted branch pushes »), coche-la : l'édition partira directement sur `main`. Sinon ce n'est pas grave : la routine pousse sur sa branche `claude/…` et le workflow « Publication de l'édition » recopie l'édition sur `main` après l'avoir validée, puis relance la mise en ligne.
5. Lance-la une première fois à la main, après la collecte de 17 h (ou après une collecte lancée à la main), puis regarde le résultat.

Vérifier : un fichier `data/editions/AAAA-MM-JJ.json` apparaît sur `main`, le workflow « Mise en ligne » passe au vert, et l'appli affiche l'édition (mode Édition) quelques minutes après 18 h.

## En cas de problème

| Symptôme                                 | À regarder                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| L'option « GitHub Actions » est absente  | Dépôt privé sur compte gratuit : voir « À savoir » en haut                      |
| Le site affiche « 404 »                  | Le workflow « Mise en ligne » n'a jamais réussi : voir l'onglet Actions         |
| Le site affiche toujours le Flux         | L'édition du jour n'est pas encore là : onglet Actions, et la routine           |
| L'édition est sur une branche `claude/…` | Workflow « Publication de l'édition » : une erreur de validation y est affichée |
| Un flux RSS ne remonte rien              | Ligne `ECHEC` du workflow « Collecte RSS » : corriger l'adresse                 |
| Le site n'est pas à jour                 | **Actions, Mise en ligne, Run workflow** pour le reconstruire à la main         |
