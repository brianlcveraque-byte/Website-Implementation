"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAppUsers, useClientsLookup, useServices } from "@/lib/hooks";
import type {
  Client,
  Consultant,
  Invoice,
  Milestone,
  MilestoneStatus,
  Project,
  ProjectAssignment,
  ProjectStatus,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/database.types";
import {
  PROJECT_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  formatCurrency,
  formatDate,
  isOverdue,
  titleCase,
} from "@/lib/utils";
import { StatusBadge, Badge } from "@/components/ui/Badge";
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
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";
import { InvoiceFormModal } from "@/components/invoices/InvoiceFormModal";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ProjectsContent />
    </Suspense>
  );
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return id ? <ProjectDetail id={id} /> : <ProjectList />;
}

function ProjectList() {
  const router = useRouter();
  const clients = useClientsLookup();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = statusFilter ? projects.filter((p) => p.status === statusFilter) : projects;
  const clientName = (id: string) => clients.find((c) => c.id === id)?.org_name ?? "…";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Projects</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Project</Button>
      </div>
      <div className="mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </Select>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No projects yet" hint="Projects are created from won opportunities, or directly here." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2">Project</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Health</th>
                <th className="px-4 py-2">Completion</th>
                <th className="px-4 py-2">End date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  onClick={() => router.push(`/app/projects?id=${p.id}`)}
                >
                  <td className="px-4 py-2.5 font-medium">{p.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{clientName(p.client_id)}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={p.health_status}>{titleCase(p.health_status)}</Badge>
                  </td>
                  <td className="px-4 py-2.5">{p.completion_pct}%</td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(p.end_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {showCreate && (
        <ProjectFormModal
          onClose={() => setShowCreate(false)}
          onSaved={(newId) => {
            setShowCreate(false);
            router.push(`/app/projects?id=${newId}`);
          }}
        />
      )}
    </div>
  );
}

function ProjectFormModal({
  project,
  onClose,
  onSaved,
}: {
  project?: Project;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { profile } = useAuth();
  const clients = useClientsLookup();
  const services = useServices();
  const users = useAppUsers();
  const [form, setForm] = useState({
    name: project?.name ?? "",
    client_id: project?.client_id ?? "",
    service_id: project?.service_id ?? "",
    contract_reference: project?.contract_reference ?? "",
    description: project?.description ?? "",
    project_manager_id: project?.project_manager_id ?? profile?.id ?? "",
    start_date: project?.start_date ?? "",
    end_date: project?.end_date ?? "",
    contract_amount: project?.contract_amount?.toString() ?? "",
    currency: project?.currency ?? "PHP",
    status: project?.status ?? ("mobilization" as ProjectStatus),
    health_status: project?.health_status ?? ("gray" as const),
    notes: project?.notes ?? "",
    closeout_notes: project?.closeout_notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.client_id) return setError("Name and client are required.");
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      service_id: form.service_id || null,
      contract_amount: form.contract_amount ? Number(form.contract_amount) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    if (project) {
      const { error: updateError } = await supabase
        .from("projects")
        .update({ ...payload, updated_by: profile?.id })
        .eq("id", project.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
      onSaved(project.id);
    } else {
      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({ ...payload, created_by: profile?.id, updated_by: profile?.id })
        .select()
        .single();
      setSaving(false);
      if (insertError) return setError(insertError.message);
      onSaved((data as Project).id);
    }
  }

  return (
    <Modal title={project ? "Edit Project" : "New Project"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name *">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Client *">
            <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required>
              <option value="">Select a client…</option>
              {clients.map((c: Client) => (
                <option key={c.id} value={c.id}>
                  {c.org_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Service">
            <Select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
              <option value="">Select a service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Project manager">
            <Select
              value={form.project_manager_id}
              onChange={(e) => setForm({ ...form, project_manager_id: e.target.value })}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Contract reference">
            <Input
              value={form.contract_reference}
              onChange={(e) => setForm({ ...form, contract_reference: e.target.value })}
            />
          </Field>
          <Field label="Contract amount">
            <Input
              type="number"
              value={form.contract_amount}
              onChange={(e) => setForm({ ...form, contract_amount: e.target.value })}
            />
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </Field>
          <Field label="End date">
            <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Health">
            <Select
              value={form.health_status}
              onChange={(e) => setForm({ ...form, health_status: e.target.value as Project["health_status"] })}
            >
              {["green", "amber", "red", "gray"].map((h) => (
                <option key={h} value={h}>
                  {titleCase(h)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Description">
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        {project && (
          <Field label="Closeout notes">
            <Textarea
              rows={2}
              value={form.closeout_notes}
              onChange={(e) => setForm({ ...form, closeout_notes: e.target.value })}
              placeholder="Lessons learned, follow-on potential, testimonial worthiness…"
            />
          </Field>
        )}
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

const TABS = ["Overview", "Milestones", "Tasks", "Team", "Documents", "Billing"] as const;
const TEMP_TABS = ["Overview", "Milestones", "Tasks", "Documents"] as const;

function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const clients = useClientsLookup();
  const users = useAppUsers();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("Overview");
  const [showEdit, setShowEdit] = useState(false);
  const isTemp = profile?.role === "temp_consultant";
  const visibleTabs = isTemp ? TEMP_TABS : TABS;

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    setProject((data as Project) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (!project) return <EmptyState title="Project not found" />;

  const clientName = clients.find((c) => c.id === project.client_id)?.org_name ?? "—";
  const pmName = users.find((u) => u.id === project.project_manager_id)?.full_name ?? "—";

  return (
    <div>
      <button className="mb-4 text-sm text-slate-500 underline" onClick={() => router.push("/app/projects")}>
        ← Back to projects
      </button>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            <Badge tone={project.health_status}>{titleCase(project.health_status)}</Badge>
            <span className="text-sm text-slate-500">{clientName}</span>
            <span className="text-sm text-slate-500">· {project.completion_pct}% complete</span>
          </div>
        </div>
        {!isTemp && (
          <Button variant="secondary" onClick={() => setShowEdit(true)}>
            Edit
          </Button>
        )}
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {visibleTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t
                ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <Card className="p-4">
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Row label="Project manager" value={pmName} />
            <Row label="Contract reference" value={project.contract_reference} />
            <Row label="Contract amount" value={formatCurrency(project.contract_amount, project.currency)} />
            <Row label="Start date" value={formatDate(project.start_date)} />
            <Row label="End date" value={formatDate(project.end_date)} />
          </dl>
          {project.description && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
            </>
          )}
          {project.notes && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{project.notes}</p>
            </>
          )}
          {project.closeout_notes && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Closeout notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{project.closeout_notes}</p>
            </>
          )}
        </Card>
      )}

      {tab === "Milestones" && <MilestonesTab projectId={project.id} onChanged={load} readOnly={isTemp} />}
      {tab === "Tasks" && <TasksTab projectId={project.id} restrictToSelf={isTemp} />}
      {tab === "Team" && !isTemp && <TeamTab projectId={project.id} />}
      {tab === "Documents" && <Card className="p-4"><DocumentsPanel entityType="project" entityId={project.id} /></Card>}
      {tab === "Billing" && <BillingTab project={project} />}

      {showEdit && (
        <ProjectFormModal project={project} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />
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

function MilestonesTab({
  projectId,
  onChanged,
  readOnly = false,
}: {
  projectId: string;
  onChanged: () => void;
  readOnly?: boolean;
}) {
  const users = useAppUsers();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Milestone | "new" | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("milestones").select("*").eq("project_id", projectId).order("due_date");
    setMilestones((data as Milestone[]) ?? []);
    setLoading(false);
    onChanged();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Milestones</h2>
        {!readOnly && (
          <button className="text-xs font-medium underline" onClick={() => setEditing("new")}>
            + Add milestone
          </button>
        )}
      </div>
      {loading ? (
        <LoadingBlock />
      ) : milestones.length === 0 ? (
        <p className="text-sm text-slate-400">No milestones yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {milestones.map((m) => (
            <li
              key={m.id}
              className={readOnly ? "py-2.5 text-sm" : "cursor-pointer py-2.5 text-sm"}
              onClick={() => !readOnly && setEditing(m)}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {m.title} {m.billing_trigger && <Badge tone="blue">Billing</Badge>}
                </p>
                <StatusBadge status={m.status} />
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span>{users.find((u) => u.id === m.responsible_id)?.full_name ?? "Unassigned"}</span>
                <span className={isOverdue(m.due_date) && m.status !== "completed" ? "font-medium text-red-600" : ""}>
                  Due {formatDate(m.due_date)}
                </span>
                <span>{m.completion_pct}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && (
        <MilestoneFormModal
          projectId={projectId}
          milestone={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </Card>
  );
}

function MilestoneFormModal({
  projectId,
  milestone,
  onClose,
  onSaved,
}: {
  projectId: string;
  milestone?: Milestone;
  onClose: () => void;
  onSaved: () => void;
}) {
  const users = useAppUsers();
  const [form, setForm] = useState({
    title: milestone?.title ?? "",
    description: milestone?.description ?? "",
    responsible_id: milestone?.responsible_id ?? "",
    planned_start: milestone?.planned_start ?? "",
    due_date: milestone?.due_date ?? "",
    status: milestone?.status ?? ("not_started" as MilestoneStatus),
    completion_pct: milestone?.completion_pct ?? 0,
    client_acceptance_required: milestone?.client_acceptance_required ?? false,
    billing_trigger: milestone?.billing_trigger ?? false,
    comments: milestone?.comments ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      responsible_id: form.responsible_id || null,
      planned_start: form.planned_start || null,
      due_date: form.due_date || null,
      actual_completion_date: form.status === "completed" ? new Date().toISOString().slice(0, 10) : null,
    };
    if (milestone) {
      const { error: updateError } = await supabase.from("milestones").update(payload).eq("id", milestone.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
    } else {
      const { error: insertError } = await supabase.from("milestones").insert({ ...payload, project_id: projectId });
      setSaving(false);
      if (insertError) return setError(insertError.message);
    }
    onSaved();
  }

  return (
    <Modal title={milestone ? "Edit Milestone" : "New Milestone"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title *">
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Responsible">
            <Select value={form.responsible_id} onChange={(e) => setForm({ ...form, responsible_id: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MilestoneStatus })}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Planned start">
            <Input type="date" value={form.planned_start} onChange={(e) => setForm({ ...form, planned_start: e.target.value })} />
          </Field>
          <Field label="Due date">
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Field>
          <Field label="Completion %">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.completion_pct}
              onChange={(e) => setForm({ ...form, completion_pct: Number(e.target.value) })}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.billing_trigger}
            onChange={(e) => setForm({ ...form, billing_trigger: e.target.checked })}
          />
          This milestone triggers billing
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.client_acceptance_required}
            onChange={(e) => setForm({ ...form, client_acceptance_required: e.target.checked })}
          />
          Requires client acceptance
        </label>
        <Field label="Comments">
          <Textarea rows={2} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
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

function TasksTab({ projectId, restrictToSelf = false }: { projectId: string; restrictToSelf?: boolean }) {
  const users = useAppUsers();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  async function load() {
    setLoading(true);
    // RLS additionally scopes this to the caller's own tasks when they're a temp consultant.
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from("tasks").select("*").eq("project_id", projectId).order("due_date"),
      supabase.from("milestones").select("*").eq("project_id", projectId),
    ]);
    setTasks((t as Task[]) ?? []);
    setMilestones((m as Milestone[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Tasks</h2>
        {!restrictToSelf && (
          <button className="text-xs font-medium underline" onClick={() => setEditing("new")}>
            + Add task
          </button>
        )}
      </div>
      {loading ? (
        <LoadingBlock />
      ) : tasks.length === 0 ? (
        <p className="text-sm text-slate-400">No tasks yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((t) => (
            <li key={t.id} className="cursor-pointer py-2.5 text-sm" onClick={() => setEditing(t)}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{t.title}</p>
                <div className="flex gap-1.5">
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span>{users.find((u) => u.id === t.assigned_to)?.full_name ?? "Unassigned"}</span>
                <span className={isOverdue(t.due_date) && t.status !== "completed" ? "font-medium text-red-600" : ""}>
                  Due {formatDate(t.due_date)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && (
        <TaskFormModal
          projectId={projectId}
          milestones={milestones}
          task={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </Card>
  );
}

function TaskFormModal({
  projectId,
  milestones,
  task,
  onClose,
  onSaved,
}: {
  projectId: string;
  milestones: Milestone[];
  task?: Task;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const users = useAppUsers();
  const [form, setForm] = useState({
    title: task?.title ?? "",
    milestone_id: task?.milestone_id ?? "",
    assigned_to: task?.assigned_to ?? "",
    priority: task?.priority ?? ("medium" as TaskPriority),
    status: task?.status ?? ("not_started" as TaskStatus),
    start_date: task?.start_date ?? "",
    due_date: task?.due_date ?? "",
    estimated_effort: task?.estimated_effort?.toString() ?? "",
    comments: task?.comments ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      milestone_id: form.milestone_id || null,
      assigned_to: form.assigned_to || null,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
      estimated_effort: form.estimated_effort ? Number(form.estimated_effort) : null,
    };
    if (task) {
      const { error: updateError } = await supabase.from("tasks").update(payload).eq("id", task.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
    } else {
      const { error: insertError } = await supabase
        .from("tasks")
        .insert({ ...payload, project_id: projectId, created_by: profile?.id });
      setSaving(false);
      if (insertError) return setError(insertError.message);
    }
    onSaved();
  }

  return (
    <Modal title={task ? "Edit Task" : "New Task"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title *">
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assigned to">
            <Select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Milestone">
            <Select value={form.milestone_id} onChange={(e) => setForm({ ...form, milestone_id: e.target.value })}>
              <option value="">None</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {titleCase(p)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </Field>
          <Field label="Due date">
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Field>
        </div>
        <Field label="Comments">
          <Textarea rows={2} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
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

function TeamTab({ projectId }: { projectId: string }) {
  const users = useAppUsers();
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: a }, { data: c }] = await Promise.all([
      supabase.from("project_assignments").select("*").eq("project_id", projectId),
      supabase.from("consultants").select("*").eq("active", true),
    ]);
    setAssignments((a as ProjectAssignment[]) ?? []);
    setConsultants((c as Consultant[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function remove(id: string) {
    await supabase.from("project_assignments").delete().eq("id", id);
    load();
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Team</h2>
        <button className="text-xs font-medium underline" onClick={() => setShowAdd(true)}>
          + Add member
        </button>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : assignments.length === 0 ? (
        <p className="text-sm text-slate-400">No one assigned yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {assignments.map((a) => {
            const name = a.user_id
              ? users.find((u) => u.id === a.user_id)?.full_name
              : consultants.find((c) => c.id === a.consultant_id)?.full_name;
            return (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium">
                    {name ?? "…"} {a.user_id ? <Badge tone="blue">Core team</Badge> : <Badge>Consultant</Badge>}
                  </p>
                  <p className="text-xs text-slate-500">{a.role_on_project}</p>
                </div>
                <button className="text-xs text-red-600 hover:underline" onClick={() => remove(a.id)}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {showAdd && (
        <AddAssignmentModal
          projectId={projectId}
          users={users}
          consultants={consultants}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </Card>
  );
}

function AddAssignmentModal({
  projectId,
  users,
  consultants,
  onClose,
  onSaved,
}: {
  projectId: string;
  users: { id: string; full_name: string }[];
  consultants: Consultant[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [kind, setKind] = useState<"user" | "consultant">("user");
  const [personId, setPersonId] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personId) return setError("Choose a person.");
    setSaving(true);
    const { error: insertError } = await supabase.from("project_assignments").insert({
      project_id: projectId,
      user_id: kind === "user" ? personId : null,
      consultant_id: kind === "consultant" ? personId : null,
      role_on_project: role,
    });
    setSaving(false);
    if (insertError) return setError(insertError.message);
    onSaved();
  }

  return (
    <Modal title="Add Team Member" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${kind === "user" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"}`}
            onClick={() => {
              setKind("user");
              setPersonId("");
            }}
          >
            Core team
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${kind === "consultant" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"}`}
            onClick={() => {
              setKind("consultant");
              setPersonId("");
            }}
          >
            Temporary consultant
          </button>
        </div>
        <Field label="Person">
          <Select value={personId} onChange={(e) => setPersonId(e.target.value)}>
            <option value="">Select…</option>
            {(kind === "user" ? users : consultants).map((p) => (
              <option key={p.id} value={p.id}>
                {"full_name" in p ? p.full_name : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Role on project">
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Lead facilitator" />
        </Field>
        {error && <ErrorBlock message={error} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function BillingTab({ project }: { project: Project }) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: i }, { data: m }] = await Promise.all([
      supabase.from("invoices").select("*").eq("project_id", project.id).order("invoice_date", { ascending: false }),
      supabase.from("milestones").select("*").eq("project_id", project.id),
    ]);
    setInvoices((i as Invoice[]) ?? []);
    setMilestones((m as Milestone[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const billableUninvoiced = milestones.filter(
    (m) => m.billing_trigger && m.status === "completed" && !invoices.some((i) => i.milestone_id === m.id)
  );

  return (
    <Card className="p-4">
      {billableUninvoiced.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {billableUninvoiced.length} completed billing milestone(s) have no invoice yet:{" "}
          {billableUninvoiced.map((m) => m.title).join(", ")}
        </div>
      )}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Invoices</h2>
        <button className="text-xs font-medium underline" onClick={() => setShowCreate(true)}>
          + New invoice
        </button>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : invoices.length === 0 ? (
        <p className="text-sm text-slate-400">No invoices yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex cursor-pointer items-center justify-between py-2 text-sm"
              onClick={() => router.push(`/app/invoices?id=${inv.id}`)}
            >
              <span className="font-medium">{inv.invoice_ref}</span>
              <span className="text-slate-500">{formatCurrency(inv.amount, inv.currency)}</span>
              <StatusBadge status={inv.status} />
            </li>
          ))}
        </ul>
      )}
      {showCreate && (
        <InvoiceFormModal
          clientId={project.client_id}
          projectId={project.id}
          milestones={milestones}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </Card>
  );
}
