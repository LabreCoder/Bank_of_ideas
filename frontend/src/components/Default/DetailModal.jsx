import { useRef, useState } from "react";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import ConfirmDialog from "./ConfirmDialog";

const SIZE_CLASSES = {
  md: "max-w-lg", // ~32rem — formulários simples (ex: criar ideia)
  lg: "max-w-2xl", // ~42rem — detalhe com algumas seções
  xl: "max-w-4xl", // ~56rem — detalhe denso (ex: idea + planning + checklist)
};

// Modal base (D03):
// - role="dialog" + aria-modal; título via `labelledBy` (id de um heading
//   dentro do modal) ou `ariaLabel`;
// - Esc e clique fora fecham;
// - foco vai para o primeiro campo ao abrir, fica preso no modal e volta para
//   o elemento de origem ao fechar;
// - `dirty`: com alterações não salvas, fechar pede confirmação antes.
export default function DetailModal({
  children,
  onClose,
  size = "lg",
  labelledBy,
  ariaLabel,
  dirty = false,
  dirtyMessage = "You have unsaved changes. Close without saving?",
}) {
  const panelRef = useRef(null);
  const { trapTab } = useDialogFocus(panelRef);
  const [confirmingClose, setConfirmingClose] = useState(false);

  const requestClose = () => {
    if (dirty) setConfirmingClose(true);
    else onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }
    trapTab(event);
  };

  return (
    // A centralização é 100% do Flexbox aqui — nenhum filho deve receber
    // position:fixed/left/right próprios, senão volta a competir com isso.
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      // onMouseDown + alvo = fundo: arrastar uma seleção de texto de dentro
      // para fora do modal não o fecha.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`bg-white rounded-lg border border-gray-200 w-full ${
          SIZE_CLASSES[size] || SIZE_CLASSES.lg
        } p-8 max-h-[90vh] overflow-y-auto focus:outline-none`}
      >
        {children}
      </div>

      <ConfirmDialog
        open={confirmingClose}
        title="Discard changes?"
        message={dirtyMessage}
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          setConfirmingClose(false);
          onClose();
        }}
        onCancel={() => setConfirmingClose(false)}
      />
    </div>
  );
}
