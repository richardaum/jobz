import type { DebugInfo } from "../DebugPanel";

interface TimelineTabProps {
  debugInfo: DebugInfo;
}

export function TimelineTab({ debugInfo }: TimelineTabProps) {
  const logs = debugInfo.logs || [];

  if (logs.length === 0) {
    return <div className="text-gray-500 text-xs">No logs recorded yet</div>;
  }

  const levelColors = {
    debug: "bg-gray-500",
    log: "bg-gray-500",
    info: "bg-blue-500",
    warn: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className="space-y-2 text-xs">
      {logs.map((log, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className={`w-2 h-2 rounded-full mt-1.5 ${levelColors[log.level]}`} />
          <div className="flex-1">
            <div className="font-semibold font-mono">{log.message}</div>
            {log.args && log.args.length > 0 && (
              <div className="text-gray-600 mt-1 text-xs p-2 bg-gray-50 rounded max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {log.args.map((arg, idx) => {
                    if (typeof arg === "string") {
                      return <div key={idx}>{arg}</div>;
                    }
                    try {
                      return <div key={idx}>{JSON.stringify(arg, null, 2)}</div>;
                    } catch {
                      return <div key={idx}>{String(arg)}</div>;
                    }
                  })}
                </pre>
              </div>
            )}
            <div className="text-gray-400 text-xs mt-0.5">
              {new Date(log.timestamp).toLocaleTimeString()} • {log.level.toUpperCase()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
