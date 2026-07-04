export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Dashboard</h2>
      <p className="text-gray-500 mb-6">
        Indicators and post calendar.
      </p>

      {/* Placeholder: indicators will go here in a future step. */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-24" />
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-24" />
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-24" />
      </div>

      {/* Placeholder: post calendar goes here. */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
        Calendar (to be implemented)
      </div>
    </div>
  );
}
