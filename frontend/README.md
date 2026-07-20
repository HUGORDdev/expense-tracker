# Suivi des Dépenses — Frontend (Next.js)

Frontend complet pour l'API de suivi des dépenses (Express.js + Bun), construit avec
Next.js 14 (App Router), TypeScript et Tailwind CSS.

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner NEXT_PUBLIC_API_URL
npm run dev
```

## Architecture

```
app/
  layout.tsx           Layout racine + AuthProvider
  page.tsx             Redirection vers /dashboard
  login/page.tsx        Page de connexion
  register/page.tsx     Page d'inscription
  dashboard/
    layout.tsx           Protection client-side + Navbar
    page.tsx             Orchestration du dashboard (filtres, liste, modals)
components/
  Navbar.tsx
  PeriodFilter.tsx       Filtres de période (semaine/mois/3 mois/personnalisé)
  SummaryCards.tsx       Cartes de résumé (total, top catégorie, nb transactions)
  ExpenseList.tsx        Tableau/liste des dépenses + actions
  ExpenseForm.tsx        Formulaire d'ajout/modification (réutilisé)
  Modal.tsx              Modal générique
  ConfirmDialog.tsx      Confirmation de suppression
context/
  AuthContext.tsx        Contexte global (user, login, register, logout)
services/
  authService.ts         login / register / logout / fetchCurrentUser (mocks)
  expenseService.ts       getExpenses / createExpense / updateExpense / deleteExpense (mocks)
utils/
  api.ts                 Wrapper fetch : injection JWT + gestion 401
types/
  index.ts                Types partagés (Expense, User, PeriodFilter...)
middleware.ts             Protection des routes côté serveur (cookie JWT)
```

## Authentification JWT

- Le token est stocké **à la fois** en cookie (lu par `middleware.ts` côté serveur)
  et en `localStorage` (lecture rapide côté client).
- `utils/api.ts` (`apiFetch`) injecte automatiquement `Authorization: Bearer <token>`
  sur chaque requête protégée, et redirige vers `/login?expired=1` si l'API renvoie 401.
- `middleware.ts` bloque l'accès à `/dashboard/*` si aucun cookie de token n'est présent,
  et empêche l'accès à `/login` / `/register` si l'utilisateur est déjà connecté.
- `context/AuthContext.tsx` restaure la session au chargement de l'app (persistance).

## Connecter votre backend Express/Bun

Toutes les fonctions à brancher sont marquées par un commentaire
`// TODO: Connecter à l'API Express/Bun (...)` dans :

- `services/authService.ts` → `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout`
- `services/expenseService.ts` → `GET /expenses`, `POST /expenses`, `PUT /expenses/:id`, `DELETE /expenses/:id`

Il suffit de :
1. Définir `NEXT_PUBLIC_API_URL` dans `.env.local`.
2. Décommenter le bloc `apiFetch(...)` dans chaque fonction et supprimer le bloc mocké.

## Catégories de dépenses

`Épiceries`, `Loisirs`, `Électronique`, `Services publics`, `Vêtements`, `Santé`, `Autres`
(définies dans `types/index.ts` → `EXPENSE_CATEGORIES`).
