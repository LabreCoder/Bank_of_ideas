export default function TabBar({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="tablist-scroll flex gap-2 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`shrink-0 text-sm font-medium px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
            active === tab.value
              ? "border-accent-600 text-ui-accent-strong"
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