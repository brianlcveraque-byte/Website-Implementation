"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LoadingBlock } from "@/components/ui/Primitives";

const FULL_NAV = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/opportunities", label: "Opportunities" },
  { href: "/app/projects", label: "Projects" },
  { href: "/app/tasks", label: "Tasks" },
  { href: "/app/consultants", label: "Consultants" },
  { href: "/app/invoices", label: "Billing" },
  { href: "/app/settings", label: "Settings" },
];

const TEMP_NAV = [
  { href: "/app/dashboard", label: "My Work" },
  { href: "/app/tasks", label: "Tasks" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingBlock />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!profile || !profile.active) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-medium">Your account isn&apos;t active yet</p>
        <p className="max-w-sm text-sm text-slate-500">
          An owner needs to approve your access and assign a role before you can use the
          system. Reach out to whoever invited you.
        </p>
        <button className="text-sm underline" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  const nav = profile.role === "temp_consultant" ? TEMP_NAV : FULL_NAV;

  return (
    <div className="flex flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white px-3 py-6 dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="mb-6 px-2 text-sm font-semibold">Strategnosis Hub</div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-2.5 py-2 text-sm font-medium ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <span className="text-sm font-semibold">Strategnosis Hub</span>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <header className="hidden items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900 md:flex">
          <span className="text-sm text-slate-500">
            {profile.full_name} · <span className="capitalize">{profile.role.replace("_", " ")}</span>
          </span>
          <button
            className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
