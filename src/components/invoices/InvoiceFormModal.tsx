"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Invoice, InvoiceStatus, Milestone } from "@/lib/database.types";
import { INVOICE_STATUSES, titleCase } from "@/lib/utils";
import { Button, ErrorBlock, Field, Input, Select, Textarea } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";

export function InvoiceFormModal({
  invoice,
  clientId,
  projectId,
  milestones,
  onClose,
  onSaved,
}: {
  invoice?: Invoice;
  clientId: string;
  projectId: string;
  milestones: Milestone[];
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    invoice_ref: invoice?.invoice_ref ?? `INV-${Date.now().toString().slice(-6)}`,
    milestone_id: invoice?.milestone_id ?? "",
    invoice_date: invoice?.invoice_date ?? new Date().toISOString().slice(0, 10),
    due_date: invoice?.due_date ?? "",
    amount: invoice?.amount?.toString() ?? "",
    currency: invoice?.currency ?? "PHP",
    tax_note: invoice?.tax_note ?? "",
    status: invoice?.status ?? ("draft" as InvoiceStatus),
    invoice_file_link: invoice?.invoice_file_link ?? "",
    follow_up_notes: invoice?.follow_up_notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return setError("Enter a valid amount.");
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      amount: Number(form.amount),
      milestone_id: form.milestone_id || null,
      due_date: form.due_date || null,
      client_id: clientId,
      project_id: projectId,
    };
    if (invoice) {
      const { error: updateError } = await supabase.from("invoices").update(payload).eq("id", invoice.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
      onSaved(invoice.id);
    } else {
      const { data, error: insertError } = await supabase
        .from("invoices")
        .insert({ ...payload, created_by: profile?.id })
        .select()
        .single();
      setSaving(false);
      if (insertError) return setError(insertError.message);
      onSaved((data as Invoice).id);
    }
  }

  return (
    <Modal title={invoice ? "Edit Invoice" : "New Invoice"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Invoice reference">
            <Input value={form.invoice_ref} onChange={(e) => setForm({ ...form, invoice_ref: e.target.value })} />
          </Field>
          <Field label="Billing milestone">
            <Select value={form.milestone_id} onChange={(e) => setForm({ ...form, milestone_id: e.target.value })}>
              <option value="">None</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Invoice date">
            <Input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} />
          </Field>
          <Field label="Due date">
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Field>
          <Field label="Amount *">
            <Input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}>
              {INVOICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Invoice file link">
            <Input value={form.invoice_file_link} onChange={(e) => setForm({ ...form, invoice_file_link: e.target.value })} />
          </Field>
          <Field label="Withholding tax note">
            <Input
              value={form.tax_note}
              onChange={(e) => setForm({ ...form, tax_note: e.target.value })}
              placeholder="e.g. Excluding tax, shouldered by client"
            />
          </Field>
        </div>
        <Field label="Follow-up notes">
          <Textarea rows={2} value={form.follow_up_notes} onChange={(e) => setForm({ ...form, follow_up_notes: e.target.value })} />
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
