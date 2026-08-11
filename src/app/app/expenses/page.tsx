"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Expense } from "@/lib/database.types";
import { EXPENSE_CATEGORIES, formatCurrency, formatDate, titleCase } from "@/lib/utils";
import { Button, Card, EmptyState, LoadingBlock, Select } from "@/components/ui/Primitives";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
    setExpenses((data as Expense[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id);
    load();
  }

  const filtered = categoryFilter ? expenses.filter((e) => e.category === categoryFilter) : expenses;
  const startOfYear = `${new Date().getFullYear()}-01-01`;
  const ytdTotal = expenses
    .filter((e) => e.expense_date >= startOfYear)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Expenses</h1>
          <p className="text-sm text-slate-500">Year to date {formatCurrency(ytdTotal)}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + New Expense
        </Button>
      </div>
      <div className="mb-4">
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="max-w-xs">
          <option value="">All categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {titleCase(c)}
            </option>
          ))}
        </Select>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No expenses yet" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  onClick={() => {
                    setEditing(e);
                    setShowForm(true);
                  }}
                >
                  <td className="px-4 py-2.5 font-medium">{e.description}</td>
                  <td className="px-4 py-2.5 text-slate-500">{titleCase(e.category)}</td>
                  <td className="px-4 py-2.5">{formatCurrency(e.amount, e.currency)}</td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(e.expense_date)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleDelete(e.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {showForm && (
        <ExpenseFormModal
          expense={editing ?? undefined}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}
