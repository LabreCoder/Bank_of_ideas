import { forwardRef } from "react";

// Superfície padrão (fundo + borda) usada em painéis, cards e blocos.

const PADDING = {
  0: "",
  4: "p-4",
  5: "p-5",
  6: "p-6",
  8: "p-8",
};

const RADIUS = {
  lg: "rounded-lg",
  xl: "rounded-xl",
};

export function cardClass({ padding = 4, radius = "lg", className = "" } = {}) {
  return ["border border-ui-border bg-ui-surface", RADIUS[radius] ?? RADIUS.lg, PADDING[padding] ?? PADDING[4], className]
    .filter(Boolean)
    .join(" ");
}

// `as` permite usar a mesma superfície em <section>, <article> ou <button>.
const Card = forwardRef(function Card({ as: Component = "div", padding = 4, radius = "lg", className = "", ...props }, ref) {
  return <Component ref={ref} className={cardClass({ padding, radius, className })} {...props} />;
});

export default Card;
