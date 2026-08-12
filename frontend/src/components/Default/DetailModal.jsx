const SIZE_CLASSES = {
  md: "max-w-lg", // ~32rem — formulários simples (ex: criar ideia)
  lg: "max-w-2xl", // ~42rem — detalhe com algumas seções
  xl: "max-w-4xl", // ~56rem — detalhe denso (ex: idea + planning + checklist)
};

export default function DetailModal({ children, onClose, size = "lg" }) {
  return (
    // A centralização é 100% do Flexbox aqui — nenhum filho deve receber
    // position:fixed/left/right próprios, senão volta a competir com isso.
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg border border-gray-200 w-full ${
          SIZE_CLASSES[size] || SIZE_CLASSES.lg
        } p-8 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}