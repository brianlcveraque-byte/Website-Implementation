"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAppUsers } from "@/lib/hooks";
import type { Project, Task, TaskStatus } from "@/lib/database.types";
import { daysUntil, formatDate, isOverdue, titleCase } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, EmptyState, LoadingBlock, Select } from "@/components/ui/Primitives";

export default function TasksPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const users = useAppUsers();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from("tasks").select("*").neq("status", "cancelled").order("due_date"),
      supabase.from("projects").select("*"),
    ]);
    setTasks((t as Task[]) ?? []);
    setProjects((p as Project[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleComplete(task: Task) {
    const nextStatus: TaskStatus = task.status === "completed" ? "in_progress" : "completed";
    await supabase.from("tasks").update({ status: nextStatus }).eq("id", task.id);
    load();
  }

  const filtered = tasks.filter((t) => {
    if (assigneeFilter && t.assigned_to !== assigneeFilter) return false;
    if (projectFilter && t.project_id !== projectFilter) return false;
    return true;
  });

  const overdue = filtered.filter((t) => isOverdue(t.due_date) && t.status !== "completed");
  const thisWeek = filtered.filter((t) => {
    const d = daysUntil(t.due_date);
    return d !== null && d >= 0 && d <= 7 && t.status !== "completed";
  });
  const later = filtered.filter((t) => {
    const d = daysUntil(t.due_date);
    return t.status !== "completed" && (d === null || d > 7);
  });
  const completed = filtered.filter((t) => t.status === "completed");

  const workload = useMemo(() => {
    const map = new Map<string, number>();
    tasks
      .filter((t) => t.status !== "completed")
      .forEach((t) => {
        if (!t.assigned_to) return;
        map.set(t.assigned_to, (map.get(t.assigned_to) ?? 0) + 1);
      });
    return users.map((u) => ({ name: u.full_name, count: map.get(u.id) ?? 0 })).filter((w) => w.count > 0);
  }, [tasks, users]);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "…";

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">{profile?.role === "temp_consultant" ? "My Tasks" : "Tasks"}</h1>

      {profile?.role !== "temp_consultant" && (
        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="max-w-xs">
            <option value="">All assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </Select>
          <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="max-w-xs">
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {profile?.role !== "temp_consultant" && workload.length > 0 && (
        <Card className="mb-6 p-4">
          <h2 className="mb-2 text-sm font-semibold">Workload</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {workload.map((w) => (
              <span key={w.name}>
                {w.name}: <strong>{w.count}</strong> open
              </span>
            ))}
          </div>
        </Card>
      )}

      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No tasks" />
      ) : (
        <div className="space-y-6">
          <TaskGroup
            title="Overdue"
            tasks={overdue}
            tone="red"
            users={users}
            projectName={projectName}
            onToggle={toggleComplete}
            onOpen={(t) => router.push(`/app/projects?id=${t.project_id}`)}
          />
          <TaskGroup
            title="Due this week"
            tasks={thisWeek}
            tone="amber"
            users={users}
            projectName={projectName}
            onToggle={toggleComplete}
            onOpen={(t) => router.push(`/app/projects?id=${t.project_id}`)}
          />
          <TaskGroup
            title="Later"
            tasks={later}
            tone="gray"
            users={users}
            projectName={projectName}
            onToggle={toggleComplete}
            onOpen={(t) => router.push(`/app/projects?id=${t.project_id}`)}
          />
          {completed.length > 0 && (
            <TaskGroup
              title="Completed"
              tasks={completed}
              tone="green"
              users={users}
              projectName={projectName}
              onToggle={toggleComplete}
              onOpen={(t) => router.push(`/app/projects?id=${t.project_id}`)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  users,
  projectName,
  onToggle,
  onOpen,
}: {
  title: string;
  tasks: Task[];
  tone: "red" | "amber" | "gray" | "green";
  users: { id: string; full_name: string }[];
  projectName: (id: string) => string;
  onToggle: (t: Task) => void;
  onOpen: (t: Task) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">
        {title} ({tasks.length})
      </h2>
      <Card>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={t.status === "completed"}
                onChange={() => onToggle(t)}
                className="h-4 w-4"
              />
              <button className="flex-1 text-left hover:underline" onClick={() => onOpen(t)}>
                <span className="font-medium">{t.title}</span>{" "}
                <span className="text-slate-400">— {projectName(t.project_id)}</span>
              </button>
              <span className="text-xs text-slate-500">
                {users.find((u) => u.id === t.assigned_to)?.full_name ?? "Unassigned"}
              </span>
              <span className="text-xs text-slate-500">{formatDate(t.due_date)}</span>
              <StatusBadge status={t.priority} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
