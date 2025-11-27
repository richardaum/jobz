import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useMatchingStore } from "@/features/match-job";

import { ActionHistoryList } from "./ActionHistoryList";
import { DebugInfoHeader } from "./DebugInfoHeader";
import { EmptyState } from "./EmptyState";
import { useActionItems } from "../hooks/useActionItems";
import { useClearActionHistory } from "../hooks/useClearActionHistory";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

export function DebugInfo() {
  const { debugInfo, job } = useMatchingStore(
    useShallow((state) => ({
      debugInfo: state.debugInfo || { logs: [] },
      job: state.job,
    }))
  );

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [logFilters, setLogFilters] = useState<Set<LogLevel>>(new Set(["log", "warn", "error", "info", "debug"]));

  // Ensure debugInfo has default values
  const safeDebugInfo = {
    ...debugInfo,
    logs: debugInfo?.logs || [],
  };

  const duration =
    safeDebugInfo.endTime && safeDebugInfo.startTime ? safeDebugInfo.endTime - safeDebugInfo.startTime : null;

  const actionItems = useActionItems(safeDebugInfo, job, logFilters);
  const { copyToClipboard, copied } = useCopyToClipboard(safeDebugInfo, job, actionItems, duration);
  const { clearActionHistory } = useClearActionHistory();

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleLogFilter = (level: LogLevel) => {
    setLogFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const handleClear = () => {
    clearActionHistory();
    setExpandedItems(new Set());
  };

  // Show empty state if no debug info available
  const hasAnyData =
    safeDebugInfo.startTime ||
    job ||
    safeDebugInfo.resume ||
    safeDebugInfo.apiRequest ||
    safeDebugInfo.apiResponse ||
    (safeDebugInfo.logs && safeDebugInfo.logs.length > 0);

  if (!hasAnyData) {
    return <EmptyState />;
  }

  try {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <DebugInfoHeader
          debugInfo={safeDebugInfo}
          duration={duration}
          logFilters={logFilters}
          onToggleLogFilter={toggleLogFilter}
          onCopy={copyToClipboard}
          onClear={handleClear}
          copied={copied}
        />
        <ActionHistoryList actionItems={actionItems} expandedItems={expandedItems} onToggleItem={toggleItem} />
      </div>
    );
  } catch (error) {
    console.error("[DebugInfo] Error rendering component:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error rendering Debug Info</h2>
        <p className="text-sm text-red-600 mb-2">{error instanceof Error ? error.message : String(error)}</p>
        <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-64">
          {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }
}
