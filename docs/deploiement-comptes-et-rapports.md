# Mise en service des comptes et rapports privés

Ce lot remplace la connexion simulée et la sauvegarde anonyme partielle par
Supabase Auth et une table de rapports complets, `public.assessment_reports`.
La migration SQL doit être appliquée avant le déploiement du nouveau front-end.

## 1. Préparer la base Supabase

Faire une sauvegarde ou un export de la table `public.evaluations` existante.
Dans le SQL Editor du **projet Supabase utilisé par EMIS Horizons**, exécuter le
contenu complet de :

`supabase/migrations/20260930164234_private_assessment_reports.sql`

La migration est transactionnelle et réexécutable. Elle :

- crée `assessment_reports`, ses contraintes, son index et ses politiques RLS ;
- autorise un utilisateur connecté à lire, créer et mettre à jour ses propres rapports ;
- calcule le score et le quadrant en base, sans accepter ceux envoyés par le navigateur ;
- interdit la modification de la date de création par les clients ;
- ferme les accès publics à `evaluations`, sans supprimer ni réattribuer ses lignes ;
- conserve aux opérateurs disposant de droits administratifs l'accès aux données historiques.

Les anciens rapports ne peuvent pas être rattachés de façon fiable à un compte :
ils ne comportaient pas de propriétaire. Ils ne sont donc pas affichés dans le
nouvel historique. Aucune réattribution automatique n'est effectuée.

La fermeture des insertions anonymes empêche les anciennes versions de
l'application d'envoyer des données. Coordonner migration et déploiement.
Ne pas rétablir la politique publique `WITH CHECK (true)` en cas de retour arrière.
Conserver la nouvelle table et proposer temporairement le mode démo si nécessaire.

### Base neuve / migrations CLI

Le fichier `20260721000000_legacy_evaluations_baseline.sql` crée uniquement une
table historique absente, afin de rendre la chaîne des anciennes migrations
rejouable sur une base neuve. Il ne modifie pas une table déjà existante.

Pour une base gérée avec la CLI Supabase, examiner d'abord l'historique distant
et le résultat d'une simulation avant toute application. Sur le projet EMIS
existant, les anciennes migrations de base et de restriction ne sont pas toutes
inscrites dans l'historique, bien que leur état ait été vérifié avant la migration
privée. Réconcilier cet historique avant un prochain `db push`.
**Ne pas rejouer les anciennes politiques publiques avec `--include-all` sur une
base déjà migrée** : cela pourrait rétablir les insertions anonymes alors que la
migration privée serait ignorée car déjà enregistrée.

### État vérifié le 30 septembre 2026

- Projet cible confirmé par l'URL Supabase intégrée au site Vercel.
- Export des sept évaluations historiques et de leurs droits effectué avant migration.
- Migration privée appliquée, version distante `20260930164234`, identique au fichier du dépôt.
- Sept anciennes évaluations conservées ; table privée prête, sans rapport réel.
- Tests transactionnels sur la base hébergée : lecture et écriture du propriétaire,
  score calculé, refus de réattribution et de modification de date, isolation d'un
  second compte et refus de lecture anonyme. Toutes les données de test annulées.
- Diagnostic Supabase : aucune alerte de sécurité WARN/ERROR ; information attendue
  sur `evaluations`, dont les accès clients sont volontairement fermés.
- Auth public : Email/Password et inscriptions activés ; confirmation email requise.
- À vérifier avant fusion : URL du site et retours, longueur minimale côté serveur,
  configuration SMTP et réception réelle des messages. Ces réglages ne sont pas
  accessibles via les actions du plugin disponibles dans cette session.
- La version publique actuelle fonctionne encore comme une démo : ses anciennes
  écritures anonymes sont désormais refusées. La nouvelle version reste en PR.

## 2. Activer et configurer l'authentification

Dans Supabase Auth :

- activer la connexion Email/Password ;
- activer la confirmation de l'adresse email ;
- définir une longueur minimale de mot de passe de 12 caractères côté service ;
- définir l'URL du site : `https://emis-horizons.vercel.app` ;
- autoriser les URL de retour exactes :
  - `https://emis-horizons.vercel.app`
  - `https://emis-horizons.vercel.app/?mode=recovery`
- ajouter séparément les URL d'un environnement de test si celui-ci est utilisé ;
- configurer et tester un service SMTP adapté aux comptes réels, puis vérifier
  la réception des confirmations et des liens de réinitialisation.

L'application utilise les événements de session du SDK. Le retour d'un lien de
récupération ouvre l'écran de choix du nouveau mot de passe. Une adresse non
confirmée ne peut pas se connecter si la confirmation est activée côté Supabase.

## 3. Vérifier les variables Vercel puis déployer

Conserver les noms suivants, pour le bon environnement :

```text
VITE_SUPABASE_URL=https://<projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<cle-publique-anon-ou-publishable>
```

Ces variables sont publiques et intégrées au JavaScript lors du build. Ne jamais
y placer une clé `service_role`, une clé secrète ou le mot de passe PostgreSQL.
Les politiques RLS assurent le contrôle d'accès, pas le caractère secret de la clé publique.

Après la migration et le paramétrage Auth, fusionner la PR puis vérifier le
déploiement Vercel de ce commit. Un changement de variable nécessite un nouveau
build. Sans configuration valide, seul le mode démo est utilisable.

## 4. Recette réelle après déploiement

| Contrôle | Résultat attendu |
|---|---|
| Créer le compte A et confirmer l'email | Connexion possible après confirmation |
| Mot de passe incorrect | Accès refusé, message explicite |
| Générer un rapport | Message d'enregistrement seulement après réponse de la base |
| Recharger et rouvrir le rapport | Sujet, sous-scores, plan et synthèse retrouvés |
| Se déconnecter puis ouvrir le compte B | Aucun rapport du compte A affiché |
| Couper le réseau pendant la sauvegarde | Réponses conservées sur la page, erreur visible |
| Rétablir le réseau et réessayer | Un seul rapport pour cette exploration |
| Demander un nouveau mot de passe | Email reçu, lien utilisable, mot de passe mis à jour |
| Se déconnecter avec deux onglets ouverts | Les vues privées se ferment dans les deux onglets |
| Essayer la démo | Aucune ligne créée dans `assessment_reports` |
| Imprimer un rapport retrouvé | Rapport A4 complet |

## 5. Validation automatisée et limites

`npm test` utilise PostgreSQL embarqué (PGlite), avec les rôles et `auth.uid()`
simulés. Les tests exécutent les vraies migrations et tentent des lectures,
insertions et mises à jour entre deux propriétaires. Ils vérifient aussi les
contraintes et la conservation des données historiques.

`npm run test:e2e` utilise le vrai SDK Supabase dans le navigateur, avec son réseau
intercepté par un service simulé. Aucun utilisateur ni rapport de production
n'est créé. Les parcours de connexion, confirmation, récupération, sauvegarde,
reconnexion, pagination, révocation de session et impression sont couverts.

Ces tests ne certifient pas le paramétrage du projet Supabase hébergé, l'envoi
SMTP ou les variables Vercel. La recette ci-dessus reste nécessaire sur le service réel.

Les brouillons ne sont pas persistés. Un avertissement est affiché avant de
quitter une exploration, mais fermer un onglet ou perdre sa session peut faire
perdre un travail non enregistré. Les rapports confirmés restent en base.
Ce lot ne comprend ni gestion multi-organisation, ni facturation, ni procédure
complète d'exercice des droits ou de conservation des données.
