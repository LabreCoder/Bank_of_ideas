export default function DetailModal({ children }) {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-lg border border-gray-200 w-full max-w-[84vw] p-8 max-h-[90vh] overflow-y-auto"
                style={{ left: "14%", right: "14%", position: "fixed" }}
            >
                {children}
            </div>
        </div>
    )
}