import ActiveChips from "./ActiveChips";
import { FILTER_FIELD_CLASS } from "./filterStyles";

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-text-muted"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * Card de filtros padrão (Ideas, Planning, Cycles): abas no topo, linha de
 * busca + controles no meio e chips dos filtros ativos com "Clear filters"
 * no rodapé.
 *
 * Props:
 * - tabs: { items: [{ value, label, count }], active, onChange(value) }
 * - search: { value, onChange(value), placeholder, label }
 * - children: controles extras da página (selects, toggle, popover...)
 * - chips: [{ key, label, onRemove }] dos filtros ativos
 * - activeCount: nº de filtros fora do padrão (0 esconde "Clear filters")
 * - onClear
 */
export default function FilterBar({
  tabs,
  search,
  children,
  chips = [],
  activeCount = 0,
  onClear,
}) {
  const showClear = activeCount > 0 && onClear;
  const showFooter = chips.length > 0 || showClear;

  return (
    <div className="mb-6 rounded-lg border border-ui-border bg-ui-surface shadow-sm">
      {tabs && (
        <div role="tablist" className="flex gap-1 border-b border-ui-border px-2 mt-2 mb-2">
          {tabs.items.map((tab) => {
            const isActive = tabs.active === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => tabs.onChange(tab.value)}
                className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-lg font-medium transition-colors ${
                  isActive
                    ? "border-accent-600 text-accent-700"
                    : "border-transparent text-ui-text-muted hover:text-ui-text-primary"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="rounded-full bg-ui-surface-2 px-2 py-0.5 text-sm font-semibold text-ui-text-secondary">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 p-3">
        {search && (
          <div className="relative min-w-[200px] flex-1">
            <SearchIcon />
            <input
              type="search"
              aria-label={search.label || search.placeholder}
              placeholder={search.placeholder}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className={`w-full pl-9 ${FILTER_FIELD_CLASS}`}
            />
          </div>
        )}
        {children}
      </div>

      {showFooter && (
        <div className="flex items-center justify-between gap-3 border-t border-ui-border px-3 py-2">
          <ActiveChips chips={chips} />
          {showClear && (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 text-lg font-medium text-ui-text-muted transition-colors hover:text-ui-text-primary"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
