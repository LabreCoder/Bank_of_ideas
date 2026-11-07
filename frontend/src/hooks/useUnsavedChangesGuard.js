import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export const UNSAVED_CHANGES_MESSAGE = "You have unsaved changes. Leave without saving?";

// Protege telas com alterações não salvas (D01/D02):
// - fechar/recarregar a aba: aviso nativo do navegador (beforeunload);
// - qualquer troca de rota dentro do app (voltar, links do topo, botões da tela):
//   useBlocker pede confirmação.
// `allowNextNavigation()` libera a próxima navegação sem perguntar (ex.: depois
// de excluir o registro, quando as alterações deixam de fazer sentido).
export function useUnsavedChangesGuard(dirty, message = UNSAVED_CHANGES_MESSAGE) {
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

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm(message)) blocker.proceed();
    else blocker.reset();
  }, [blocker, message]);

  const allowNextNavigation = useCallback(() => {
    allowRef.current = true;
  }, []);

  return { allowNextNavigation };
}
