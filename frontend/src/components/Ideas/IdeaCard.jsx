const STATUS_STYLES = {
  "Free": "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
  "In Planning": "bg-status-amber-bg text-status-amber-fg border-status-amber-border",
};

export default function IdeaCard({ idea, onOpen }) {
  const statusClass =
    STATUS_STYLES[idea.execution_status] || "bg-ui-surface-2 text-ui-text-secondary border-ui-border";

  return (
    <button
      onClick={() => onOpen(idea)}
      className={`text-left bg-ui-surface rounded-lg border border-ui-border p-4 flex flex-col gap-3 hover:border-accent-300 transition-colors ${
        idea.is_active ? "opacity-100" : "opacity-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-ui-text-primary leading-snug">{idea.name}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
          {idea.execution_status}
        </span>
      </div>

      <p className="text-sm text-ui-text-muted line-clamp-3">
        {idea.description || "Description: --"}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto pt-2 text-xs text-ui-text-muted">
        <span className="bg-ui-surface-2 px-2 py-1 rounded-md">
          {idea.category ? idea.category.name : "Category: --"}
        </span>
        <span className="bg-ui-surface-2 px-2 py-1 rounded-md">{idea.owner.name}</span>
      </div>
    </button>
  );
}