# React + Vite

## Configuration locale

Copiez `.env.example` vers `.env.local`, puis remplacez les valeurs d'exemple
par l'URL et la clé anonyme de votre projet Supabase :

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Sans ce fichier, l'interface reste accessible en local, mais les évaluations ne
sont pas enregistrées dans Supabase.

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
npm run test:e2e
```

Les tests lancent un serveur local isolé sans connexion Supabase et vérifient
les réponses longues, le mobile, la cohérence de la synthèse, les erreurs
d'impression et le déclenchement unique depuis le tableau de bord.
Les PDF de contrôle sont écrits dans `test-results/`. Les ouvrir pour contrôler
les marges et les sauts de page ; vérifier également l'aperçu dans Edge/Chrome
avant mise en production. Pour un navigateur Chromium déjà installé, la variable
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permet d'indiquer son chemin.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
