import { forwardRef } from "react";
import { Link } from "react-router-dom";

// Fonte única do visual de botões. Antes, cada tela escrevia as classes à
// mão (bg-accent-600 aparecia em 23 arquivos, com pequenas variações de
// padding, raio e hover). Mudar o visual dos botões agora é mudar só aqui.
//
// As classes ficam em strings completas (nada de `bg-${cor}`) para o
// Tailwind conseguir encontrá-las ao gerar o CSS.

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const BUTTON_VARIANTS = {
  // Ação principal da tela/formulário.
  primary: "bg-accent-600 text-white hover:bg-accent-700",
  // Ação secundária com contorno (Cancel em diálogos, Edit, filtros...).
  secondary: "border border-ui-border text-ui-text-primary hover:bg-ui-surface-2",
  // Ação secundária preenchida com a superfície neutra.
  soft: "bg-ui-surface-2 text-ui-text-secondary hover:bg-ui-border",
  // Sem fundo nem borda; fundo aparece no hover.
  ghost: "text-ui-text-secondary hover:bg-ui-surface-2",
  // Confirmação destrutiva (Delete, Discard).
  danger: "bg-red-600 text-white hover:bg-red-700",
  // Botão com aparência de texto/link (Cancel, "← Back", Clear...).
  text: "text-ui-text-secondary hover:text-ui-text-primary",
  muted: "text-ui-text-muted hover:text-ui-text-primary",
  // Discreto em repouso, revela a intenção no hover (remove / edit).
  "muted-danger": "text-ui-text-muted hover:text-status-red-fg",
  "muted-accent": "text-ui-text-muted hover:text-ui-accent",
  "danger-text": "text-status-red-fg hover:underline",
  "accent-text": "text-ui-accent hover:text-ui-accent-strong",
};

export const BUTTON_SIZES = {
  xs: "rounded-md px-2 py-1 text-xs",
  sm: "rounded-md px-3 py-1 text-sm",
  md: "rounded-md px-4 py-2 text-sm",
  lg: "rounded-md px-6 py-2.5 text-sm",
  // Para as variantes de texto: sem padding nem raio.
  inline: "text-sm",
  "inline-xs": "text-xs",
};

export function buttonClass({ variant = "primary", size = "md", className = "" } = {}) {
  return [BASE, BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary, BUTTON_SIZES[size] ?? BUTTON_SIZES.md, className]
    .filter(Boolean)
    .join(" ");
}

// type="button" por padrão: um <button> sem type dentro de <form> vira
// submit sem querer. Botões de envio passam type="submit" explicitamente.
const Button = forwardRef(function Button(
  { variant = "primary", size = "md", type = "button", className = "", ...props },
  ref
) {
  return <button ref={ref} type={type} className={buttonClass({ variant, size, className })} {...props} />;
});

export default Button;

// Link do React Router com aparência de botão (ex.: "Go to Ideas").
export const ButtonLink = forwardRef(function ButtonLink(
  { variant = "primary", size = "md", className = "", ...props },
  ref
) {
  return <Link ref={ref} className={buttonClass({ variant, size, className })} {...props} />;
});

const ICON_TONES = {
  neutral: "text-ui-text-muted hover:bg-ui-surface-2 hover:text-ui-text-primary",
  accent: "text-ui-text-muted hover:bg-ui-accent-soft hover:text-ui-accent",
  danger: "text-ui-text-muted hover:bg-status-red-bg hover:text-status-red-fg",
};

const ICON_SIZES = {
  sm: "rounded p-1",
  md: "rounded-md p-1.5",
};

// Botão só com ícone. `label` é obrigatório: vira aria-label e title, que é
// o que leitores de tela anunciam (o ícone em si não tem nome).
export const IconButton = forwardRef(function IconButton(
  { label, tone = "neutral", size = "md", type = "button", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={[
        "inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        ICON_TONES[tone] ?? ICON_TONES.neutral,
        ICON_SIZES[size] ?? ICON_SIZES.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});
