import { getCategoryColor } from "../../utils/categoryColors";

export default function CategoryBalanceCard({ rows, colorMap }) {
  return (
    <section className="h-full rounded-2xl border border-ui-border bg-ui-surface p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ui-text-muted">
        02 / Where your energy goes
      </p>
      <h3 className="mt-3 text-xl font-medium text-ui-text-primary">A balanced bank?</h3>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-ui-text-muted">No ideas to show yet.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {rows.map((row) => {
            const color = getCategoryColor(colorMap, row.id);
            return (
              <li key={row.id ?? "none"}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-ui-text-primary">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="truncate">{row.name}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ui-text-muted">
                    {row.count} / {row.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ui-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.pct}%`, backgroundColor: color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
