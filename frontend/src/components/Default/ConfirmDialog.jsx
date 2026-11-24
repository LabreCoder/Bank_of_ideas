import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import { Button, Card } from "../ui";

// Confirmação reutilizável no padrão visual do app (D03). Substitui o
// window.confirm nativo nas exclusões e no aviso de alterações não salvas.
// O foco começa em "Cancel" (a opção segura); Esc também cancela.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return createPortal(
    <ConfirmDialogContent
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      tone={tone}
      busy={busy}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
    document.body
  );
}

function ConfirmDialogContent({ title, message, confirmLabel, cancelLabel, tone, busy, onConfirm, onCancel }) {
  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const messageId = useId();
  const { trapTab } = useDialogFocus(panelRef, { initialFocusRef: cancelRef });

  const handleKeyDown = (event) => {
    // stopPropagation: um ConfirmDialog aberto sobre um DetailModal não deve
    // fechar o modal de baixo com o mesmo Esc.
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      if (!busy) onCancel();
      return;
    }
    trapTab(event);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <Card
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleKeyDown}
        padding={6}
        className="w-full max-w-md shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-ui-text-primary">
          {title}
        </h2>
        <div id={messageId} className="mt-2 text-sm text-ui-text-secondary">
          {message}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" size="md" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "primary" ? "primary" : "danger"} size="md" onClick={onConfirm} disabled={busy}>
            {busy ? "Working..." : confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
