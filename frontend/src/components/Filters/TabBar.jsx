export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`text-sm font-medium px-4 py-2 border-b-2 -mb-px transition-colors whitespace-nowrap ${
            active === tab.value
              ? "border-accent-600 text-accent-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}