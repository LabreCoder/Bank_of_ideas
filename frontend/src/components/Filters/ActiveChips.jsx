/**
 * Chips removíveis dos filtros ativos. `chips` é uma lista de
 * { key, label, onRemove }.
 */
export default function ActiveChips({ chips }) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li
          key={chip.key}
          className="flex items-center gap-1.5 rounded-md border border-accent-500/20 bg-accent-500/10 py-1 pl-2.5 pr-1.5 text-sm text-accent-700"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter ${chip.label}`}
            className="flex h-4 w-4 items-center justify-center rounded text-accent-700 transition-colors hover:bg-accent-500/20"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
