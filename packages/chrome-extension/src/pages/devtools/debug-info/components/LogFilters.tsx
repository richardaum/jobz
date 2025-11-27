type LogLevel = "log" | "warn" | "error" | "info" | "debug";

interface LogFiltersProps {
  logs: Array<{
    level: LogLevel;
    message: string;
    timestamp: number;
    args?: unknown[];
  }>;
  logFilters: Set<LogLevel>;
  onToggleFilter: (level: LogLevel) => void;
}

export function LogFilters({ logs, logFilters, onToggleFilter }: LogFiltersProps) {
  if (logs.length === 0) {
    return null;
  }

  const colors = {
    debug: "bg-gray-100 text-gray-700 border-gray-300",
    log: "bg-gray-100 text-gray-700 border-gray-300",
    info: "bg-blue-100 text-blue-700 border-blue-300",
    warn: "bg-yellow-100 text-yellow-700 border-yellow-300",
    error: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Logs:</span>
      {(["debug", "log", "info", "warn", "error"] as LogLevel[]).map((level) => {
        const isEnabled = logFilters.has(level);
        const count = logs.filter((log) => log.level === level).length;
        return (
          <button
            key={level}
            onClick={() => onToggleFilter(level)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              isEnabled ? colors[level] : "bg-gray-50 text-gray-400 border-gray-200 opacity-50"
            }`}
            title={`${count} ${level} logs`}
          >
            {level.toUpperCase()} {count > 0 && `(${count})`}
          </button>
        );
      })}
    </div>
  );
}
