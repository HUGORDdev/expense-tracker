"use client";

import { Pencil, Trash2, Inbox } from "lucide-react";
import type { Expense } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  "Épiceries": "bg-emerald-500/10 text-emerald-400",
  "Loisirs": "bg-fuchsia-500/10 text-fuchsia-400",
  "Électronique": "bg-sky-500/10 text-sky-400",
  "Services publics": "bg-amber-500/10 text-amber-400",
  "Vêtements": "bg-rose-500/10 text-rose-400",
  "Santé": "bg-red-500/10 text-red-400",
  "Autres": "bg-zinc-500/10 text-zinc-400",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

export default function ExpenseList({ expenses, isLoading, onEdit, onDelete }: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="card space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-800/60" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-14 text-center">
        <Inbox className="text-zinc-600" size={32} />
        <p className="text-sm font-medium text-zinc-300">Aucune dépense sur cette période</p>
        <p className="text-xs text-zinc-500">
          Ajoutez une dépense ou choisissez une autre période de filtrage.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden !p-0">
      {/* En-tête visible uniquement en desktop */}
      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-zinc-800 px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:grid">
        <span>Titre</span>
        <span>Catégorie</span>
        <span>Date</span>
        <span className="text-right">Montant</span>
        <span className="text-right">Actions</span>
      </div>

      <ul className="divide-y divide-zinc-800">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="grid grid-cols-2 gap-3 px-5 py-4 transition hover:bg-zinc-800/30 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4"
          >
            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-zinc-100">{expense.title}</p>
              <p className="text-xs text-zinc-500 sm:hidden">{formatDate(expense.date)}</p>
            </div>

            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                  CATEGORY_STYLES[expense.category] || CATEGORY_STYLES["Autres"]
                }`}
              >
                {expense.category}
              </span>
            </div>

            <div className="hidden text-sm text-zinc-400 sm:block">{formatDate(expense.date)}</div>

            <div className="text-right text-sm font-semibold text-zinc-100 sm:text-right">
              {formatCurrency(expense.amount)}
            </div>

            <div className="col-span-2 flex justify-end gap-2 sm:col-span-1">
              <button
                onClick={() => onEdit(expense)}
                aria-label={`Modifier ${expense.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-400 transition hover:border-brand-500 hover:text-brand-400"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(expense)}
                aria-label={`Supprimer ${expense.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
