import { STATUS_FALLBACK_STYLE } from "../../utils/planningStatus";

// Etiqueta de status (ideia, planning, ciclo). A cor vem dos mapas de
// utils/*Status.js (IDEA_STATUS_STYLES, PLANNING_STATUS_STYLES...), que
// continuam sendo a fonte única das cores de cada status.
export default function Badge({ toneClass, className = "", children, ...props }) {
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-xs font-medium",
        toneClass || STATUS_FALLBACK_STYLE,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
