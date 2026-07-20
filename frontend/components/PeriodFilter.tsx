"use client";

import clsx from "clsx";
import type { PeriodFilter, PeriodPreset } from "@/types";

interface PeriodFilterProps {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "last_week", label: "La semaine dernière" },
  { value: "last_month", label: "Le mois dernier" },
  { value: "last_3_months", label: "Les 3 derniers mois" },
  { value: "custom", label: "Personnalisé" },
];

export default function PeriodFilterBar({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="card">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange({ ...value, preset: preset.value })}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              value.preset === preset.value
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {value.preset === "custom" && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Date de début
            </label>
            <input
              type="date"
              className="input-field"
              value={value.startDate || ""}
              onChange={(e) => onChange({ ...value, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Date de fin
            </label>
            <input
              type="date"
              className="input-field"
              value={value.endDate || ""}
              onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
