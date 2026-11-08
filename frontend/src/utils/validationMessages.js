// D06: mensagens de validação do Pydantic (422) em texto legível para o usuário.
// Ex.: { loc: ["body", "description"], msg: "String should have at most 200 characters" }
//   -> "Description must be at most 200 characters."
// Função pura (sem import.meta), para poder ser testada com `node --test`.
function humanizeField(loc) {
  const parts = Array.isArray(loc) ? loc.filter((p) => p !== "body" && typeof p === "string") : [];
  const field = parts[parts.length - 1];
  if (!field) return "This field";
  const text = field.replace(/_id$/, "").replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function friendlyValidationMessage({ loc, msg = "", type = "" } = {}) {
  const field = humanizeField(loc);
  let match;
  if ((match = msg.match(/at most (\d+) character/))) return `${field} must be at most ${match[1]} characters.`;
  if (/at least 1 character/.test(msg) || /cannot be null/.test(msg)) return `${field} cannot be empty.`;
  if ((match = msg.match(/at least (\d+) character/))) return `${field} must be at least ${match[1]} characters.`;
  if (type === "missing" || msg === "Field required") return `${field} is required.`;
  if (/valid date/.test(msg)) return `${field} must be a valid date.`;
  if (/valid integer/.test(msg)) return `${field} is invalid.`;
  if (/Input should be/.test(msg) && type === "enum") return `${field} has an invalid value.`;
  const cleaned = msg
    .replace(/^Value error, /, "")
    .replace(/\b(start|due)_date\b/g, "$1 date");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + (/[.!?]$/.test(cleaned) ? "" : ".");
}
