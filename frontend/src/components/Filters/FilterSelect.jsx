import { FILTER_FIELD_CLASS } from "./filterStyles";

// Chevron desenhado como fundo para manter o <select> nativo (acessível)
// com a aparência do modelo.
export const CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center",
};

/**
 * Select padrão dos filtros. `options` é uma lista de { value, label };
 * `label` vira o aria-label (não há <label> visível na barra).
 */
export default function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={CHEVRON_STYLE}
      className={`w-full appearance-none pr-9 md:w-44 ${FILTER_FIELD_CLASS}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
