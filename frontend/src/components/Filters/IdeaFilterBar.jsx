import FilterBar from "./FilterBar";
import FilterSelect from "./FilterSelect";
import ToggleSwitch from "./ToggleSwitch";

/**
 * Filtros de ideia compartilhados por Ideas e Planning: abas, nome, categoria,
 * responsável e "Show inactive". Recebe o estado do hook useIdeaFilters.
 */
export default function IdeaFilterBar({
  tabs,
  categories = [],
  owners = [],
  filters,
  onChange,
  onClear,
  activeCount,
  searchPlaceholder = "Search by name...",
}) {
  const categoryOptions = [
    { value: "", label: "Category" },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];
  const ownerOptions = [
    { value: "", label: "Owner" },
    ...owners.map((o) => ({ value: String(o.id), label: o.name })),
  ];

  const chips = [];
  const category = categories.find((c) => String(c.id) === filters.categoryId);
  if (category) {
    chips.push({
      key: "category",
      label: category.name,
      onRemove: () => onChange("categoryId", ""),
    });
  }
  const owner = owners.find((o) => String(o.id) === filters.ownerId);
  if (owner) {
    chips.push({
      key: "owner",
      label: owner.name,
      onRemove: () => onChange("ownerId", ""),
    });
  }

  return (
    <FilterBar
      tabs={tabs}
      search={{
        value: filters.name,
        onChange: (value) => onChange("name", value),
        placeholder: searchPlaceholder,
      }}
      chips={chips}
      activeCount={activeCount}
      onClear={onClear}
    >
      <FilterSelect
        label="Category"
        value={filters.categoryId}
        onChange={(value) => onChange("categoryId", value)}
        options={categoryOptions}
      />
      <FilterSelect
        label="Owner"
        value={filters.ownerId}
        onChange={(value) => onChange("ownerId", value)}
        options={ownerOptions}
      />
      <ToggleSwitch
        checked={filters.active !== "true"}
        onChange={(show) => onChange("active", show ? "" : "true")}
        label="Show inactive"
      />
    </FilterBar>
  );
}
