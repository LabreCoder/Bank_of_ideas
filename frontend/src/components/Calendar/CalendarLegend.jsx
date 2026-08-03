const LEGEND_ITEMS = [
  { label: "1 idea", className: "bg-accent-200" },
  { label: "2 ideas", className: "bg-accent-400" },
  { label: "3 or more", className: "bg-accent-800" },
];

export default function CalendarLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span className="font-medium text-gray-600">Legend:</span>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm ${item.className}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}