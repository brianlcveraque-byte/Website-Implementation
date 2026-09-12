"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, Project, Task } from "@/lib/database.types";
import { formatDate } from "@/lib/utils";
import { ErrorBlock, LoadingBlock } from "@/components/ui/Primitives";
import {
  STATUS_CLASS,
  STATUS_LABEL,
  STATUS_TO_DB,
  accentFor,
  fromDb,
  nextStatus,
  parseTrackerPaste,
  statusRank,
  type MonitoringStatus,
} from "@/lib/monitoring";

/**
 * The tracker, on one screen.
 *
 * WHAT THIS IS COMPETING WITH, and losing to until now: a Google Sheet. The app
 * had ten tabs and required a client, then a project of fifteen fields, then
 * optionally a milestone, before a single line of work could be written down.
 * Nobody used it. That is not a preference to be argued with, it is a verdict.
 *
 * So this page is built to beat a spreadsheet on a spreadsheet's own terms:
 * everything visible at once, one field to add a row, one click to change a
 * status, and a paste box that swallows the sheet whole. It also has to be
 * worth looking at — the old screens were grey on white, and a tool nobody
 * enjoys opening is a tool that quietly stops being opened.
 *
 * Optimistic throughout: a status that waits on a round trip before it moves
 * feels broken. A failed write snaps the row back and says so.
 */

// Widened to string deliberately: the column permits nine values, this screen
// edits four, and the generated Task type narrows status to a union.
type TaskRow = Omit<Task, "status"> & { status: string };

