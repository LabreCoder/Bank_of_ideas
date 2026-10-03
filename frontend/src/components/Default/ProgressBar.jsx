export default function ProgressBar({ label, current, total, percentage, variant = "compact" }) {
  const pct = percentage !== undefined ? percentage : total > 0 ? (current / total) * 100 : 0;

  if (variant === "large") {
    return (
      <div>
        {label && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        )}
        <p className="text-2xl font-semibold text-gray-900">
          {current}
          <span className="text-sm font-normal text-gray-400"> / {total} concluídos</span>
        </p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-accent-600" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`flex items-center text-xs text-gray-500 mb-1 ${
          label ? "justify-between" : "justify-end"
        }`}
      >
        {label && <span>{label}</span>}
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-accent-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}