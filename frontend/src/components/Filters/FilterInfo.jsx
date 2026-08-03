import React from "react";

export default function FilterInfo({
  categories = [],
  owners = [],
  filters,
  onChange,
  onClear,
}) {
  const update = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-row flex-wrap gap-3">
      {/* Input de Nome */}
      <input
        type="text"
        placeholder="Searching by name..."
        value={filters?.name || ""}
        onChange={(e) => update("name", e.target.value)}
        className="flex-1 min-w-[180px] text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      />

      {/* Select Categoria */}
      <select
        value={filters?.categoryId || ""}
        onChange={(e) => update("categoryId", e.target.value)}
        className="w-64 text-center text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Select Owner */}
      <select
        value={filters?.ownerId || ""}
        onChange={(e) => update("ownerId", e.target.value)}
        className="text-center text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">All owners</option>
        {owners.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      {/* Select Status de Execução */}
      <select
        value={filters?.status || ""}
        onChange={(e) => update("status", e.target.value)}
        className="text-center text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">All conditions</option>
        <option value="Free">Free</option>
        <option value="In Planning">In Planning</option>
      </select>

      {/* Select Ativo/Inativo */}
      <select
        value={filters?.active || ""}
        onChange={(e) => update("active", e.target.value)}
        className="text-center text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
      >
        <option value="">All status</option>
        <option value="true">Only active</option>
        <option value="false">Only inactive</option>
      </select>

      {/* Botão de Limpar Filtros */}
      <button
        type="button"
        onClick={onClear}
        className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}