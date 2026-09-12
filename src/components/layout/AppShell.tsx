"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LoadingBlock } from "@/components/ui/Primitives";

/**
 * Three things, and everything else folded away.
 *
 * There were ten tabs. The tool went unused and the work stayed in a Google
 * Sheet, and ten tabs is a large part of why: recording one line of work meant
 * choosing between Clients, Projects and Tasks before typing anything.
 *
 * NOTHING IS DELETED. Clients, Projects, Opportunities, Consultants, Billing
 * and Expenses still exist and still work — they are behind "More", because
 * they are occasional and the daily view no longer routes through them. A tab
 * removed from a nav can come back in one line; a page deleted cannot.
 */
const PRIMARY_NAV = [
  { href: "/app/monitoring", label: "Monitoring" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/dashboard", label: "Money" },
];

const SECONDARY_NAV = [
  { href: "/app/clients", label: "Clients" },
  { href: "/app/opportunities", label: "Opportunities" },
  { href: "/app/projects", label: "Projects" },
  { href: "/app/tasks", label: "Tasks" },
  { href: "/app/consultants", label: "Consultants" },
  { href: "/app/invoices", label: "Billing" },
  { href: "/app/expenses", label: "Expenses" },
  { href: "/app/settings", label: "Settings" },
];

const FULL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

const TEMP_NAV = [
  { href: "/app/monitoring", label: "Monitoring" },
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

  const isTemp = profile.role === "temp_consultant";
  const primary = isTemp ? TEMP_NAV : PRIMARY_NAV;
  const secondary = isTemp ? [] : SECONDARY_NAV;
  const nav = isTemp ? TEMP_NAV : FULL_NAV;
  const inSecondary = secondary.some((item) => pathname?.startsWith(item.href));

  const linkClass = (active: boolean) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="flex flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white px-3 py-6 dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="mb-6 px-2 text-sm font-semibold">Strategnosis Hub</div>
        <nav className="space-y-1">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(Boolean(pathname?.startsWith(item.href)))}
            >
              {item.label}
            </Link>
          ))}

          {secondary.length > 0 && (
            // Open when you are inside one, so it never hides where you are.
            <details className="mt-4" open={inSecondary}>
              <summary className="cursor-pointer px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase select-none hover:text-slate-600">
                More
              </summary>
              <div className="mt-1 space-y-1">
                {secondary.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={linkClass(Boolean(pathname?.startsWith(item.href)))}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          )}
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
