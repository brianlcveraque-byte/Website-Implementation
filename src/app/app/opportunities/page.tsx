"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAppUsers, useClientsLookup, useServices } from "@/lib/hooks";
import type {
  Client,
  Opportunity,
  OpportunityStage,
  OpportunityStageHistory,
} from "@/lib/database.types";
import {
  OPPORTUNITY_STAGES,
  daysUntil,
  formatCurrency,
  formatDate,
  formatDateTime,
  isOverdue,
  titleCase,
} from "@/lib/utils";
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

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <OpportunitiesContent />
    </Suspense>
  );
}

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return id ? <OpportunityDetail id={id} /> : <OpportunityBoard />;
}

function OpportunityBoard() {
  const router = useRouter();
  const clients = useClientsLookup();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"board" | "list">("board");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });
    setOpportunities((data as Opportunity[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.org_name ?? "…";

  async function changeStage(opp: Opportunity, stage: OpportunityStage) {
    await supabase.from("opportunities").update({ stage }).eq("id", opp.id);
    await supabase.from("opportunity_stage_history").insert({
      opportunity_id: opp.id,
      from_stage: opp.stage,
      to_stage: stage,
    });
    load();
  }

  const totalValue = opportunities
    .filter((o) => !["won", "lost"].includes(o.stage))
    .reduce((sum, o) => sum + (o.estimated_value ?? 0), 0);
  const weightedValue = opportunities
    .filter((o) => !["won", "lost"].includes(o.stage))
    .reduce((sum, o) => sum + (o.weighted_value ?? 0), 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Opportunities</h1>
          <p className="text-sm text-slate-500">
            Pipeline value {formatCurrency(totalValue)} · weighted {formatCurrency(weightedValue)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView(view === "board" ? "list" : "board")}>
            {view === "board" ? "List view" : "Board view"}
          </Button>
          <Button onClick={() => setShowCreate(true)}>+ New Opportunity</Button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : opportunities.length === 0 ? (
        <EmptyState title="No opportunities yet" hint="Log your first lead to start the pipeline." />
      ) : view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {OPPORTUNITY_STAGES.map((stage) => {
            const items = opportunities.filter((o) => o.stage === stage);
            return (
              <div key={stage} className="w-64 shrink-0">
                <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  {titleCase(stage)} <span className="text-slate-400">({items.length})</span>
                </h3>
                <div className="space-y-2">
                  {items.map((o) => (
                    <Card
                      key={o.id}
                      className="cursor-pointer p-3 hover:border-slate-400"
                      onClick={() => router.push(`/app/opportunities?id=${o.id}`)}
                    >
                      <p className="text-sm font-medium">{o.title}</p>
                      <p className="text-xs text-slate-500">{clientName(o.client_id)}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatCurrency(o.estimated_value, o.currency)}</p>
                      {o.next_action_due && (
                        <p className={`mt-1 text-xs ${isOverdue(o.next_action_due) ? "font-medium text-red-600" : "text-slate-400"}`}>
                          Next: {formatDate(o.next_action_due)}
                        </p>
                      )}
                      <select
                        className="mt-2 w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                        value={o.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => changeStage(o, e.target.value as OpportunityStage)}
                      >
                        {OPPORTUNITY_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {titleCase(s)}
                          </option>
                        ))}
                      </select>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Stage</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Next action due</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  onClick={() => router.push(`/app/opportunities?id=${o.id}`)}
                >
                  <td className="px-4 py-2.5 font-medium">{o.title}</td>
                  <td className="px-4 py-2.5 text-slate-500">{clientName(o.client_id)}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={o.stage} />
                  </td>
                  <td className="px-4 py-2.5">{formatCurrency(o.estimated_value, o.currency)}</td>
                  <td className={`px-4 py-2.5 ${isOverdue(o.next_action_due) ? "font-medium text-red-600" : "text-slate-500"}`}>
                    {formatDate(o.next_action_due)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate && (
        <OpportunityFormModal
          onClose={() => setShowCreate(false)}
          onSaved={(newId) => {
            setShowCreate(false);
            router.push(`/app/opportunities?id=${newId}`);
          }}
        />
      )}
    </div>
  );
}

function OpportunityFormModal({
  opportunity,
  onClose,
  onSaved,
}: {
  opportunity?: Opportunity;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { profile } = useAuth();
  const clients = useClientsLookup();
  const services = useServices();
  const users = useAppUsers();

  const [form, setForm] = useState({
    title: opportunity?.title ?? "",
    client_id: opportunity?.client_id ?? "",
    service_id: opportunity?.service_id ?? "",
    description: opportunity?.description ?? "",
    source: opportunity?.source ?? "",
    estimated_value: opportunity?.estimated_value?.toString() ?? "",
    currency: opportunity?.currency ?? "PHP",
    probability_pct: opportunity?.probability_pct ?? 10,
    owner_id: opportunity?.owner_id ?? profile?.id ?? "",
    stage: opportunity?.stage ?? ("new_inquiry" as OpportunityStage),
    next_action: opportunity?.next_action ?? "",
    next_action_due: opportunity?.next_action_due ?? "",
    proposal_deadline: opportunity?.proposal_deadline ?? "",
    proposal_file_link: opportunity?.proposal_file_link ?? "",
    terms_of_reference_link: opportunity?.terms_of_reference_link ?? "",
    notes: opportunity?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.client_id) {
      setError("Title and client are required.");
      return;
    }
    if (!form.next_action.trim() || !form.next_action_due) {
      setError("Every active opportunity needs a next action and a due date.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      service_id: form.service_id || null,
      proposal_file_link: form.proposal_file_link || null,
      terms_of_reference_link: form.terms_of_reference_link || null,
      last_activity_at: new Date().toISOString(),
    };
    if (opportunity) {
      const { error: updateError } = await supabase
        .from("opportunities")
        .update({ ...payload, updated_by: profile?.id })
        .eq("id", opportunity.id);
      setSaving(false);
      if (updateError) return setError(updateError.message);
      onSaved(opportunity.id);
    } else {
      const { data, error: insertError } = await supabase
        .from("opportunities")
        .insert({ ...payload, created_by: profile?.id, updated_by: profile?.id })
        .select()
        .single();
      setSaving(false);
      if (insertError) return setError(insertError.message);
      onSaved((data as Opportunity).id);
    }
  }

  return (
    <Modal title={opportunity ? "Edit Opportunity" : "New Opportunity"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
          <Field label="Owner">
            <Select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Estimated value">
            <Input
              type="number"
              value={form.estimated_value}
              onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
            />
          </Field>
          <Field label="Probability (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.probability_pct}
              onChange={(e) => setForm({ ...form, probability_pct: Number(e.target.value) })}
            />
          </Field>
          <Field label="Source">
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </Field>
          <Field label="Stage">
            <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as OpportunityStage })}>
              {OPPORTUNITY_STAGES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Next action *">
            <Input
              required
              value={form.next_action}
              onChange={(e) => setForm({ ...form, next_action: e.target.value })}
            />
          </Field>
          <Field label="Next action due *">
            <Input
              type="date"
              required
              value={form.next_action_due}
              onChange={(e) => setForm({ ...form, next_action_due: e.target.value })}
            />
          </Field>
          <Field label="Proposal deadline">
            <Input
              type="date"
              value={form.proposal_deadline}
              onChange={(e) => setForm({ ...form, proposal_deadline: e.target.value })}
            />
          </Field>
          <Field label="Proposal file link">
            <Input
              value={form.proposal_file_link}
              onChange={(e) => setForm({ ...form, proposal_file_link: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Description">
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
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

function OpportunityDetail({ id }: { id: string }) {
  const router = useRouter();
  const clients = useClientsLookup();
  const users = useAppUsers();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [history, setHistory] = useState<OpportunityStageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showLost, setShowLost] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: o }, { data: h }] = await Promise.all([
      supabase.from("opportunities").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("opportunity_stage_history")
        .select("*")
        .eq("opportunity_id", id)
        .order("changed_at", { ascending: false }),
    ]);
    setOpp((o as Opportunity) ?? null);
    setHistory((h as OpportunityStageHistory[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function markWon() {
    setConverting(true);
    setConvertError(null);
    const { data, error } = await supabase.rpc("convert_opportunity_to_project", {
      p_opportunity_id: id,
    });
    setConverting(false);
    if (error) {
      setConvertError(error.message);
      return;
    }
    router.push(`/app/projects?id=${data}`);
  }

  if (loading) return <LoadingBlock />;
  if (!opp) return <EmptyState title="Opportunity not found" />;

  const clientName = clients.find((c) => c.id === opp.client_id)?.org_name ?? "—";
  const ownerName = users.find((u) => u.id === opp.owner_id)?.full_name ?? "—";

  return (
    <div>
      <button className="mb-4 text-sm text-slate-500 underline" onClick={() => router.push("/app/opportunities")}>
        ← Back to opportunities
      </button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{opp.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={opp.stage} />
            <span className="text-sm text-slate-500">{clientName}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowEdit(true)}>
            Edit
          </Button>
          {opp.stage !== "won" && opp.stage !== "lost" && (
            <>
              <Button onClick={markWon} disabled={converting}>
                {converting ? "Converting…" : "Mark Won → Create Project"}
              </Button>
              <Button variant="danger" onClick={() => setShowLost(true)}>
                Mark Lost
              </Button>
            </>
          )}
        </div>
      </div>
      {convertError && <ErrorBlock message={convertError} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Owner" value={ownerName} />
            <Row label="Source" value={opp.source} />
            <Row label="Estimated value" value={formatCurrency(opp.estimated_value, opp.currency)} />
            <Row label="Probability" value={`${opp.probability_pct}%`} />
            <Row label="Weighted value" value={formatCurrency(opp.weighted_value, opp.currency)} />
            <Row label="Proposal deadline" value={formatDate(opp.proposal_deadline)} />
            <Row label="Expected decision" value={formatDate(opp.expected_decision_date)} />
            <Row label="Expected start" value={formatDate(opp.expected_start_date)} />
          </dl>
          {opp.description && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{opp.description}</p>
            </>
          )}
          {opp.proposal_file_link && (
            <p className="mt-3 text-sm">
              <a href={opp.proposal_file_link} target="_blank" rel="noreferrer" className="text-sky-600 underline">
                Proposal file ↗
              </a>
            </p>
          )}
          {opp.notes && (
            <>
              <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-400">Notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{opp.notes}</p>
            </>
          )}
          {(opp.reason_won || opp.reason_lost) && (
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800">
              <strong>{opp.reason_won ? "Why won: " : "Why lost: "}</strong>
              {opp.reason_won || opp.reason_lost}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Next action</h2>
          <p className="text-sm font-medium">{opp.next_action || "None set"}</p>
          {opp.next_action_due && (
            <p className={`mt-1 text-sm ${isOverdue(opp.next_action_due) ? "font-medium text-red-600" : "text-slate-500"}`}>
              Due {formatDate(opp.next_action_due)}
              {isOverdue(opp.next_action_due) && ` — ${Math.abs(daysUntil(opp.next_action_due)!)} days overdue`}
            </p>
          )}

          <h2 className="mb-2 mt-5 text-sm font-semibold">Stage history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No stage changes logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{titleCase(h.to_stage)}</span>{" "}
                  — {formatDateTime(h.changed_at)}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {showEdit && (
        <OpportunityFormModal opportunity={opp} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />
      )}
      {showLost && (
        <MarkLostModal
          opportunity={opp}
          onClose={() => setShowLost(false)}
          onSaved={() => {
            setShowLost(false);
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

function MarkLostModal({
  opportunity,
  onClose,
  onSaved,
}: {
  opportunity: Opportunity;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return setError("A reason is required when marking an opportunity lost.");
    setSaving(true);
    const { error: updateError } = await supabase
      .from("opportunities")
      .update({ stage: "lost", reason_lost: reason })
      .eq("id", opportunity.id);
    if (!updateError) {
      await supabase.from("opportunity_stage_history").insert({
        opportunity_id: opportunity.id,
        from_stage: opportunity.stage,
        to_stage: "lost",
        note: reason,
      });
    }
    setSaving(false);
    if (updateError) return setError(updateError.message);
    onSaved();
  }

  return (
    <Modal title="Mark as Lost" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Reason lost *">
          <Textarea rows={3} required value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        {error && <ErrorBlock message={error} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={saving}>
            {saving ? "Saving…" : "Mark Lost"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
