// Uma cor estável por categoria, usada em todos os blocos do Dashboard
// (quadradinhos do funil, barras, pontos da agenda). A cor depende da
// posição da categoria na lista COMPLETA (ordenada por id), então não muda
// quando o filtro de cycle reduz os dados exibidos.
//
// Paleta suave de propósito: tem contraste suficiente tanto sobre a
// superfície clara quanto sobre o card escuro.
const PALETTE = [
  "#A99CF0",
  "#8FD0B5",
  "#EDB27A",
  "#D98BA3",
  "#7FB5E8",
  "#E3CE74",
  "#B8A58F",
  "#A6D67C",
];

export const UNCATEGORIZED_COLOR = "#9CA3AF";

export function buildCategoryColorMap(categories) {
  const map = new Map();
  [...categories]
    .sort((a, b) => a.id - b.id)
    .forEach((category, index) => {
      map.set(category.id, PALETTE[index % PALETTE.length]);
    });
  return map;
}

export function getCategoryColor(colorMap, categoryId) {
  return colorMap.get(categoryId) ?? UNCATEGORIZED_COLOR;
}
