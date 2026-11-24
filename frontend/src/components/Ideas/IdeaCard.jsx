import { IDEA_STATUS_STYLES, STATUS_FALLBACK_STYLE } from "../../utils/ideaStatus";
import { Badge } from "../ui";

export default function IdeaCard({ idea, onOpen }) {
  const statusClass =
    IDEA_STATUS_STYLES[idea.execution_status] || STATUS_FALLBACK_STYLE;

  return (
    <button
      type="button"
      onClick={() => onOpen(idea)}
      className={`min-w-0 text-left bg-ui-surface rounded-lg border border-ui-border p-4 flex flex-col gap-3 hover:border-accent-300 transition-colors ${
        idea.is_active ? "opacity-100" : "opacity-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 font-bold text-ui-text-primary leading-snug [overflow-wrap:anywhere]">{idea.name}</h3>
        <Badge toneClass={statusClass} className="shrink-0">
          {idea.execution_status}
        </Badge>
      </div>

      <p className="text-sm text-ui-text-muted line-clamp-3 [overflow-wrap:anywhere]">
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