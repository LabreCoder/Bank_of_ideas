import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// "Voltar" que respeita o histórico (D02): se a tela foi aberta a partir de
// outra tela do app, volta para ela; se foi acessada direto (link, F5 em nova
// aba), vai para `fallback` (normalmente a lista).
export function useGoBack(fallback) {
  const navigate = useNavigate();
  const location = useLocation();
  // O React Router usa a key "default" para a primeira entrada da sessão.
  const hasInternalHistory = location.key !== "default";

  const goBack = useCallback(() => {
    if (hasInternalHistory) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [hasInternalHistory, navigate, fallback]);

  return { goBack, hasInternalHistory };
}
