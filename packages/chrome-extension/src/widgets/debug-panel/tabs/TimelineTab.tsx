import type { DebugInfo } from "../DebugPanel";

interface TimelineTabProps {
  debugInfo: DebugInfo;
}

export function TimelineTab({ debugInfo }: TimelineTabProps) {
  if (debugInfo.steps.length === 0) {
    return <div className="text-gray-500 text-xs">No steps recorded yet</div>;
  }

  return (
    <div className="space-y-2 text-xs">
      {debugInfo.steps.map((step, index) => (
        <div key={index} className="flex items-start gap-2">
          <div
            className={`w-2 h-2 rounded-full mt-1.5 ${
              step.status === "success" ? "bg-green-500" : step.status === "error" ? "bg-red-500" : "bg-blue-500"
            }`}
          />
          <div className="flex-1">
            <div className="font-semibold">{step.step}</div>
            {step.duration !== undefined && <div className="text-gray-500">Duration: {step.duration.toFixed(0)}ms</div>}
            {step.details && <div className="text-gray-600 mt-1 text-xs">{step.details}</div>}
            <div className="text-gray-400 text-xs mt-0.5">{new Date(step.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
