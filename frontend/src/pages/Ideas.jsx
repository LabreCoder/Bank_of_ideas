export default function Ideas() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Ideas</h2>
          <p className="text-gray-500">
            Register, edit, and activate/deactivate your content ideas.
          </p>
        </div>
        <button className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-4 py-2 rounded-md">
          + New Idea
        </button>
      </div>

      {/* Placeholder: list/table of ideas will go here in the next step. */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
        List of ideas (to be implemented)
      </div>
    </div>
  );
}
