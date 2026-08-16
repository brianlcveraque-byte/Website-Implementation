import { WORKBOOK_PREVIEW } from "@/lib/succession-funnel";

// Faithful HTML rendering of three sheets from the workbook, using the same
// columns and the same computed values its formulas produce. Rendered rather
// than screenshotted: it stays crisp at any zoom, reflows on mobile where a
// spreadsheet screenshot becomes unreadable, and carries no image weight.
//
// The scores shown are a worked example of a filled-in workbook, not data that
// ships inside it — the file arrives with one example row and is otherwise blank.

const BAND_STYLES: Record<string, string> = {
  "Highly Critical": "bg-red-100 text-red-800",
  Critical: "bg-orange-100 text-orange-800",
  "Moderately Critical": "bg-amber-100 text-amber-800",
  Noncritical: "bg-slate-100 text-slate-600",
  "Ready Now": "bg-emerald-100 text-emerald-800",
  "Ready Soon": "bg-teal-100 text-teal-800",
  "Ready Later": "bg-amber-100 text-amber-800",
  "Not Ready": "bg-slate-100 text-slate-600",
  "Critical role, no bench": "bg-red-100 text-red-800",
  "No one ready now": "bg-amber-100 text-amber-800",
  "No successors identified": "bg-slate-100 text-slate-600",
  Covered: "bg-emerald-100 text-emerald-800",
};

function Band({ value }: { value: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${BAND_STYLES[value] ?? "bg-slate-100 text-slate-600"}`}>
      {value}
    </span>
  );
}

/** One sheet, rendered with spreadsheet chrome: row numbers, header band, gridlines. */
function Sheet({
  tab,
  caption,
  columns,
  rows,
  inputCols,
}: {
  tab: string;
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly (string | number)[])[];
  /** Zero-based column indexes the user types into — shaded like the workbook. */
  inputCols: readonly number[];
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
        <span className="rounded-t bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {tab}
        </span>
        <span className="text-xs text-slate-400">succession-planning-toolkit.xlsx</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs tabular-nums">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-8 border-r border-slate-300 bg-slate-200 px-1 py-2 text-center font-normal text-slate-500">
                &nbsp;
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  className="border-r border-slate-700 bg-slate-800 px-2.5 py-2 align-bottom text-[11px] leading-tight font-semibold text-white last:border-r-0"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-t border-slate-200">
                <td className="sticky left-0 z-10 border-r border-slate-300 bg-slate-100 px-1 py-1.5 text-center text-slate-400">
                  {r + 2}
                </td>
                {row.map((cell, c) => {
                  const isBand = typeof cell === "string" && cell in BAND_STYLES;
                  return (
                    <td
                      key={c}
                      className={`border-r border-slate-200 px-2.5 py-1.5 whitespace-nowrap last:border-r-0 ${
                        inputCols.includes(c) ? "bg-amber-50 text-blue-700" : "text-slate-800"
                      } ${c === 0 ? "font-medium" : ""}`}
                    >
                      {isBand ? <Band value={cell as string} /> : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {caption}
      </figcaption>
    </figure>
  );
}

export function WorkbookPreview() {
  return (
    <div className="space-y-8">
      {WORKBOOK_PREVIEW.map((sheet) => (
        <Sheet key={sheet.tab} {...sheet} />
      ))}

      <p className="text-center text-sm text-slate-500">
        <span className="mr-1.5 inline-block h-3 w-3 translate-y-0.5 rounded-sm border border-amber-200 bg-amber-50" aria-hidden />
        Shaded cells are what you type. Everything else is a formula — the bands, percentages, and
        counts above all compute themselves.
      </p>
    </div>
  );
}
