import { useState } from "react";

// Seção recolhível que guarda o calendário completo (Month/Week/Day).
// Os componentes do calendário em si não mudam.
export default function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-ui-border bg-ui-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="text-base font-medium text-ui-text-primary">{title}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 text-ui-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="border-t border-ui-border p-4 md:p-6">{children}</div>}
    </section>
  );
}
