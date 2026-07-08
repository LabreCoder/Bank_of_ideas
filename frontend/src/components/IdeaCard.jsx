const STATUS_STYLES = {
  Livre: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Em Planejamento": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function IdeaCard({ idea, onEdit, onToggleActive }) {
  const statusClass = STATUS_STYLES[idea.execution_status] || "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <div
      className={`bg-white rounded-lg border p-4 flex flex-col gap-3 transition-opacity ${
        idea.is_active ? "border-gray-200" : "border-gray-200 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 leading-snug">{idea.name}</h3>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}
        >
          {idea.execution_status}
        </span>
      </div>

      {(
        <p className="text-sm text-gray-500 line-clamp-3">{idea.description == null ? "Description: --" : idea.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-2 text-xs text-gray-500">
        {(
          <span className="bg-gray-100 px-2 py-1 rounded-md">{idea.category == null ? "Category: --" : idea.category.name}</span>
        )}
        <span className="bg-gray-100 px-2 py-1 rounded-md">{idea.owner.name}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={() => onToggleActive(idea)}
          className="text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          {idea.is_active ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onEdit(idea)}
          className="text-xs font-medium text-accent-600 hover:text-accent-700"
        >
          Edit
        </button>
      </div>
    </div>
  );
}