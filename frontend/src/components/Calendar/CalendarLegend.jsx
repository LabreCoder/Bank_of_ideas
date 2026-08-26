const MONTH_LEGEND_ITEMS = [
  { label: "1 idea", className: "bg-accent-200" },
  { label: "2 ideas", className: "bg-accent-500" },
  { label: "3 or more", className: "bg-accent-800" },
];

const WEEK_DAY_LEGEND_ITEMS = [
  { label: "Planning count", className: "bg-accent-200" },
  { label: "Checklist progress", className: "bg-accent-500" },
  { label: "Open details", className: "bg-accent-800" },
];

export default function CalendarLegend({ view = "month" }) {
  const legendItems = view === "month" ? MONTH_LEGEND_ITEMS : WEEK_DAY_LEGEND_ITEMS;

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span className="font-medium text-gray-600">Legend:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm ${item.className}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}