const STATUS_STYLES = {
  "Free": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Planning": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function IdeaCard({ idea, onOpen }) {
  const statusClass =
    STATUS_STYLES[idea.execution_status] || "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <button
      onClick={() => onOpen(idea)}
      className={`text-left bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 hover:border-accent-300 transition-colors ${
        idea.is_active ? "opacity-100" : "opacity-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 leading-snug">{idea.name}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
          {idea.execution_status}
        </span>
      </div>

      <p className="text-sm text-gray-500 line-clamp-3">
        {idea.description || "Description: --"}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto pt-2 text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded-md">
          {idea.category ? idea.category.name : "Category: --"}
        </span>
        <span className="bg-gray-100 px-2 py-1 rounded-md">{idea.owner.name}</span>
      </div>
    </button>
  );
}