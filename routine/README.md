# Routine de 18 h

La routine est une tâche planifiée Claude Code qui lit la collecte du jour et écrit l'édition.

- **Prompt à lui donner** : `Suis les instructions de routine/edition.md.`
- **Dépôt** : `theo33-oss/Regardebien`, branche `main`, avec droit de pousser sur `main`.
- **Horaire** : tous les jours à 18 h, fuseau Europe/Paris.
- **Contrôle** : à chaque exécution, `npm run validate` vérifie le schéma et les règles de fond (`scripts/regles-edition.ts`). Une édition qui ne passe pas ne doit pas être poussée.

Mise en place pas à pas : `docs/GUIDE-MISE-EN-LIGNE.md`, étape « Routine de 18 h ».
