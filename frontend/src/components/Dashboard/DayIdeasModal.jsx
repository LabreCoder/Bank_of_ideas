const STATUS_STYLES = {
  "Não Iniciado": "bg-gray-100 text-gray-600 border-gray-200",
  "Em Desenvolvimento": "bg-amber-50 text-amber-700 border-amber-200",
  "Em Revisão": "bg-blue-50 text-blue-700 border-blue-200",
  "Concluído": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DayIdeasModal({ dateKey, plannings, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold capitalize">{formatDateLabel(dateKey)}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            close
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {plannings.map((planning) => (
            <li
              key={planning.id}
              className="flex items-center justify-between gap-2 bg-gray-50 rounded-md px-3 py-2"
            >
              <span className="text-sm text-gray-800">{planning.idea.name}</span>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
                  STATUS_STYLES[planning.status] || "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {planning.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}