import { forwardRef } from "react";

// Campos de formulário (input/select/textarea) e rótulo, com um visual só.
// A cor de fundo e do texto vêm da camada base em index.css (bg-ui-input),
// então seguem o modo claro/escuro sem classe extra.

const FIELD_BASE = "border border-ui-border focus:outline-none focus:ring-2 focus:ring-accent-600";

const FIELD_SIZES = {
  md: "rounded-md px-3 py-2 text-sm",
  // Edição em linha (ex.: item de checklist).
  sm: "rounded px-2 py-1 text-sm",
};

// `fullWidth` (padrão) ocupa a largura do container; desligue em linhas
// flex onde o campo divide espaço com botões (use flex-1/min-w no className).
export function fieldClass({ size = "md", fullWidth = true, className = "" } = {}) {
  return [fullWidth ? "w-full" : "", FIELD_BASE, FIELD_SIZES[size] ?? FIELD_SIZES.md, className]
    .filter(Boolean)
    .join(" ");
}

export const Input = forwardRef(function Input({ size = "md", fullWidth = true, className = "", ...props }, ref) {
  return <input ref={ref} className={fieldClass({ size, fullWidth, className })} {...props} />;
});

export const Select = forwardRef(function Select({ size = "md", fullWidth = true, className = "", ...props }, ref) {
  return <select ref={ref} className={fieldClass({ size, fullWidth, className })} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ size = "md", fullWidth = true, className = "", ...props }, ref) {
  return <textarea ref={ref} className={fieldClass({ size, fullWidth, className })} {...props} />;
});

const LABEL_SIZES = {
  md: "block text-sm font-medium text-ui-text-secondary",
  sm: "block text-xs font-medium text-ui-text-muted",
};

// `flush`: sem margem inferior (quando o rótulo divide a linha com um
// contador de caracteres, por exemplo).
export function Label({ size = "md", flush = false, className = "", ...props }) {
  return (
    <label
      className={[LABEL_SIZES[size] ?? LABEL_SIZES.md, flush ? "" : "mb-1", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
