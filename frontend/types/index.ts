// ---------------------------------------------------------------------------
// Types partagés de l'application
// ---------------------------------------------------------------------------

export type ExpenseCategory =
  | "Épiceries"
  | "Loisirs"
  | "Électronique"
  | "Services publics"
  | "Vêtements"
  | "Santé"
  | "Autres";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Épiceries",
  "Loisirs",
  "Électronique",
  "Services publics",
  "Vêtements",
  "Santé",
  "Autres",
];

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // format ISO "YYYY-MM-DD"
  createdAt?: string;
  updatedAt?: string;
}

// Payload envoyé lors de la création / modification d'une dépense
export interface ExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export type PeriodPreset = "last_week" | "last_month" | "last_3_months" | "custom";

export interface PeriodFilter {
  preset: PeriodPreset;
  startDate?: string; // requis si preset === "custom"
  endDate?: string; // requis si preset === "custom"
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Réponse générique paginée / enrichie pour la liste de dépenses
export interface ExpensesResponse {
  expenses: Expense[];
  total: number;
}
