"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Consultant } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  Input,
  LoadingBlock,
  Textarea,
} from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";

export default function ConsultantsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ConsultantsContent />
    </Suspense>
  );
}

function ConsultantsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return id ? <ConsultantDetail id={id} /> : <ConsultantList />;
}

function ConsultantList() {
  const router = useRouter();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("consultants").select("*").order("full_name");
    setConsultants((data as Consultant[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = consultants.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.expertise ?? []).some((e) => e.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Consultant Pool</h1>
        <Button onClick={() => setShowCreate(true)}>+ Add Consultant</Button>
      </div>
      <Input
        placeholder="Search by name or expertise…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
      />
      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No consultants yet" hint="Add temporary personnel here as they're engaged." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer p-4 hover:border-slate-400"
              onClick={() => router.push(`/app/consultants?id=${c.id}`)}
            >
              <p className="font-medium">{c.full_name}</p>
              <p className="text-sm text-slate-500">{c.title}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(c.expertise ?? []).slice(0, 3).map((e) => (
                  <Badge key={e} tone="blue">
                    {e}
                  </Badge>
                ))}
              </div>
              {!c.active && (
                <span className="mt-2 inline-block text-xs text-slate-400">Inactive</span>
              )}
            </Card>
          ))}
        </div>
      )}
      {showCreate && (
        <ConsultantFormModal
          onClose={() => setShowCreate(false)}
          onSaved={(newId) => {
            setShowCreate(false);
            router.push(`/app/consultants?id=${newId}`);
          }}
        />
      )}
    </div>
  );
}

function ConsultantFormModal({
  consultant,
  onClose,
  onSaved,
}: {
  consultant?: Consultant;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [form, setForm] = useState({
    full_name: consultant?.full_name ?? "",
    title: consultant?.title ?? "",
    expertise: consultant?.expertise?.join(", ") ?? "",
    service_categories: consultant?.service_categories?.join(", ") ?? "",
    contact_email: consultant?.contact_email ?? "",
    contact_phone: consultant?.contact_phone ?? "",
    rate: consultant?.rate?.toString() ?? "",
    rate_currency: consultant?.rate_currency ?? "PHP",
    availability: consultant?.availability ?? "",
    location: consultant?.location ?? "",
    travel_availability: consultant?.travel_availability ?? false,
    performance_notes: consultant?.performance_notes ?? "",
    conflict_of_interest_notes: consultant?.conflict_of_interest_notes ?? "",
    active: consultant?.active ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) return setError("Name is required.");
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      expertise: form.expertise ? form.expertise.split(",").map((s) => s.trim()).filter(Boolean) : [],
      service_categories: form.service_categories
        ? form.service_categories.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      rate: form.rate ? Number(form.rate) : null,
    };
    if (consultant) {
      const { error: updateError } = await supabase.from("consultants").update(payload).eq("id", consultant.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
      onSaved(consultant.id);
    } else {
      const { data, error: insertError } = await supabase.from("consultants").insert(payload).select().single();
      setSaving(false);
      if (insertError) return setError(insertError.message);
      onSaved((data as Consultant).id);
    }
  }

  return (
    <Modal title={consultant ? "Edit Consultant" : "Add Consultant"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name *">
            <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Expertise (comma-separated)">
            <Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
          </Field>
          <Field label="Service categories (comma-separated)">
            <Input
              value={form.service_categories}
              onChange={(e) => setForm({ ...form, service_categories: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </Field>
          <Field label="Rate">
            <Input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Availability">
            <Input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.travel_availability}
            onChange={(e) => setForm({ ...form, travel_availability: e.target.checked })}
          />
          Available to travel
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active
        </label>
        <Field label="Performance notes (internal)">
          <Textarea
            rows={2}
            value={form.performance_notes}
            onChange={(e) => setForm({ ...form, performance_notes: e.target.value })}
          />
        </Field>
        <Field label="Conflict-of-interest notes">
          <Textarea
            rows={2}
            value={form.conflict_of_interest_notes}
            onChange={(e) => setForm({ ...form, conflict_of_interest_notes: e.target.value })}
          />
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

function ConsultantDetail({ id }: { id: string }) {
  const router = useRouter();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("consultants").select("*").eq("id", id).maybeSingle();
    setConsultant((data as Consultant) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (!consultant) return <EmptyState title="Consultant not found" />;

  return (
    <div>
      <button className="mb-4 text-sm text-slate-500 underline" onClick={() => router.push("/app/consultants")}>
        ← Back to consultant pool
      </button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{consultant.full_name}</h1>
          <p className="text-sm text-slate-500">{consultant.title}</p>
        </div>
        <Button variant="secondary" onClick={() => setShowEdit(true)}>
          Edit
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Profile</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Email" value={consultant.contact_email} />
            <Row label="Phone" value={consultant.contact_phone} />
            <Row label="Location" value={consultant.location} />
            <Row label="Availability" value={consultant.availability} />
            <Row label="Rate" value={formatCurrency(consultant.rate, consultant.rate_currency ?? "PHP")} />
            <Row label="Travel" value={consultant.travel_availability ? "Available" : "Not available"} />
          </dl>
          {(consultant.expertise?.length ?? 0) > 0 && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Expertise</h3>
              <div className="flex flex-wrap gap-1">
                {consultant.expertise!.map((e) => (
                  <Badge key={e} tone="blue">
                    {e}
                  </Badge>
                ))}
              </div>
            </>
          )}
          {consultant.performance_notes && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Performance notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                {consultant.performance_notes}
              </p>
            </>
          )}
          {consultant.conflict_of_interest_notes && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Conflict of interest</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                {consultant.conflict_of_interest_notes}
              </p>
            </>
          )}
        </Card>
        <Card className="p-4">
          <DocumentsPanel entityType="consultant" entityId={consultant.id} />
        </Card>
      </div>
      {showEdit && (
        <ConsultantFormModal consultant={consultant} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-slate-700 dark:text-slate-300">{value || "—"}</dd>
    </div>
  );
}
