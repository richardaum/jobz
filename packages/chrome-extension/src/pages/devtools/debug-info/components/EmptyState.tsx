export function EmptyState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Action History</h2>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-600 mb-2">No actions recorded yet.</p>
        <p className="text-xs text-gray-500">
          Run a job match in the "Job Match" tab to see the action history here.
        </p>
      </div>
    </div>
  );
}


