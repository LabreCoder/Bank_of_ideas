export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none whitespace-nowrap">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
          checked ? "bg-accent-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
      {label}
    </label>
  );
}