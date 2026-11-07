import { useEffect } from "react";

// Avisa o navegador para pedir confirmação ao fechar/recarregar a aba
// enquanto houver alterações não salvas (D01).
export function useUnsavedChangesGuard(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      // Exigido por alguns navegadores para exibir o aviso padrão.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
