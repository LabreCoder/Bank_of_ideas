import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "../../hooks/useDialogFocus";

const CONFIRM_TONES = {
  danger: "bg-red-600 hover:bg-red-700 text-white",
  primary: "bg-accent-600 hover:bg-accent-700 text-white",
};

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
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-lg border border-ui-border bg-ui-surface p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-ui-text-primary">
          {title}
        </h2>
        <div id={messageId} className="mt-2 text-sm text-ui-text-secondary">
          {message}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-ui-border px-4 py-2 text-sm font-medium text-ui-text-primary hover:bg-ui-surface-2 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              CONFIRM_TONES[tone] || CONFIRM_TONES.danger
            }`}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
