import { IconCopy, IconTrash } from "@tabler/icons-react";

import { Button } from "@/shared/ui";

import type { DebugInfo } from "@/features/match-job/model/types";
import { LogFilters } from "./LogFilters";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

interface DebugInfoHeaderProps {
  debugInfo: DebugInfo;
  duration: number | null;
  logFilters: Set<LogLevel>;
  onToggleLogFilter: (level: LogLevel) => void;
  onCopy: () => void;
  onClear: () => void;
  copied: boolean;
}

export function DebugInfoHeader({
  debugInfo,
  duration,
  logFilters,
  onToggleLogFilter,
  onCopy,
  onClear,
  copied,
}: DebugInfoHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <h2 className="text-2xl font-bold">Action History</h2>
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={onCopy}
          className="flex items-center gap-2"
          title="Copy action history to clipboard"
        >
          <IconCopy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button
          variant="secondary"
          onClick={onClear}
          className="flex items-center gap-2"
          title="Clear action history"
        >
          <IconTrash className="w-4 h-4" />
          Clear
        </Button>
        <LogFilters logs={debugInfo.logs || []} logFilters={logFilters} onToggleFilter={onToggleLogFilter} />
        {duration !== null && (
          <div className="text-sm text-gray-500">
            Total Duration: <span className="font-mono font-semibold">{duration.toFixed(0)}ms</span>
          </div>
        )}
      </div>
    </div>
  );
}


