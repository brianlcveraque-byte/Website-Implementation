/** A hand-illustrated preview of the actual dashboard layout — not a real
 * screenshot (this tool can't capture one), and deliberately generic/
 * placeholder numbers rather than real client data on a public page. The
 * structure matches the real /app/dashboard: stat tiles, then a
 * "needs attention" list with status dots. */
export function ProductPreview() {
  const tiles = [
    { label: "Pipeline value", value: "₱4.2M" },
    { label: "Active projects", value: "9" },
    { label: "Overdue tasks", value: "2" },
    { label: "Receivables", value: "₱850K" },
  ];
  const rows = [
    { tone: "bg-red-500", text: "Next action overdue" },
    { tone: "bg-amber-500", text: "Milestone due this week" },
    { tone: "bg-emerald-500", text: "Invoice paid" },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10 blur-2xl" aria-hidden />
      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40 ring-1 ring-white/10">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-slate-900/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="ml-3 text-[11px] text-slate-400">Dashboard</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">{t.label}</p>
                <p className="mt-1 text-lg font-semibold text-white sm:text-xl">{t.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:mt-4">
            <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">Needs attention</p>
            <ul className="mt-2 space-y-2">
              {rows.map((r) => (
                <li key={r.text} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${r.tone}`} aria-hidden />
                  {r.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
