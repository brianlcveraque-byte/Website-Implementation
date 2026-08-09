"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Invoice, Payment } from "@/lib/database.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button, ErrorBlock, Field, Input } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";

export function PaymentPanel({
  invoice,
  onChanged,
}: {
  invoice: Invoice;
  onChanged: () => void;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("payment_date", { ascending: false });
    setPayments((data as Payment[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.id]);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = invoice.amount - totalPaid;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Payments</h2>
        {balance > 0 && (
          <button className="text-xs font-medium underline" onClick={() => setShowAdd(true)}>
            + Record payment
          </button>
        )}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-slate-400">Invoiced</p>
          <p className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Paid</p>
          <p className="font-medium">{formatCurrency(totalPaid, invoice.currency)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Balance</p>
          <p className={`font-medium ${balance > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {formatCurrency(balance, invoice.currency)}
          </p>
        </div>
      </div>
      {payments.length === 0 ? (
        <p className="text-sm text-slate-400">No payments recorded yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-1.5 text-sm">
              <span>
                {formatDate(p.payment_date)} · {p.method || "—"}
              </span>
              <span className="font-medium">{formatCurrency(p.amount, invoice.currency)}</span>
            </li>
          ))}
        </ul>
      )}
      {showAdd && (
        <RecordPaymentModal
          invoice={invoice}
          maxAmount={balance}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function RecordPaymentModal({
  invoice,
  maxAmount,
  onClose,
  onSaved,
}: {
  invoice: Invoice;
  maxAmount: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const [amount, setAmount] = useState(maxAmount.toString());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("");
  const [receiptLink, setReceiptLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount.");
    setSaving(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("record_payment", {
      p_invoice_id: invoice.id,
      p_amount: Number(amount),
      p_payment_date: paymentDate,
      p_method: method || null,
      p_receipt_link: receiptLink || null,
      p_created_by: profile?.id ?? null,
    });
    setSaving(false);
    if (rpcError) return setError(rpcError.message);
    onSaved();
  }

  return (
    <Modal title="Record Payment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Amount *">
          <Input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Payment date">
          <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </Field>
        <Field label="Method">
          <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Bank transfer, check, etc." />
        </Field>
        <Field label="Receipt link">
          <Input value={receiptLink} onChange={(e) => setReceiptLink(e.target.value)} />
        </Field>
        {error && <ErrorBlock message={error} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
