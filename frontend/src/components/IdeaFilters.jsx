export default function IdeaFilters({
  categories,
  owners,
  filters,
  onChange,
}) {
  const update = (field, value) => onChange({ ...filters, [field]: value });

  const clearFilters = () => {
    onChange({
      name: "",
      categoryId: "",
      ownerId: "",
      status: "",
      active: "",
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Searching by name..."
        value={filters.name}
        onChange={(e) => update("name", e.target.value)}
        className="flex-1 min-w-[180px] text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      />

      <select
        value={filters.categoryId}
        onChange={(e) => update("categoryId", e.target.value)}
        className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={filters.ownerId}
        onChange={(e) => update("ownerId", e.target.value)}
        className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">All owners</option>
        {owners.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      
      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">All status</option>
        <option value="Livre">Livre</option>
        <option value="Em Planejamento">Em Planejamento</option>
      </select>

      <select
        value={filters.active}
        onChange={(e) => update("active", e.target.value)}
        className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">Active and inactive</option>
        <option value="true">Only active</option>
        <option value="false">Only inactive</option>
      </select>
      <button
        onClick={clearFilters}
        className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-4 py-2 rounded-md"
      >
        Clear Filters
      </button>
    </div>
  );
}