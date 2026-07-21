import { apiFetch } from "@/utils/api";
import type {
  Expense,
  ExpenseInput,
  ExpensesResponse,
  PeriodFilter,
} from "@/types";

// ---------------------------------------------------------------------------
// Service de gestion des dépenses.
// Fonctionne actuellement sur un jeu de données mocké en mémoire pour que
// le Dashboard soit utilisable instantanément. Chaque fonction indique
// l'appel réel à effectuer une fois le backend Express/Bun disponible.
// ---------------------------------------------------------------------------

function fakeDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Jeu de données factice conservé en mémoire (réinitialisé au rechargement de page)
let mockExpenses: Expense[] = [
  { id: "1", title: "Courses Carrefour", amount: 68.5, category: "Épiceries", date: isoDaysAgo(2) },
  { id: "2", title: "Cinéma", amount: 24, category: "Loisirs", date: isoDaysAgo(4) },
  { id: "3", title: "Écouteurs Bluetooth", amount: 89.99, category: "Électronique", date: isoDaysAgo(8) },
  { id: "4", title: "Facture électricité", amount: 120, category: "Services publics", date: isoDaysAgo(10) },
  { id: "5", title: "T-shirt", amount: 19.9, category: "Vêtements", date: isoDaysAgo(15) },
  { id: "6", title: "Pharmacie", amount: 32.4, category: "Santé", date: isoDaysAgo(20) },
  { id: "7", title: "Abonnement streaming", amount: 13.49, category: "Loisirs", date: isoDaysAgo(28) },
  { id: "8", title: "Courses Monoprix", amount: 54.2, category: "Épiceries", date: isoDaysAgo(35) },
  { id: "9", title: "Réparation vélo", amount: 45, category: "Autres", date: isoDaysAgo(50) },
  { id: "10", title: "Chargeur téléphone", amount: 22.5, category: "Électronique", date: isoDaysAgo(70) },
];

/** Calcule la borne [startDate, endDate] correspondant au preset choisi. */
export function resolvePeriodRange(filter: PeriodFilter): { start: string; end: string } {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);

  if (filter.preset === "custom") {
    return {
      start: filter.startDate || isoDaysAgo(30),
      end: filter.endDate || end,
    };
  }

  const daysMap: Record<Exclude<PeriodFilter["preset"], "custom">, number> = {
    last_week: 7,
    last_month: 30,
    last_3_months: 90,
  };

  return { start: isoDaysAgo(daysMap[filter.preset]), end };
}

export async function getExpenses(filter: PeriodFilter): Promise<ExpensesResponse> {
  // --- MOCK (à supprimer une fois l'API branchée) ---
  const { start, end } = resolvePeriodRange(filter);
  return apiFetch<ExpensesResponse>(`/api/expenses?start=${start}&end=${end}`);
  // --- APPEL RÉEL ---
  // TODO: Connecter à l'API Express/Bun (GET /api/expenses?start=...&end=...)
}

export async function createExpense(data: ExpenseInput): Promise<Expense> {
  // --- APPEL RÉEL ---
  // TODO: Connecter à l'API Express/Bun (POST /api/expenses)
  return apiFetch<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(data) });
}

export async function updateExpense(id: string, data: ExpenseInput): Promise<Expense> {
  // --- APPEL RÉEL ---
  // TODO: Connecter à l'API Express/Bun (PUT /api/expenses/:id)
  return apiFetch<Expense>(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteExpense(id: string): Promise<void> {
  // --- MOCK ---
  mockExpenses = mockExpenses.filter((e) => e.id !== id);
  return fakeDelay(undefined);

  // --- APPEL RÉEL ---
  // TODO: Connecter à l'API Express/Bun (DELETE /api/expenses/:id)
  // return apiFetch<void>(`/expenses/${id}`, { method: "DELETE" });
}
