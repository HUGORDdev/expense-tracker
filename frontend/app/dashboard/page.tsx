"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import SummaryCards from "@/components/SummaryCards";
import PeriodFilterBar from "@/components/PeriodFilter";
import ExpenseList from "@/components/ExpenseList";
import ExpenseForm from "@/components/ExpenseForm";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "@/services/expenseService";
import type { Expense, ExpenseInput, PeriodFilter } from "@/types";

export default function DashboardPage() {
  const [filter, setFilter] = useState<PeriodFilter>({ preset: "last_month" });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { expenses: data } = await getExpenses(filter);
      setExpenses(data);
    } catch (err) {
      setErrorMessage("Impossible de charger les dépenses. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  function openCreateForm() {
    setEditingExpense(null);
    setIsFormOpen(true);
  }

  function openEditForm(expense: Expense) {
    setEditingExpense(expense);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(data: ExpenseInput) {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await createExpense(data);
    }
    setIsFormOpen(false);
    setEditingExpense(null);
    await loadExpenses();
  }

  async function handleConfirmDelete() {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      await loadExpenses();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Tableau de bord</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Vue d&apos;ensemble de vos dépenses et de leur répartition.
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          <Plus size={16} />
          Ajouter une dépense
        </button>
      </div>

      <PeriodFilterBar value={filter} onChange={setFilter} />

      <SummaryCards expenses={expenses} />

      {errorMessage && (
        <div className="rounded-lg border border-red-600/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <ExpenseList
        expenses={expenses}
        isLoading={isLoading}
        onEdit={openEditForm}
        onDelete={(expense) => setExpenseToDelete(expense)}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingExpense ? "Modifier la dépense" : "Ajouter une dépense"}
      >
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!expenseToDelete}
        title="Supprimer la dépense"
        message={`Êtes-vous sûr de vouloir supprimer "${expenseToDelete?.title}" ? Cette action est irréversible.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
}
