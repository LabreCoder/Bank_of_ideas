import { pad2 } from "../../utils/dashboardMetrics";

function Kpi({ label, value, note, caption }) {
  return (
    <div className="py-6 lg:px-6 lg:first:pl-0 lg:last:pr-0">
      <p className="text-sm text-ui-text-secondary">{label}</p>
      <p className="mt-3 flex items-baseline gap-3">
        <span className="text-5xl font-light tabular-nums text-ui-text-primary">{value}</span>
        {note && <span className="font-mono text-xs text-ui-text-muted">{note}</span>}
      </p>
      <p className="mt-2 text-xs text-ui-text-muted">{caption}</p>
    </div>
  );
}

export default function KpiStrip({ kpis }) {
  return (
    <section className="grid grid-cols-2 border-y border-ui-border lg:grid-cols-4 lg:divide-x lg:divide-ui-border">
      <Kpi
        label="Ideas in your bank"
        value={pad2(kpis.bankCount)}
        caption={`Across ${kpis.categoriesCount} ${kpis.categoriesCount === 1 ? "category" : "categories"}`}
      />
      <Kpi
        label="Ideas in execution"
        value={pad2(kpis.executionCount)}
        note={`${kpis.executionPct}% of bank`}
        caption="Actively moving toward a launch"
      />
      <Kpi
        label="Checklist completion"
        value={`${kpis.checklistPct}%`}
        caption={`${kpis.doneItems} of ${kpis.totalItems} tasks done`}
      />
      <Kpi
        label="Upcoming deadlines"
        value={pad2(kpis.upcomingCount)}
        note="Next 7 days"
        caption="Open plannings due soon"
      />
    </section>
  );
}
