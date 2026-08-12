export default function FilterInfo({
  categories = [],
  owners = [],
  filters,
  onChange,
  onClear,
  showCategory = true,
  showOwner = true,
  showActive = true,
}) {
  const update = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-row flex-wrap gap-3">
      <input
        type="text"
        placeholder="Searching by name..."
        value={filters?.name || ""}
        onChange={(e) => update("name", e.target.value)}
        className="flex-1 min-w-[180px] text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      />

      {showCategory && (
        <select
          value={filters?.categoryId || ""}
          onChange={(e) => update("categoryId", e.target.value)}
          className="w-56 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {showOwner && (
        <select
          value={filters?.ownerId || ""}
          onChange={(e) => update("ownerId", e.target.value)}
          className="w-48 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
        >
          <option value="">All owners</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      )}

      {showActive && (
        <select
          value={filters?.active || ""}
          onChange={(e) => update("active", e.target.value)}
          className="w-40 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
        >
          <option value="">All ideas</option>
          <option value="true">Only active</option>
          <option value="false">Only inactive</option>
        </select>
      )}

      <button
        type="button"
        onClick={onClear}
        className="text-sm font-medium px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}