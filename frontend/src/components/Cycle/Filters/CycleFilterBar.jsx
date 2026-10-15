import { useCallback, useRef, useState } from "react";
import CycleFilterPopover from "./CycleFilterPopover";
import FilterBar from "../../Filters/FilterBar";
import { FILTER_BUTTON_CLASS } from "../../Filters/filterStyles";
import {
  CYCLE_STATUSES,
  DEADLINE_OPTIONS,
  DEFAULT_CYCLE_FILTERS,
  SORT_OPTIONS,
  countActiveFilters,
} from "../../../utils/cycleFilters";

function buildChips(filters, onChange) {
  const chips = [];

  if (filters.deadline) {
    const option = DEADLINE_OPTIONS.find((o) => o.value === filters.deadline);
    chips.push({
      key: "deadline",
      label: option?.label ?? filters.deadline,
      onRemove: () => onChange("deadline", ""),
    });
  }

  if (filters.rangeFrom || filters.rangeTo) {
    chips.push({
      key: "period",
      label: `${filters.rangeFrom || "..."} - ${filters.rangeTo || "..."}`,
      onRemove: () => {
        onChange("rangeFrom", "");
        onChange("rangeTo", "");
      },
    });
  }

  if (filters.ideaQuery.trim()) {
    chips.push({
      key: "idea",
      label: `Idea: ${filters.ideaQuery.trim()}`,
      onRemove: () => onChange("ideaQuery", ""),
    });
  }

  if (
    filters.sortBy !== DEFAULT_CYCLE_FILTERS.sortBy ||
    filters.sortDir !== DEFAULT_CYCLE_FILTERS.sortDir
  ) {
    const option = SORT_OPTIONS.find((o) => o.value === filters.sortBy);
    chips.push({
      key: "sort",
      label: `Sort: ${option?.label ?? filters.sortBy} ${filters.sortDir === "desc" ? "\u2193" : "\u2191"}`,
      onRemove: () => {
        onChange("sortBy", DEFAULT_CYCLE_FILTERS.sortBy);
        onChange("sortDir", DEFAULT_CYCLE_FILTERS.sortDir);
      },
    });
  }

  return chips;
}

export default function CycleFilterBar({ cycles, filters, onChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const closePopover = useCallback(() => setIsOpen(false), []);

  const activeCount = countActiveFilters(filters);
  // O badge do botão exclui a busca, que já é visível na barra.
  const popoverCount = activeCount - (filters.search.trim() ? 1 : 0);

  const tabItems = [
    { value: "All", label: "All", count: cycles.length },
    ...CYCLE_STATUSES.map((status) => ({
      value: status,
      label: status,
      count: cycles.filter((c) => c.status === status).length,
    })),
  ];

  return (
    <FilterBar
      tabs={{
        items: tabItems,
        active: filters.statuses[0] ?? "All",
        onChange: (value) => onChange("statuses", value === "All" ? [] : [value]),
      }}
      search={{
        value: filters.search,
        onChange: (value) => onChange("search", value),
        placeholder: "Search cycles...",
      }}
      chips={buildChips(filters, onChange)}
      activeCount={activeCount}
      onClear={onReset}
    >
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className={FILTER_BUTTON_CLASS}
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
    </FilterBar>
  );
}
