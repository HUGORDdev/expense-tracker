"use client";

import { CircleDollarSign, Tags, Receipt } from "lucide-react";
import type { Expense } from "@/types";

interface SummaryCardsProps {
  expenses: Expense[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    amount
  );
}

export default function SummaryCards({ expenses }: SummaryCardsProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const totalsByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry ? topCategoryEntry[0] : "—";

  const cards = [
    {
      label: "Total dépensé",
      value: formatCurrency(total),
      icon: CircleDollarSign,
      accent: "bg-brand-500/10 text-brand-400",
    },
    {
      label: "Catégorie la plus coûteuse",
      value: topCategory,
      icon: Tags,
      accent: "bg-amber-500/10 text-amber-400",
    },
    {
      label: "Nombre de transactions",
      value: expenses.length.toString(),
      icon: Receipt,
      accent: "bg-emerald-500/10 text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="card flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.accent}`}>
            <card.icon size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">{card.label}</p>
            <p className="mt-0.5 text-xl font-semibold text-zinc-100">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
