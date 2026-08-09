"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { AppUser, Service, UserRole } from "@/lib/database.types";
import {
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  Input,
  LoadingBlock,
  Select,
} from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";

const ALL_TABLES = [
  "clients",
  "contacts",
  "services",
  "opportunities",
  "opportunity_stage_history",
  "projects",
  "milestones",
  "tasks",
  "consultants",
  "project_assignments",
  "invoices",
  "payments",
  "documents",
  "public_inquiries",
] as const;

export default function SettingsPage() {
  const { profile } = useAuth();

  if (profile?.role !== "owner") {
    return <EmptyState title="Owner access only" hint="Ask the owner if you need something changed here." />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold">Settings</h1>
      <UsersSection />
      <ServicesSection />
      <ExportSection />
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("app_users").select("*").order("created_at");
    setUsers((data as AppUser[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(id: string, patch: Partial<AppUser>) {
    await supabase.from("app_users").update(patch).eq("id", id);
    load();
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">Users &amp; Access</h2>
      {loading ? (
        <LoadingBlock />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2.5 font-medium">{u.full_name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <Select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value as UserRole })}
                      className="w-40"
                    >
                      <option value="owner">Owner</option>
                      <option value="core_team">Core Team</option>
                      <option value="temp_consultant">Temp Consultant</option>
                    </Select>
                  </td>
                  <td className="px-4 py-2.5">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={u.active}
                        onChange={(e) => updateUser(u.id, { active: e.target.checked })}
                      />
                      {u.active ? "Active" : "Inactive"}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}

function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("category");
    setServices((data as Service[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(s: Service) {
    await supabase.from("services").update({ active: !s.active }).eq("id", s.id);
    load();
  }

  async function seedDefaults() {
    setSeeding(true);
    const rows = SERVICE_CATEGORIES.map((c) => ({ name: c.name, category: c.name, description: c.description }));
    await supabase.from("services").upsert(rows, { onConflict: "name" });
    setSeeding(false);
    load();
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Service Catalogue</h2>
        <div className="flex gap-2">
          {services.length === 0 && !loading && (
            <Button variant="secondary" onClick={seedDefaults} disabled={seeding}>
              {seeding ? "Loading…" : "Load default 18 services"}
            </Button>
          )}
          <Button onClick={() => setShowAdd(true)}>+ Add Service</Button>
        </div>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-slate-500">{s.description}</p>
              </div>
              <button className="text-xs underline" onClick={() => toggleActive(s)}>
                {s.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </Card>
      )}
      {showAdd && (
        <AddServiceModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </section>
  );
}

function AddServiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required.");
    setSaving(true);
    const { error: insertError } = await supabase.from("services").insert({ name, category: name, description });
    setSaving(false);
    if (insertError) return setError(insertError.message);
    onSaved();
  }

  return (
    <Modal title="Add Service" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name *">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
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

function ExportSection() {
  const [exporting, setExporting] = useState(false);

  async function exportAll() {
    setExporting(true);
    const bundle: Record<string, unknown> = {};
    for (const table of ALL_TABLES) {
      const { data } = await supabase.from(table).select("*");
      bundle[table] = data ?? [];
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strategnosis-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">Backup &amp; Export</h2>
      <Card className="p-4">
        <p className="text-sm text-slate-500">
          Downloads every table as a single JSON file. Recommended weekly, since the free Supabase
          tier doesn&apos;t include automatic backups — see the README for the full backup
          procedure (including how to run a complete database dump via the Supabase CLI).
        </p>
        <Button className="mt-3" onClick={exportAll} disabled={exporting}>
          {exporting ? "Exporting…" : "Export all data (JSON)"}
        </Button>
      </Card>
    </section>
  );
}
