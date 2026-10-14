import { useCallback, useRef, useState } from "react";
import CycleFilterPopover from "./CycleFilterPopover";
import { CYCLE_STATUSES, countActiveFilters } from "../../../utils/cycleFilters";

export default function CycleFilterBar({
  filters,
  onChange,
  onToggleStatus,
  onReset,
  totalCount,
  visibleCount,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const closePopover = useCallback(() => setIsOpen(false), []);

  const activeCount = countActiveFilters(filters);
  // Contagem no badge exclui busca e status, que já são visíveis na barra.
  const popoverCount =
    activeCount -
    (filters.search.trim() ? 1 : 0) -
    (filters.statuses.length > 0 ? 1 : 0);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          aria-label="Search cycles"
          placeholder="Search cycles..."
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          className="min-w-[180px] flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
        />

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Status">
          {CYCLE_STATUSES.map((status) => {
            const selected = filters.statuses.includes(status);
            return (
              <button
                key={status}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleStatus(status)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-accent-600 bg-accent-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Filters
            {popoverCount > 0 && (
              <span className="rounded-full bg-accent-600 px-1.5 text-xs text-white">
                {popoverCount}
              </span>
            )}
          </button>

          {isOpen && (
            <CycleFilterPopover
              filters={filters}
              onChange={onChange}
              onClose={closePopover}
              anchorRef={buttonRef}
            />
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Clear
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Showing {visibleCount} of {totalCount} cycles
        </p>
      )}
    </div>
  );
}
