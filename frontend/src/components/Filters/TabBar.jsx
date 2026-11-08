export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4 border-b border-ui-border ">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`text-sm font-medium px-4 py-2 border-b-2 -mb-px transition-colors whitespace-nowrap ${
            active === tab.value
              ? "border-accent-600 text-accent-700"
              : "border-transparent text-ui-text-muted hover:text-ui-text-primary"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-ui-text-muted">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}