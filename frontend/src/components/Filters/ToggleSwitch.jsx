/**
 * Botão liga/desliga com rótulo (ex.: "Show inactive").
 */
export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 ml-2 mr-2text-lg font-medium text-gray-600">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-1 ${
          checked ? "bg-accent-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      {label}
    </label>
  );
}
