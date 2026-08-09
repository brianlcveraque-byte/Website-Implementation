"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Client, ClientStatus, Contact, Opportunity, Project } from "@/lib/database.types";
import { CLIENT_STATUSES, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  Input,
  LoadingBlock,
  Select,
  Textarea,
} from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";

export default function ClientsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ClientsPageContent />
    </Suspense>
  );
}

function ClientsPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return id ? <ClientDetail id={id} /> : <ClientList />;
}

function ClientList() {
  const router = useRouter();
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("org_name");
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = clients.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (search && !c.org_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Clients</h1>
        {profile?.role !== "temp_consultant" && (
          <Button onClick={() => setShowCreate(true)}>+ New Client</Button>
        )}
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by organization…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          {CLIENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No clients yet" hint="Create your first client to get started." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2">Organization</th>
                <th className="px-4 py-2">Sector</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  onClick={() => router.push(`/app/clients?id=${c.id}`)}
                >
                  <td className="px-4 py-2.5 font-medium">{c.org_name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{c.sector ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(c.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate && (
        <ClientFormModal
          onClose={() => setShowCreate(false)}
          onSaved={(newId) => {
            setShowCreate(false);
            router.push(`/app/clients?id=${newId}`);
          }}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  client,
  onClose,
  onSaved,
}: {
  client?: Client;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    org_name: client?.org_name ?? "",
    org_type: client?.org_type ?? "",
    sector: client?.sector ?? "",
    address: client?.address ?? "",
    website: client?.website ?? "",
    preferred_channel: client?.preferred_channel ?? "",
    source: client?.source ?? "",
    status: client?.status ?? ("prospect" as ClientStatus),
    notes: client?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.org_name.trim()) {
      setError("Organization name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    if (client) {
      const { error: updateError } = await supabase
        .from("clients")
        .update({ ...form, updated_by: profile?.id })
        .eq("id", client.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
      onSaved(client.id);
    } else {
      const { data, error: insertError } = await supabase
        .from("clients")
        .insert({ ...form, created_by: profile?.id, updated_by: profile?.id })
        .select()
        .single();
      setSaving(false);
      if (insertError) return setError(insertError.message);
      onSaved((data as Client).id);
    }
  }

  return (
    <Modal title={client ? "Edit Client" : "New Client"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organization name *">
            <Input
              required
              value={form.org_name}
              onChange={(e) => setForm({ ...form, org_name: e.target.value })}
            />
          </Field>
          <Field label="Organization type">
            <Input
              value={form.org_type}
              onChange={(e) => setForm({ ...form, org_type: e.target.value })}
              placeholder="e.g. Hospital, Cooperative, LGU"
            />
          </Field>
          <Field label="Sector">
            <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
            >
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </Field>
          <Field label="Source of relationship">
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </Field>
          <Field label="Preferred communication channel">
            <Input
              value={form.preferred_channel}
              onChange={(e) => setForm({ ...form, preferred_channel: e.target.value })}
            />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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

function ClientDetail({ id }: { id: string }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: c }, { data: ct }, { data: op }, { data: pj }] = await Promise.all([
      supabase.from("clients").select("*").eq("id", id).maybeSingle(),
      supabase.from("contacts").select("*").eq("client_id", id).order("is_primary", { ascending: false }),
      supabase.from("opportunities").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    ]);
    setClient((c as Client) ?? null);
    setContacts((ct as Contact[]) ?? []);
    setOpportunities((op as Opportunity[]) ?? []);
    setProjects((pj as Project[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (!client) return <EmptyState title="Client not found" />;

  return (
    <div>
      <button className="mb-4 text-sm text-slate-500 underline" onClick={() => router.push("/app/clients")}>
        ← Back to clients
      </button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{client.org_name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={client.status} />
            {client.sector && <span className="text-sm text-slate-500">{client.sector}</span>}
          </div>
        </div>
        <Button variant="secondary" onClick={() => setShowEdit(true)}>
          Edit
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold">Details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Type" value={client.org_type} />
            <Row label="Website" value={client.website} />
            <Row label="Source" value={client.source} />
            <Row label="Preferred channel" value={client.preferred_channel} />
            <Row label="Address" value={client.address} />
          </dl>
          {client.notes && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{client.notes}</p>
            </>
          )}

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Contacts</h2>
            <button className="text-xs font-medium underline" onClick={() => setShowContactForm(true)}>
              + Add
            </button>
          </div>
          {contacts.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No contacts yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {contacts.map((ct) => (
                <li key={ct.id} className="text-sm">
                  <p className="font-medium">
                    {ct.name} {ct.is_primary && <span className="text-xs text-slate-400">(primary)</span>}
                  </p>
                  <p className="text-slate-500">{ct.position}</p>
                  <p className="text-slate-500">{ct.email}</p>
                  <p className="text-slate-500">{ct.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Opportunities</h2>
            {opportunities.length === 0 ? (
              <p className="text-sm text-slate-400">No opportunities yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {opportunities.map((o) => (
                  <li key={o.id} className="py-2">
                    <button
                      className="text-left text-sm font-medium hover:underline"
                      onClick={() => router.push(`/app/opportunities?id=${o.id}`)}
                    >
                      {o.title}
                    </button>
                    <div className="mt-0.5">
                      <StatusBadge status={o.stage} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Projects</h2>
            {projects.length === 0 ? (
              <p className="text-sm text-slate-400">No projects yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((p) => (
                  <li key={p.id} className="py-2">
                    <button
                      className="text-left text-sm font-medium hover:underline"
                      onClick={() => router.push(`/app/projects?id=${p.id}`)}
                    >
                      {p.name}
                    </button>
                    <div className="mt-0.5">
                      <StatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {showEdit && (
        <ClientFormModal client={client} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />
      )}
      {showContactForm && (
        <ContactFormModal
          clientId={client.id}
          onClose={() => setShowContactForm(false)}
          onSaved={() => {
            setShowContactForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-slate-700 dark:text-slate-300">{value || "—"}</dd>
    </div>
  );
}

function ContactFormModal({
  clientId,
  onClose,
  onSaved,
}: {
  clientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: "", position: "", email: "", phone: "", is_primary: false });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    setSaving(true);
    const { error: insertError } = await supabase.from("contacts").insert({ ...form, client_id: clientId });
    setSaving(false);
    if (insertError) return setError(insertError.message);
    onSaved();
  }

  return (
    <Modal title="Add Contact" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name *">
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Position">
          <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
          />
          Primary contact
        </label>
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
