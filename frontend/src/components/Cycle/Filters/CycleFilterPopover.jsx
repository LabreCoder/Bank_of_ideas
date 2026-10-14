import { useEffect, useRef } from "react";
import {
  DEADLINE_OPTIONS,
  SORT_OPTIONS,
} from "../../../utils/cycleFilters";

const FIELD_CLASS =
  "w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent-600";
const LABEL_CLASS =
  "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1";

export default function CycleFilterPopover({ filters, onChange, onClose, anchorRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      if (anchorRef?.current?.contains(event.target)) return;
      onClose();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, anchorRef]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Cycle filters"
      className="absolute right-0 top-full z-20 mt-2 w-[min(92vw,22rem)] space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
    >
      <div>
        <label htmlFor="cycle-filter-deadline" className={LABEL_CLASS}>
          Deadline
        </label>
        <select
          id="cycle-filter-deadline"
          value={filters.deadline}
          onChange={(e) => onChange("deadline", e.target.value)}
          className={FIELD_CLASS}
        >
          {DEADLINE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={LABEL_CLASS}>Period</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="cycle-filter-from" className="sr-only">
              From
            </label>
            <input
              id="cycle-filter-from"
              type="date"
              value={filters.rangeFrom}
              max={filters.rangeTo || undefined}
              onChange={(e) => onChange("rangeFrom", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label htmlFor="cycle-filter-to" className="sr-only">
              To
            </label>
            <input
              id="cycle-filter-to"
              type="date"
              value={filters.rangeTo}
              min={filters.rangeFrom || undefined}
              onChange={(e) => onChange("rangeTo", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Cycles whose dates overlap this range.
        </p>
      </div>

      <div>
        <label htmlFor="cycle-filter-idea" className={LABEL_CLASS}>
          Contains idea
        </label>
        <input
          id="cycle-filter-idea"
          type="text"
          placeholder="Idea name in linked plannings..."
          value={filters.ideaQuery}
          onChange={(e) => onChange("ideaQuery", e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="cycle-filter-sort" className={LABEL_CLASS}>
          Sort by
        </label>
        <div className="flex gap-2">
          <select
            id="cycle-filter-sort"
            value={filters.sortBy}
            onChange={(e) => onChange("sortBy", e.target.value)}
            className={FIELD_CLASS}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              onChange("sortDir", filters.sortDir === "asc" ? "desc" : "asc")
            }
            aria-label={
              filters.sortDir === "asc" ? "Ascending order" : "Descending order"
            }
            title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
            className="shrink-0 rounded-md border border-gray-200 px-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            {filters.sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
    </div>
  );
}
