# EMIS Horizons

## Configuration locale

Copiez `.env.example` vers `.env.local`, puis remplacez les valeurs d'exemple
par l'URL et la clé anonyme de votre projet Supabase :

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Sans configuration valide, le mode démo reste accessible. Il est clairement
identifié et ne sauvegarde aucune donnée en ligne.

## Comptes et historique

Le mode connecté utilise Supabase Auth : inscription avec confirmation email,
connexion, récupération du mot de passe et restauration de session. Les rapports
complets sont enregistrés dans `assessment_reports` et isolés par utilisateur
avec les politiques RLS. Les anciennes évaluations anonymes restent à part.

**Avant de déployer ce lot**, suivre le [guide de mise en service](docs/deploiement-comptes-et-rapports.md) : migration SQL, paramétrage Auth, variables Vercel et recette avec deux comptes.

La confirmation de sauvegarde attend le serveur. Les erreurs restent visibles
et une nouvelle tentative réutilise le même identifiant. Les brouillons restent
en mémoire sur la page ; ils ne survivent pas à sa fermeture.

## Rapports et impression

À la fin du parcours, « Terminer et ouvrir le rapport » affiche le document.
« Imprimer / Enregistrer en PDF » ouvre la fenêtre native du navigateur. Choisir
« Enregistrer au format PDF », A4, portrait, échelle 100 %, et désactiver les
en-têtes et pieds de page du navigateur. Les marges A4 sont définies dans
`src/report.css`. Le nom proposé reprend l'identifiant du rapport.

La première partie présente le positionnement ; la projection et le plan
d'action commencent sur une nouvelle page. Les réponses longues peuvent occuper
des pages supplémentaires. Les sauts de ligne saisis sont conservés. Une
modification des réponses impose de régénérer la synthèse avant de finaliser.

### Vérification

```sh
npm ci
npx playwright install chromium
npm run lint
npm run build
npm test
npm run test:e2e
```

`npm test` exécute les migrations dans PostgreSQL embarqué (PGlite), vérifie
l'isolation entre deux utilisateurs et le format des rapports.
Les tests navigateur lancent deux serveurs isolés : démo et mode connecté avec
les réponses réseau Supabase simulées. Aucun compte ni rapport réel n'est créé.
Ils couvrent les parcours d'authentification, les pannes réseau, la sauvegarde
sans doublons, l'historique et l'impression.
Les PDF de contrôle sont écrits dans `test-results/`. Les ouvrir pour contrôler
les marges et les sauts de page ; vérifier également l'aperçu dans Edge/Chrome
avant mise en production. Pour un navigateur Chromium déjà installé, la variable
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permet d'indiquer son chemin.
