import { Link } from "react-router-dom";
import { getCategoryColor } from "../../utils/categoryColors";
import { pad2 } from "../../utils/dashboardMetrics";

// Limite de quadradinhos por estágio, pra a grade não estourar o card
// quando o banco crescer. O excedente aparece como "+N".
const MAX_BLOCKS = 24;

function StageColumn({ stage, colorMap }) {
  const visible = stage.ideas.slice(0, MAX_BLOCKS);
  const hidden = stage.ideas.length - visible.length;

  return (
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-sm text-ui-feature-text">
        <span className="h-1.5 w-1.5 rounded-full bg-ui-feature-muted" />
        {stage.label}
      </p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-5xl font-light tabular-nums">{pad2(stage.count)}</span>
        <span className="font-mono text-[11px] text-ui-feature-muted">{stage.pct.toFixed(1)}%</span>
      </p>

      <div className="mt-4 grid min-h-[3.5rem] grid-cols-6 content-start gap-1.5">
        {visible.map((idea) => (
          <span
            key={idea.id}
            title={idea.name}
            className="h-4 rounded-[4px]"
            style={{ backgroundColor: getCategoryColor(colorMap, idea.category?.id) }}
          />
        ))}
      </div>
      {hidden > 0 && (
        <p className="mt-2 font-mono text-[11px] text-ui-feature-muted">+{hidden} more</p>
      )}

      <p className="mt-4 text-xs text-ui-feature-muted">{stage.hint}</p>
    </div>
  );
}

export default function StageFunnelCard({ funnel, colorMap }) {
  return (
    <section className="h-full rounded-2xl border border-white/5 bg-ui-feature p-6 text-ui-feature-text md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ui-feature-muted">
            01 / The big picture
          </p>
          <h3 className="mt-3 text-2xl font-medium">From spark to shipped.</h3>
        </div>
        <Link to="/ideas" className="shrink-0 text-xs text-accent-300 hover:text-accent-200">
          Explore ideas &#8599;
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        {funnel.stages.map((stage) => (
          <StageColumn key={stage.key} stage={stage} colorMap={colorMap} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-ui-feature-muted">
        <span>One block = one idea &middot; current stage, not a conversion funnel</span>
        <span className="shrink-0">{funnel.total} total</span>
      </div>
    </section>
  );
}
