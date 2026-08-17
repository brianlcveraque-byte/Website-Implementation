"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Expense, Invoice, Milestone, Payment, Project, Task } from "@/lib/database.types";
import { daysUntil, formatCurrency, formatDate, isDueSoon, isOverdue, titleCase } from "@/lib/utils";
import { LoadingBlock } from "@/components/ui/Primitives";

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
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          No open tasks assigned to you.
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
        </div>
      )}
    </div>
  );
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function FullDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newInquiries, setNewInquiries] = useState(0);

  useEffect(() => {
    const startOfYear = `${new Date().getFullYear()}-01-01`;
    Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("tasks").select("*").neq("status", "completed").neq("status", "cancelled"),
      supabase.from("milestones").select("*").neq("status", "completed").neq("status", "cancelled"),
      supabase.from("invoices").select("*").neq("status", "paid").neq("status", "cancelled"),
      supabase.from("payments").select("*").gte("payment_date", startOfYear),
      supabase.from("expenses").select("*").gte("expense_date", startOfYear),
      // Count only — the dashboard needs the number, not the rows. See
      // /app/leads for the triage view.
      supabase.from("public_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]).then(([p, t, m, i, pay, ex, inq]) => {
      setProjects((p.data as Project[]) ?? []);
      setTasks((t.data as Task[]) ?? []);
      setMilestones((m.data as Milestone[]) ?? []);
      setInvoices((i.data as Invoice[]) ?? []);
      setPayments((pay.data as Payment[]) ?? []);
      setExpenses((ex.data as Expense[]) ?? []);
      setNewInquiries(inq.count ?? 0);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingBlock />;

  const ytdRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const ytdExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = ytdRevenue - ytdExpenses;
  const netMarginPct = ytdRevenue > 0 ? (netProfit / ytdRevenue) * 100 : 0;
  const expensesByCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const activeProjects = projects.filter((p) => !["completed", "closed", "cancelled"].includes(p.status));
  const atRiskProjects = activeProjects.filter((p) => p.health_status === "red" || p.health_status === "amber");
  const healthCounts = activeProjects.reduce<Record<string, number>>((acc, p) => {
    const key = p.health_status ?? "gray";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const overdueTasks = tasks.filter((t) => isOverdue(t.due_date));
  const dueSoon30Tasks = tasks.filter((t) => isDueSoon(t.due_date, 30));
  const overdueMilestones = milestones.filter((m) => isOverdue(m.due_date));
  const dueSoon30Milestones = milestones.filter((m) => isDueSoon(m.due_date, 30));
  const overdueInvoices = invoices.filter((i) => isOverdue(i.due_date));
  const dueSoon30Invoices = invoices.filter((i) => isDueSoon(i.due_date, 30));
  const outstanding = invoices.reduce((s, i) => s + i.amount, 0);
  const expectedCollections30 = dueSoon30Invoices.reduce((s, i) => s + i.amount, 0);

  const arBuckets = invoices.reduce(
    (acc, inv) => {
      const daysPastDue = -(daysUntil(inv.due_date) ?? 0);
      if (daysPastDue <= 0) acc.current += inv.amount;
      else if (daysPastDue <= 30) acc.d1_30 += inv.amount;
      else if (daysPastDue <= 60) acc.d31_60 += inv.amount;
      else acc.d61plus += inv.amount;
      return acc;
    },
    { current: 0, d1_30: 0, d31_60: 0, d61plus: 0 }
  );

  const currentMonthIdx = new Date().getMonth();
  const revenueByMonth = Array.from({ length: currentMonthIdx + 1 }, (_, i) => ({
    month: MONTH_NAMES[i],
    total: payments.filter((p) => new Date(p.payment_date).getMonth() === i).reduce((s, p) => s + p.amount, 0),
  }));
  const maxMonthRevenue = Math.max(1, ...revenueByMonth.map((m) => m.total));

  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="-m-4 min-h-full bg-slate-950 p-4 text-slate-100 md:-m-6 md:p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Strategnosis Solutions</p>
        <h1 className="mt-1 text-xl font-semibold text-white">Executive Management Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">{monthLabel}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <DarkTile label="Revenue (YTD)" value={formatCurrency(ytdRevenue)} />
        <DarkTile label="Net Margin" value={`${netMarginPct.toFixed(1)}%`} tone={netMarginPct < 0 ? "red" : "emerald"} />
        <DarkTile label="Outstanding A/R" value={formatCurrency(outstanding)} tone={outstanding > 0 ? "amber" : "neutral"} />
        <DarkTile label="Active Projects" value={activeProjects.length} />
        <DarkTile label="Projects At Risk" value={atRiskProjects.length} tone={atRiskProjects.length ? "red" : "neutral"} />
        {/* Amber when anyone is waiting: an unanswered inquiry is the one number
            here that decays on its own if nobody looks at it. */}
        <DarkTile label="New Inquiries" value={newInquiries} tone={newInquiries ? "amber" : "neutral"} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <DarkCard title="Revenue Trend">
          {revenueByMonth.every((m) => m.total === 0) ? (
            <p className="text-sm text-slate-500">No payments recorded yet this year.</p>
          ) : (
            <div className="space-y-2.5">
              {revenueByMonth.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-xs text-slate-500">{m.month}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${(m.total / maxMonthRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-slate-400">{formatCurrency(m.total)}</span>
                </div>
              ))}
            </div>
          )}
        </DarkCard>

        <DarkCard title="Project Health">
          <div className="space-y-3">
            <HealthRow color="bg-emerald-400" label="On Track" count={healthCounts.green ?? 0} />
            <HealthRow color="bg-amber-400" label="At Risk" count={healthCounts.amber ?? 0} />
            <HealthRow color="bg-red-400" label="Critical" count={healthCounts.red ?? 0} />
            {(healthCounts.gray ?? 0) > 0 && <HealthRow color="bg-slate-500" label="Not set" count={healthCounts.gray} />}
            {activeProjects.length === 0 && <p className="text-sm text-slate-500">No active projects.</p>}
          </div>
        </DarkCard>
      </div>

      <div className="mb-6">
        <DarkCard title="Accounts Receivable Aging">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <AgingCell label="Current" value={arBuckets.current} />
            <AgingCell label="1–30 days" value={arBuckets.d1_30} />
            <AgingCell label="31–60 days" value={arBuckets.d31_60} />
            <AgingCell label="61+ days" value={arBuckets.d61plus} warn />
          </div>
        </DarkCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DarkCard title="Needs Attention" accent="red">
          <ul className="space-y-2 text-sm">
            {overdueTasks.map((t) => (
              <DarkRow
                key={`task-${t.id}`}
                label={`Task overdue: ${t.title}`}
                sub={formatDate(t.due_date)}
                onClick={() => router.push(`/app/projects?id=${t.project_id}`)}
              />
            ))}
            {overdueMilestones.map((m) => (
              <DarkRow
                key={`ms-${m.id}`}
                label={`Milestone overdue: ${m.title}`}
                sub={formatDate(m.due_date)}
                onClick={() => router.push(`/app/projects?id=${m.project_id}`)}
              />
            ))}
            {overdueInvoices.map((i) => (
              <DarkRow
                key={`inv-${i.id}`}
                label={`Invoice overdue: ${i.invoice_ref}`}
                sub={formatCurrency(i.amount, i.currency)}
                onClick={() => router.push(`/app/invoices?id=${i.id}`)}
              />
            ))}
            {overdueTasks.length + overdueMilestones.length + overdueInvoices.length === 0 && (
              <p className="text-slate-500">Nothing overdue. Nicely done.</p>
            )}
          </ul>
        </DarkCard>

        <DarkCard title="Next 30 Days" accent="amber">
          <ul className="space-y-1.5 text-sm text-slate-300">
            <li>{dueSoon30Tasks.length} task{dueSoon30Tasks.length === 1 ? "" : "s"} due</li>
            <li>{dueSoon30Milestones.length} milestone{dueSoon30Milestones.length === 1 ? "" : "s"} due</li>
            <li>{formatCurrency(expectedCollections30)} expected in collections</li>
          </ul>
          {expensesByCategory.length > 0 && (
            <div className="mt-4 border-t border-slate-800 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Expenses by category (YTD)</p>
              <ul className="space-y-1 text-sm">
                {expensesByCategory.map(([cat, amt]) => (
                  <li key={cat} className="flex justify-between text-slate-300">
                    <span>{titleCase(cat)}</span>
                    <span className="font-medium text-slate-100">{formatCurrency(amt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DarkCard>
      </div>
    </div>
  );
}

const toneColors: Record<string, string> = {
  neutral: "text-slate-100",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

function DarkTile({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: keyof typeof toneColors }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneColors[tone]}`}>{value}</p>
    </div>
  );
}

function DarkCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: "red" | "amber";
  children: React.ReactNode;
}) {
  const accentColor = accent === "red" ? "text-red-400" : accent === "amber" ? "text-amber-400" : "text-slate-200";
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className={`mb-3 text-xs font-semibold tracking-wide uppercase ${accentColor}`}>{title}</h2>
      {children}
    </div>
  );
}

function HealthRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-slate-300">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-100">{count}</span>
    </div>
  );
}

function AgingCell({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${warn && value > 0 ? "text-red-400" : "text-slate-100"}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function DarkRow({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <li
      className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-slate-300 hover:bg-slate-800/60"
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="text-xs text-slate-500">{sub}</span>
    </li>
  );
}
