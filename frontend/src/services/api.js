import { friendlyValidationMessage } from "../utils/validationMessages.js";

// E01: por padrão chama /api no próprio frontend (proxy do Vite em dev, nginx
// em produção). VITE_API_URL continua permitindo apontar para outra API.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON, keep statusText
    }

    // FastAPI manda 422 de validação como lista de { loc, msg }.
    let message;
    if (typeof detail === "string") {
      message = detail.replace(/^Value error, /, "");
    } else if (Array.isArray(detail)) {
      message = detail.map(friendlyValidationMessage).join(" ");
    } else {
      message = detail?.message || JSON.stringify(detail);
    }

    // status/detail ficam no erro pra quem precisa tratar 409/422 estruturados
    // (ex.: confirmação de data e conflitos de due date nos Cycles).
    const error = new Error(message);
    error.status = res.status;
    error.detail = detail;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: (path, data) =>
    request(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: (path) => request(path, { method: "DELETE" }),
};