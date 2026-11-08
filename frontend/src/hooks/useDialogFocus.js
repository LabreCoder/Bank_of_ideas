import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const FIELDS = "input:not([disabled]), select:not([disabled]), textarea:not([disabled])";

// Gerência de foco para diálogos (D03):
// - ao abrir, foca `initialFocusRef` ou o primeiro campo do formulário (ou o
//   primeiro elemento focável);
// - Tab/Shift+Tab ficam presos dentro do diálogo (use o `onKeyDown` retornado);
// - ao fechar, devolve o foco a quem estava focado antes de abrir.
export function useDialogFocus(containerRef, { initialFocusRef } = {}) {
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const container = containerRef.current;
    if (container) {
      const target =
        initialFocusRef?.current ||
        container.querySelector(FIELDS) ||
        container.querySelector(FOCUSABLE) ||
        container;
      target.focus({ preventScroll: true });
    }
    return () => {
      const el = previouslyFocused.current;
      if (el && typeof el.focus === "function" && document.contains(el)) el.focus();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const trapTab = (event) => {
    if (event.key !== "Tab") return;
    const container = containerRef.current;
    if (!container) return;
    const items = [...container.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return { trapTab };
}
