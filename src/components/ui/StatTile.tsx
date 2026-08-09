const toneClasses = {
  neutral: "border-slate-200 dark:border-slate-800",
  green: "border-emerald-300 dark:border-emerald-800",
  amber: "border-amber-300 dark:border-amber-800",
  red: "border-red-300 dark:border-red-800",
};

export function StatTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <div
      className={`rounded-lg border-2 bg-white p-4 dark:bg-slate-900 ${toneClasses[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
