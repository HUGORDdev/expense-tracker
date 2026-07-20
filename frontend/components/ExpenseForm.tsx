"use client";

import { FormEvent, useState } from "react";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory, type ExpenseInput } from "@/types";

interface ExpenseFormProps {
  initialData?: Expense | null;
  onSubmit: (data: ExpenseInput) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
  date?: string;
}

export default function ExpenseForm({ initialData, onSubmit, onCancel }: ExpenseFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [category, setCategory] = useState<ExpenseCategory | "">(
    initialData?.category ?? ""
  );
  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Le titre est requis.";
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = "Indiquez un montant valide supérieur à 0.";
    }
    if (!category) nextErrors.category = "Sélectionnez une catégorie.";
    if (!date) nextErrors.date = "La date est requise.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        amount: Number(amount),
        category: category as ExpenseCategory,
        date,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="title" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Titre
        </label>
        <input
          id="title"
          className="input-field"
          placeholder="Ex : Courses, Facture internet..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Montant (€)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            className="input-field"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="date" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Catégorie
        </label>
        <select
          id="category"
          className="input-field"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        >
          <option value="" disabled>
            Sélectionner une catégorie
          </option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : initialData ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
