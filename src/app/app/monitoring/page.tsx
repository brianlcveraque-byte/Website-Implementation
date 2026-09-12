"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, Project, Task } from "@/lib/database.types";
import { formatDate } from "@/lib/utils";
import { Card, EmptyState, ErrorBlock, LoadingBlock } from "@/components/ui/Primitives";
import { StatTile } from "@/components/ui/StatTile";
import {
  STATUS_CLASS,
  STATUS_LABEL,
  STATUS_TO_DB,
  fromDb,
  nextStatus,
  statusRank,
  type MonitoringStatus,
} from "@/lib/monitoring";

/**
 * Everything, on one screen.
 *
 * THE PROBLEM THIS SOLVES. Recording one line of work meant creating a client,
 * then a project with fifteen fields, optionally a milestone with fourteen more,
 * and only then a task — across three pages, out of ten in the navigation. The
 * tracker it was competing with is a single sheet where you type a row. The
 * sheet was winning, which is the only verdict that matters.
 *
 * So: every project and every task on one page, open work first, add a task by
 * typing it and pressing Enter, change a status by clicking it. The detailed
 * screens still exist for contract amounts, billing and assignment — this is
 * the one you look at daily, and it is deliberately the first thing in the nav.
 *
 * Optimistic updates throughout. A status click that waits on a round trip
 * before it moves feels broken, and this is a page someone clicks through
 * quickly; if a write fails the row snaps back and says so.
 */

// The status column is widened to string on purpose: the database allows nine
// values, this screen edits four, and Task types status as the narrow union.
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
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const [projectRes, taskRes, clientRes] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("org_name"),
    ]);
    // Surfaced, not swallowed: an empty page because the read was refused looks
    // exactly like an empty page because there is no work, and those need very
    // different reactions from whoever is looking.
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
    const target = nextStatus(fromDb(task.status));
    const dbValue = STATUS_TO_DB[target];
    const previous = task.status;

    setTasks((current) =>
      current.map((t) => (t.id === task.id ? { ...t, status: dbValue } : t)),
    );

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ status: dbValue })
      .eq("id", task.id);

    if (updateError) {
      setTasks((current) =>
        current.map((t) => (t.id === task.id ? { ...t, status: previous } : t)),
      );
      setError(`Could not update that status: ${updateError.message}`);
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
    setTasks((current) => [data as TaskRow, ...current]);
  }

  async function addProject() {
    const name = newProject.trim();
    if (!name) return;
    setCreating(true);

    // A project needs a client, so one is made to match rather than making
    // somebody fill in a client form first. It can be renamed later; what
    // matters now is that adding a project is one field.
    let clientId = clients.find((c) => c.org_name.toLowerCase() === name.toLowerCase())?.id;
    if (!clientId) {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({ org_name: name })
        .select()
        .single();
      if (clientError) {
        setError(`Could not create that: ${clientError.message}`);
        setCreating(false);
        return;
      }
      clientId = (client as Client).id;
      setClients((current) => [...current, client as Client]);
    }

    const { data, error: projectError } = await supabase
      .from("projects")
      .insert({ name, client_id: clientId, status: "in_progress" })
      .select()
      .single();

    if (projectError) {
      setError(`Could not create that: ${projectError.message}`);
      setCreating(false);
      return;
    }

    setProjects((current) => [...current, data as Project]);
    setNewProject("");
    setCreating(false);
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Monitoring</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every project and every task. Click a status to move it on; type in a project to add
          work.
        </p>
      </div>

      {error && <ErrorBlock message={error} />}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Ongoing" value={String(counts.in_progress)} />
        <StatTile label="Not started" value={String(counts.not_started)} />
        <StatTile label="On hold" value={String(counts.on_hold)} />
        <StatTile label="Completed" value={String(counts.completed)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(event) => setShowCompleted(event.target.checked)}
          />
          Show completed
        </label>

        <div className="flex items-center gap-2">
          <input
            value={newProject}
            onChange={(event) => setNewProject(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addProject();
            }}
            placeholder="New project"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={addProject}
            disabled={creating || !newProject.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {creating ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" />
      ) : (
        <div className="space-y-5">
          {projects.map((project) => {
            const all = byProject.get(project.id) ?? [];
            const visible = showCompleted
              ? all
              : all.filter((t) => fromDb(t.status) !== "completed");
            const done = all.filter((t) => fromDb(t.status) === "completed").length;

            return (
              <Card key={project.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h2 className="font-semibold">{project.name}</h2>
                  <p className="text-xs text-slate-500">
                    {all.length === 0
                      ? "no tasks yet"
                      : `${done} of ${all.length} done${
                          !showCompleted && done > 0 ? ` · ${done} hidden` : ""
                        }`}
                  </p>
                </div>

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visible.map((task) => {
                    const status = fromDb(task.status);
                    return (
                      <li key={task.id} className="flex items-start gap-3 py-2">
                        <button
                          onClick={() => cycleStatus(task)}
                          title="Click to change"
                          className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${STATUS_CLASS[status]}`}
                        >
                          {STATUS_LABEL[status]}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm ${
                              status === "completed"
                                ? "text-slate-400 line-through dark:text-slate-500"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.comments ? (
                            <p className="mt-0.5 text-xs text-slate-500">{task.comments}</p>
                          ) : null}
                        </div>
                        {task.due_date ? (
                          <p className="shrink-0 text-xs text-slate-500">
                            {formatDate(task.due_date)}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                <div className="pt-3">
                  <input
                    value={draft[project.id] ?? ""}
                    onChange={(event) =>
                      setDraft((d) => ({ ...d, [project.id]: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addTask(project.id);
                    }}
                    placeholder="Add a task and press Enter"
                    className="w-full rounded-lg border border-dashed border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
