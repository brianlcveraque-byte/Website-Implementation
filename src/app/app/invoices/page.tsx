"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useClientsLookup } from "@/lib/hooks";
import type { Invoice, Milestone, Project } from "@/lib/database.types";
import { INVOICE_STATUSES, formatCurrency, formatDate, isOverdue, titleCase } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Button, Card, EmptyState, LoadingBlock, Select } from "@/components/ui/Primitives";
import { InvoiceFormModal } from "@/components/invoices/InvoiceFormModal";
import { PaymentPanel } from "@/components/invoices/PaymentPanel";

export default function InvoicesPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <InvoicesContent />
    </Suspense>
  );
}

function InvoicesContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return id ? <InvoiceDetail id={id} /> : <InvoiceList />;
}

function InvoiceList() {
  const router = useRouter();
  const clients = useClientsLookup();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: i }, { data: p }] = await Promise.all([
      supabase.from("invoices").select("*").order("invoice_date", { ascending: false }),
      supabase.from("projects").select("*"),
    ]);
    setInvoices((i as Invoice[]) ?? []);
    setProjects((p as Project[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = statusFilter ? invoices.filter((i) => i.status === statusFilter) : invoices;
  const totalOutstanding = invoices
    .filter((i) => !["paid", "cancelled"].includes(i.status))
    .reduce((sum, i) => sum + i.amount, 0);
  const clientName = (id: string) => clients.find((c) => c.id === id)?.org_name ?? "…";
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "…";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Billing</h1>
          <p className="text-sm text-slate-500">Total outstanding {formatCurrency(totalOutstanding)}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Invoice</Button>
      </div>
      <div className="mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </Select>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No invoices yet" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Project</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  onClick={() => router.push(`/app/invoices?id=${inv.id}`)}
                >
                  <td className="px-4 py-2.5 font-medium">{inv.invoice_ref}</td>
                  <td className="px-4 py-2.5 text-slate-500">{clientName(inv.client_id)}</td>
                  <td className="px-4 py-2.5 text-slate-500">{projectName(inv.project_id)}</td>
                  <td className="px-4 py-2.5">{formatCurrency(inv.amount, inv.currency)}</td>
                  <td className={`px-4 py-2.5 ${isOverdue(inv.due_date) && inv.status !== "paid" ? "font-medium text-red-600" : "text-slate-500"}`}>
                    {formatDate(inv.due_date)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {showCreate && (
        <CreateInvoiceFlow
          projects={projects}
          onClose={() => setShowCreate(false)}
          onSaved={(id) => {
            setShowCreate(false);
            router.push(`/app/invoices?id=${id}`);
          }}
        />
      )}
    </div>
  );
}

function CreateInvoiceFlow({
  projects,
  onClose,
  onSaved,
}: {
  projects: Project[];
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [projectId, setProjectId] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (!projectId) {
      setMilestones([]);
      return;
    }
    supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
      .then(({ data }) => setMilestones((data as Milestone[]) ?? []));
  }, [projectId]);

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 py-10">
        <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold">New Invoice — choose a project</h2>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InvoiceFormModal
      clientId={project.client_id}
      projectId={project.id}
      milestones={milestones}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function InvoiceDetail({ id }: { id: string }) {
  const router = useRouter();
  const clients = useClientsLookup();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  async function load() {
    setLoading(true);
    const { data: inv } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
    if (inv) {
      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", (inv as Invoice).project_id).maybeSingle(),
        supabase.from("milestones").select("*").eq("project_id", (inv as Invoice).project_id),
      ]);
      setProject((p as Project) ?? null);
      setMilestones((m as Milestone[]) ?? []);
    }
    setInvoice((inv as Invoice) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (!invoice) return <EmptyState title="Invoice not found" />;

  const clientName = clients.find((c) => c.id === invoice.client_id)?.org_name ?? "—";

  return (
    <div>
      <button className="mb-4 text-sm text-slate-500 underline" onClick={() => router.push("/app/invoices")}>
        ← Back to billing
      </button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{invoice.invoice_ref}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <span className="text-sm text-slate-500">
              {clientName} {project && `· ${project.name}`}
            </span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setShowEdit(true)}>
          Edit
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Invoice date" value={formatDate(invoice.invoice_date)} />
            <Row label="Due date" value={formatDate(invoice.due_date)} />
            <Row label="Amount" value={formatCurrency(invoice.amount, invoice.currency)} />
            <Row label="Tax note" value={invoice.tax_note} />
          </dl>
          {invoice.invoice_file_link && (
            <p className="mt-3 text-sm">
              <a href={invoice.invoice_file_link} target="_blank" rel="noreferrer" className="text-sky-600 underline">
                Invoice file ↗
              </a>
            </p>
          )}
          {invoice.follow_up_notes && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Follow-up notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{invoice.follow_up_notes}</p>
            </>
          )}
        </Card>
        <Card className="p-4">
          <PaymentPanel invoice={invoice} onChanged={load} />
        </Card>
      </div>

      {showEdit && project && (
        <InvoiceFormModal
          invoice={invoice}
          clientId={project.client_id}
          projectId={project.id}
          milestones={milestones}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
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
