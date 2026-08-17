"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { InquiryStatus, PublicInquiry, ToolkitLead } from "@/lib/database.types";
import { formatDateTime, titleCase } from "@/lib/utils";
import { Button, Card, EmptyState, ErrorBlock, LoadingBlock, Select } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";

// The triage surface for everything the public funnel produces.
//
// Until this page existed, public_inquiries was written by the landing page and
// read by nothing at all — a lead could sit in the database indefinitely while
// the daily digest reported cheerfully on tasks and invoices. The schema always
// anticipated this (status and opportunity_id have been there since 0001); the
// interface simply was never built.
//
// Two different things are listed here on purpose. An inquiry is someone asking
// to buy and needs a reply. A workbook download is a name on a list and needs
// nothing — but seeing the ratio between them is how you tell whether the
// funnel's problem is traffic or conversion.

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "new", label: "New — needs a reply" },
  { value: "converted", label: "Converted" },
  { value: "spam", label: "Spam" },
  { value: "", label: "All inquiries" },
];

export default function LeadsPage() {
  const [inquiries, setInquiries] = useState<PublicInquiry[]>([]);
  const [leads, setLeads] = useState<ToolkitLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("new");
  const [busyId, setBusyId] = useState<string | null>(null);
  // Derived at load time rather than during render: "7 days ago" depends on the
  // clock, and reading it while rendering is an impure render.
  const [leadsThisWeek, setLeadsThisWeek] = useState(0);

  async function load() {
    setLoading(true);
    setError(null);
    const [inqRes, leadRes] = await Promise.all([
      supabase.from("public_inquiries").select("*").order("submitted_at", { ascending: false }),
      supabase.from("toolkit_leads").select("*").order("downloaded_at", { ascending: false }),
    ]);
    // Surfaced rather than swallowed: an empty page because RLS refused the
    // read looks identical to an empty page because nobody has enquired, and
    // those need very different responses from whoever is looking.
    if (inqRes.error || leadRes.error) {
      setError(inqRes.error?.message ?? leadRes.error?.message ?? "Could not load leads.");
      setLoading(false);
      return;
    }
    const leadRows = (leadRes.data as ToolkitLead[]) ?? [];
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
    setInquiries((inqRes.data as PublicInquiry[]) ?? []);
    setLeads(leadRows);
    setLeadsThisWeek(leadRows.filter((l) => l.downloaded_at >= weekAgo).length);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: InquiryStatus) {
    setBusyId(id);
    // Optimistic: the row updates immediately and reverts if the write fails.
    const previous = inquiries;
    setInquiries((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error: updateError } = await supabase
      .from("public_inquiries")
      .update({ status })
      .eq("id", id);
    if (updateError) {
      setInquiries(previous);
      setError(updateError.message);
    }
    setBusyId(null);
  }

  if (loading) return <LoadingBlock />;

  const newCount = inquiries.filter((i) => i.status === "new").length;
  const shown = statusFilter ? inquiries.filter((i) => i.status === statusFilter) : inquiries;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Leads</h1>
        <p className="text-sm text-slate-500">Everything the public site has produced.</p>
      </div>

      {error && <ErrorBlock message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Inquiries awaiting reply" value={String(newCount)} />
        <StatTile label="Workbook downloads (7 days)" value={String(leadsThisWeek)} />
        <StatTile label="Downloads all time" value={String(leads.length)} />
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Inquiries</h2>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="max-w-xs"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
            <Button onClick={load}>Refresh</Button>
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState
            title={statusFilter === "new" ? "Nothing waiting on you" : "No inquiries here"}
            hint={
              statusFilter === "new"
                ? "New inquiries appear here and email you within five minutes of arriving."
                : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {shown.map((inq) => (
              <Card key={inq.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{inq.name}</p>
                      <StatusBadge status={inq.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {inq.organization || "No organization given"} · {formatDateTime(inq.submitted_at)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <a href={`mailto:${inq.email}`} className="font-medium text-indigo-600 hover:underline">
                      {inq.email}
                    </a>
                    {inq.phone && <p className="text-slate-500">{inq.phone}</p>}
                  </div>
                </div>

                {inq.service_interest && (
                  <p className="mt-3 text-sm">
                    <span className="text-slate-500">Interested in </span>
                    <span className="font-medium">{inq.service_interest}</span>
                  </p>
                )}

                {inq.message && (
                  <p className="mt-3 border-l-2 border-slate-200 pl-3 text-sm whitespace-pre-wrap text-slate-700 dark:border-slate-700 dark:text-slate-300">
                    {inq.message}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {inq.status !== "converted" && (
                    <Button disabled={busyId === inq.id} onClick={() => setStatus(inq.id, "converted")}>
                      Mark converted
                    </Button>
                  )}
                  {inq.status !== "new" && (
                    <Button disabled={busyId === inq.id} onClick={() => setStatus(inq.id, "new")}>
                      Reopen
                    </Button>
                  )}
                  {inq.status !== "spam" && (
                    <Button disabled={busyId === inq.id} onClick={() => setStatus(inq.id, "spam")}>
                      Spam
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Workbook downloads</h2>
        <p className="mb-3 text-sm text-slate-500">
          People who took the free toolkit. No reply expected — they are the pool the paid tiers
          are sold to.
        </p>
        {leads.length === 0 ? (
          <EmptyState title="No downloads yet" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Organization</th>
                    <th className="py-2 pr-4 font-medium">Source</th>
                    <th className="py-2 font-medium">Downloaded</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="py-2 pr-4">{l.name || "—"}</td>
                      <td className="py-2 pr-4">
                        <a href={`mailto:${l.email}`} className="text-indigo-600 hover:underline">
                          {l.email}
                        </a>
                      </td>
                      <td className="py-2 pr-4">{l.organization || "—"}</td>
                      <td className="py-2 pr-4 text-slate-500">{titleCase(l.source ?? "unknown")}</td>
                      <td className="py-2 text-slate-500">{formatDateTime(l.downloaded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
