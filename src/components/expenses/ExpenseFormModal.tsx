"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Expense, ExpenseCategory } from "@/lib/database.types";
import { EXPENSE_CATEGORIES, titleCase } from "@/lib/utils";
import { Button, ErrorBlock, Field, Input, Select, Textarea } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";

export function ExpenseFormModal({
  expense,
  onClose,
  onSaved,
}: {
  expense?: Expense;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    description: expense?.description ?? "",
    category: expense?.category ?? ("other" as ExpenseCategory),
    amount: expense?.amount?.toString() ?? "",
    currency: expense?.currency ?? "PHP",
    expense_date: expense?.expense_date ?? new Date().toISOString().slice(0, 10),
    notes: expense?.notes ?? "",
    receipt_link: expense?.receipt_link ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) return setError("Enter a description.");
    if (!form.amount || Number(form.amount) <= 0) return setError("Enter a valid amount.");
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      description: form.description.trim(),
      amount: Number(form.amount),
      notes: form.notes || null,
      receipt_link: form.receipt_link || null,
    };
    if (expense) {
      const { error: updateError } = await supabase.from("expenses").update(payload).eq("id", expense.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
      onSaved();
    } else {
      const { error: insertError } = await supabase
        .from("expenses")
        .insert({ ...payload, created_by: profile?.id });
      setSaving(false);
      if (insertError) return setError(insertError.message);
      onSaved();
    }
  }

  return (
    <Modal title={expense ? "Edit Expense" : "New Expense"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Description *">
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount *">
            <Input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
          </Field>
          <Field label="Receipt link">
            <Input value={form.receipt_link} onChange={(e) => setForm({ ...form, receipt_link: e.target.value })} />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        {error && <ErrorBlock message={error} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
