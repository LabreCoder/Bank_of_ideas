export default function CycleCard({ cycle, onClick }) {
  const planningsCount = cycle.plannings?.length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-base">{cycle.name}</h4>
          <span className="text-xs px-2.5 py-1 bg-accent-50 text-accent-700 rounded-full font-medium">
            {planningsCount} {planningsCount === 1 ? "Planning" : "Plannings"}
          </span>
        </div>

        {cycle.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {cycle.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <div>
          <span >Start: {cycle.start_date || "--"}</span>
        </div>
        <div>
          <span>Due: {cycle.due_date || "--"}</span>
        </div>
      </div>
    </div>
  );
}