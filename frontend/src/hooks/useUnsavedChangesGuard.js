import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export const UNSAVED_CHANGES_MESSAGE = "You have unsaved changes. Leave without saving?";

// Protege telas com alterações não salvas (D01/D02/D03):
// - fechar/recarregar a aba: aviso nativo do navegador (beforeunload — o texto
//   não pode ser personalizado);
// - qualquer troca de rota dentro do app (voltar, links do topo, botões da
//   tela): useBlocker segura a navegação e a tela mostra um ConfirmDialog com
//   `leaveDialog` ({ open, onConfirm, onCancel }).
// `allowNextNavigation()` libera a próxima navegação sem perguntar (ex.: depois
// de excluir o registro, quando as alterações deixam de fazer sentido).
export function useUnsavedChangesGuard(dirty) {
  const allowRef = useRef(false);

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

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !allowRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  const allowNextNavigation = useCallback(() => {
    allowRef.current = true;
  }, []);

  const leaveDialog = {
    open: blocker.state === "blocked",
    onConfirm: () => blocker.proceed?.(),
    onCancel: () => blocker.reset?.(),
  };

  return { allowNextNavigation, leaveDialog };
}