export default function MonitoringPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newProject, setNewProject] = useState("");
  const [busy, setBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importNote, setImportNote] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const [projectRes, taskRes, clientRes] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("org_name"),
    ]);
    // Surfaced, not swallowed: an empty page because the read was refused looks
    // identical to an empty page because there is no work, and those two need
    // very different reactions from whoever is looking at it.
    const failure = projectRes.error ?? taskRes.error ?? clientRes.error;
    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }
    setProjects((projectRes.data as Project[]) ?? []);
    setTasks((taskRes.data as TaskRow[]) ?? []);
    setClients((clientRes.data as Client[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const tally: Record<MonitoringStatus, number> = {
      not_started: 0,
      in_progress: 0,
      on_hold: 0,
      completed: 0,
    };
    for (const task of tasks) tally[fromDb(task.status)] += 1;
    return tally;
  }, [tasks]);

  const donePct = tasks.length ? Math.round((counts.completed / tasks.length) * 100) : 0;

  const byProject = useMemo(() => {
    const grouped = new Map<string, TaskRow[]>();
    for (const task of tasks) {
      const list = grouped.get(task.project_id) ?? [];
      list.push(task);
      grouped.set(task.project_id, list);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => statusRank(fromDb(a.status)) - statusRank(fromDb(b.status)));
    }
    return grouped;
  }, [tasks]);

  async function cycleStatus(task: TaskRow) {
    const dbValue = STATUS_TO_DB[nextStatus(fromDb(task.status))];
    const previous = task.status;
    setTasks((c) => c.map((t) => (t.id === task.id ? { ...t, status: dbValue } : t)));

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ status: dbValue })
      .eq("id", task.id);

    if (updateError) {
      setTasks((c) => c.map((t) => (t.id === task.id ? { ...t, status: previous } : t)));
      setError(`Could not update that: ${updateError.message}`);
    }
  }

  async function addTask(projectId: string) {
    const title = (draft[projectId] ?? "").trim();
    if (!title) return;
    setDraft((d) => ({ ...d, [projectId]: "" }));

    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({ project_id: projectId, title, status: "not_started" })
      .select()
      .single();

    if (insertError) {
      setError(`Could not add that: ${insertError.message}`);
      setDraft((d) => ({ ...d, [projectId]: title }));
      return;
    }
    setTasks((c) => [data as TaskRow, ...c]);
  }

  /** A project needs a client row, so one is made to match. One field, not two forms. */
  async function ensureProject(name: string): Promise<string | null> {
    const existing = projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;

    let clientId = clients.find((c) => c.org_name.toLowerCase() === name.toLowerCase())?.id;
    if (!clientId) {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({ org_name: name })
        .select()
        .single();
      if (clientError) {
        setError(`Could not create that: ${clientError.message}`);
        return null;
      }
      clientId = (client as Client).id;
      setClients((c) => [...c, client as Client]);
    }

    const { data, error: projectError } = await supabase
      .from("projects")
      .insert({ name, client_id: clientId, status: "in_progress" })
      .select()
      .single();

    if (projectError) {
      setError(`Could not create that: ${projectError.message}`);
      return null;
    }
    setProjects((c) => [...c, data as Project]);
    return (data as Project).id;
  }

  async function addProject() {
    const name = newProject.trim();
    if (!name) return;
    setBusy(true);
    const id = await ensureProject(name);
    if (id) setNewProject("");
    setBusy(false);
  }

  async function runImport() {
    const rows = parseTrackerPaste(importText);
    if (rows.length === 0) {
      setImportNote("Nothing recognisable in that. Copy the columns straight out of the sheet.");
      return;
    }

    setBusy(true);
    setImportNote(`Importing ${rows.length} rows…`);

    // Projects first, so every task has somewhere to land.
    const projectIds = new Map<string, string>();
    for (const name of new Set(rows.map((r) => r.project))) {
      const id = await ensureProject(name);
      if (id) projectIds.set(name, id);
    }

    const payload = rows
      .filter((r) => projectIds.has(r.project))
      .map((r) => ({
        project_id: projectIds.get(r.project)!,
        title: r.title.slice(0, 500),
        status: STATUS_TO_DB[r.status],
        comments: r.note,
      }));

    const { data, error: insertError } = await supabase.from("tasks").insert(payload).select();

    if (insertError) {
      setImportNote(`Import failed: ${insertError.message}`);
      setBusy(false);
      return;
    }

    setTasks((c) => [...((data as TaskRow[]) ?? []), ...c]);
    setImportNote(`Imported ${payload.length} rows across ${projectIds.size} projects.`);
    setImportText("");
    setBusy(false);
  }

  if (loading) return <LoadingBlock />;

  const preview = importText.trim() ? parseTrackerPaste(importText).length : 0;

  return (
    <div className="space-y-6">
      {/* Not grey on white. This is the screen someone opens every morning, and
          the thing it replaces is a colourful spreadsheet. */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
              Strategnosis
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Monitoring</h1>
            <p className="mt-1 text-sm text-white/80">
              {tasks.length === 0
                ? "Nothing tracked yet — paste your sheet in below."
                : `${counts.in_progress} ongoing · ${counts.not_started} not started · ${counts.on_hold} on hold`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold tabular-nums">{donePct}%</p>
            <p className="text-xs text-white/70">
              {counts.completed} of {tasks.length} done
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${donePct}%` }}
          />
        </div>
      </div>

      {error && <ErrorBlock message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProject()}
            placeholder="New project"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-violet-900/40"
          />
          <button
            onClick={addProject}
            disabled={busy || !newProject.trim()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-40 dark:bg-white dark:text-slate-900"
          >
            Add project
          </button>
          <button
            onClick={() => setImportOpen((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {importOpen ? "Close import" : "Paste from spreadsheet"}
          </button>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 select-none dark:text-slate-400">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          Show completed
        </label>
      </div>

      {importOpen && (
        <div className="rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-5 dark:border-violet-800 dark:bg-violet-950/20">
          <h2 className="text-sm font-semibold">Paste straight from the sheet</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Select the columns — <strong>Project · Status · Task · Notes</strong> — and paste. The
            project name only needs to appear on the first row of each block, exactly as your sheet
            has it.
          </p>
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportNote(null);
            }}
            rows={7}
            placeholder={"NIH Tobacco Policy Research\tCompleted\tMock Presentation\n\tOngoing\tFollow-up with DOH"}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={runImport}
              disabled={busy || preview === 0}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:opacity-40"
            >
              {busy ? "Importing…" : preview > 0 ? `Import ${preview} rows` : "Import"}
            </button>
            {importNote && <p className="text-sm text-slate-600 dark:text-slate-400">{importNote}</p>}
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-semibold">Nothing here yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Add a project above, or paste your spreadsheet in and it will build the projects for
            you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const all = byProject.get(project.id) ?? [];
            const visible = showCompleted
              ? all
              : all.filter((t) => fromDb(t.status) !== "completed");
            const done = all.filter((t) => fromDb(t.status) === "completed").length;
            const pct = all.length ? Math.round((done / all.length) * 100) : 0;
            const accent = accentFor(project.name);

            return (
              <section
                key={project.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`h-1.5 bg-gradient-to-r ${accent.bar}`} />

                <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${accent.soft}`}>
                  <h2 className={`font-semibold ${accent.text}`}>{project.name}</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${accent.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-600 tabular-nums dark:text-slate-400">
                      {all.length === 0 ? "no tasks" : `${done}/${all.length}`}
                    </p>
                  </div>
                </div>

                <ul className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
                  {visible.map((task) => {
                    const status = fromDb(task.status);
                    return (
                      <li key={task.id} className="group flex items-start gap-3 py-2.5">
                        <button
                          onClick={() => cycleStatus(task)}
                          title="Click to change status"
                          className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition hover:brightness-95 ${STATUS_CLASS[status]}`}
                        >
                          {STATUS_LABEL[status]}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm leading-snug ${
                              status === "completed"
                                ? "text-slate-400 line-through dark:text-slate-600"
                                : "text-slate-800 dark:text-slate-100"
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.comments && (
                            <p className="mt-0.5 text-xs text-slate-500">{task.comments}</p>
                          )}
                        </div>
                        {task.due_date && (
                          <p className="shrink-0 text-xs text-slate-400 tabular-nums">
                            {formatDate(task.due_date)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                  {visible.length === 0 && (
                    <li className="py-3 text-sm text-slate-400">
                      {all.length === 0 ? "Nothing yet." : "All done here."}
                    </li>
                  )}
                </ul>

                <div className="px-5 pt-1 pb-4">
                  <input
                    value={draft[project.id] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [project.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addTask(project.id)}
                    placeholder="+  Add a task and press Enter"
                    className="w-full rounded-xl border border-transparent bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white dark:bg-slate-800/60 dark:focus:bg-slate-800"
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
