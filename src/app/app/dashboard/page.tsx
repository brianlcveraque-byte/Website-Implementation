"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useClientsLookup } from "@/lib/hooks";
import type { Expense, Invoice, Milestone, Opportunity, Payment, Project, Task } from "@/lib/database.types";
import { daysUntil, formatCurrency, formatDate, isDueSoon, isOverdue } from "@/lib/utils";
import { StatTile } from "@/components/ui/StatTile";
import { Card, LoadingBlock } from "@/components/ui/Primitives";

export default function DashboardPage() {
  const { profile } = useAuth();
  if (profile?.role === "temp_consultant") return <TempDashboard />;
  return <FullDashboard />;
}

function TempDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tasks")
      .select("*")
      .neq("status", "completed")
      .order("due_date")
      .then(({ data }) => {
        setTasks((data as Task[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Welcome, {profile?.full_name}</h1>
      <p className="mb-6 text-sm text-slate-500">Here&apos;s what&apos;s on your plate.</p>
      {loading ? (
        <LoadingBlock />
      ) : tasks.length === 0 ? (
        <Card className="p-6 text-center text-sm text-slate-400">No open tasks assigned to you.</Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm"
                onClick={() => router.push(`/app/projects?id=${t.project_id}`)}
              >
                <span className="font-medium">{t.title}</span>
                <span className={isOverdue(t.due_date) ? "font-medium text-red-600" : "text-slate-500"}>
                  {formatDate(t.due_date)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function FullDashboard() {
  const router = useRouter();
  const clients = useClientsLookup();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const startOfYear = `${new Date().getFullYear()}-01-01`;
    Promise.all([
      supabase.from("opportunities").select("*"),
      supabase.from("projects").select("*"),
      supabase.from("tasks").select("*").neq("status", "completed").neq("status", "cancelled"),
      supabase.from("milestones").select("*").neq("status", "completed").neq("status", "cancelled"),
      supabase.from("invoices").select("*").neq("status", "paid").neq("status", "cancelled"),
      supabase.from("payments").select("*").gte("payment_date", startOfYear),
      supabase.from("expenses").select("*").gte("expense_date", startOfYear),
    ]).then(([o, p, t, m, i, pay, ex]) => {
      setOpportunities((o.data as Opportunity[]) ?? []);
      setProjects((p.data as Project[]) ?? []);
      setTasks((t.data as Task[]) ?? []);
      setMilestones((m.data as Milestone[]) ?? []);
      setInvoices((i.data as Invoice[]) ?? []);
      setPayments((pay.data as Payment[]) ?? []);
      setExpenses((ex.data as Expense[]) ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingBlock />;

  const activeOpps = opportunities.filter((o) => !["won", "lost"].includes(o.stage));
  const pipelineValue = activeOpps.reduce((s, o) => s + (o.estimated_value ?? 0), 0);
  const ytdRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const ytdExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = ytdRevenue - ytdExpenses;
  const activeProjects = projects.filter((p) => !["completed", "closed", "cancelled"].includes(p.status));
  const atRiskProjects = activeProjects.filter((p) => p.health_status === "red" || p.health_status === "amber");
  const overdueOpps = activeOpps.filter((o) => isOverdue(o.next_action_due));
  const staleOpps = activeOpps.filter((o) => {
    const days = daysUntil(o.last_activity_at);
    return days !== null && days < -14;
  });
  const overdueTasks = tasks.filter((t) => isOverdue(t.due_date));
  const dueSoonTasks = tasks.filter((t) => isDueSoon(t.due_date, 7));
  const dueSoon30Tasks = tasks.filter((t) => isDueSoon(t.due_date, 30));
  const overdueMilestones = milestones.filter((m) => isOverdue(m.due_date));
  const overdueInvoices = invoices.filter((i) => isOverdue(i.due_date));
  const outstanding = invoices.reduce((s, i) => s + i.amount, 0);
  const clientName = (id: string) => clients.find((c) => c.id === id)?.org_name ?? "…";

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Pipeline value" value={formatCurrency(pipelineValue)} />
        <StatTile
          label="Net profit (YTD)"
          value={formatCurrency(netProfit)}
          tone={netProfit < 0 ? "red" : "green"}
        />
        <StatTile label="Active projects" value={activeProjects.length} tone={atRiskProjects.length ? "amber" : "neutral"} />
        <StatTile label="Projects at risk" value={atRiskProjects.length} tone={atRiskProjects.length ? "red" : "neutral"} />
        <StatTile label="Overdue tasks" value={overdueTasks.length} tone={overdueTasks.length ? "red" : "neutral"} />
        <StatTile label="Due within 7 days" value={dueSoonTasks.length} tone={dueSoonTasks.length ? "amber" : "neutral"} />
        <StatTile label="Overdue invoices" value={overdueInvoices.length} tone={overdueInvoices.length ? "red" : "neutral"} />
        <StatTile label="Outstanding receivables" value={formatCurrency(outstanding)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-red-700 dark:text-red-400">Needs your attention</h2>
          <ul className="space-y-2 text-sm">
            {overdueOpps.map((o) => (
              <AttentionRow
                key={`opp-${o.id}`}
                label={`${o.title} — next action overdue`}
                sub={clientName(o.client_id)}
                onClick={() => router.push(`/app/opportunities?id=${o.id}`)}
              />
            ))}
            {staleOpps.map((o) => (
              <AttentionRow
                key={`stale-${o.id}`}
                label={`${o.title} — no activity in 14+ days`}
                sub={clientName(o.client_id)}
                onClick={() => router.push(`/app/opportunities?id=${o.id}`)}
              />
            ))}
            {overdueTasks.map((t) => (
              <AttentionRow
                key={`task-${t.id}`}
                label={`Task overdue: ${t.title}`}
                sub={formatDate(t.due_date)}
                onClick={() => router.push(`/app/projects?id=${t.project_id}`)}
              />
            ))}
            {overdueMilestones.map((m) => (
              <AttentionRow
                key={`ms-${m.id}`}
                label={`Milestone overdue: ${m.title}`}
                sub={formatDate(m.due_date)}
                onClick={() => router.push(`/app/projects?id=${m.project_id}`)}
              />
            ))}
            {overdueInvoices.map((i) => (
              <AttentionRow
                key={`inv-${i.id}`}
                label={`Invoice overdue: ${i.invoice_ref}`}
                sub={formatCurrency(i.amount, i.currency)}
                onClick={() => router.push(`/app/invoices?id=${i.id}`)}
              />
            ))}
            {overdueOpps.length +
              staleOpps.length +
              overdueTasks.length +
              overdueMilestones.length +
              overdueInvoices.length ===
              0 && <p className="text-slate-400">Nothing overdue. Nicely done.</p>}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-400">Coming up</h2>
          <ul className="space-y-2 text-sm">
            {dueSoon30Tasks.slice(0, 15).map((t) => (
              <AttentionRow
                key={`up-task-${t.id}`}
                label={t.title}
                sub={formatDate(t.due_date)}
                onClick={() => router.push(`/app/projects?id=${t.project_id}`)}
              />
            ))}
            {dueSoon30Tasks.length === 0 && <p className="text-slate-400">Nothing scheduled in the next 30 days.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function AttentionRow({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <li className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={onClick}>
      <span>{label}</span>
      <span className="text-xs text-slate-400">{sub}</span>
    </li>
  );
}
