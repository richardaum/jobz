import { IconFileDescription, IconFileText, IconRobot, IconTarget, IconTerminal } from "@tabler/icons-react";

import type { JobDescription } from "@/entities/job";
import type { DebugInfo } from "@/features/match-job/model/types";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

export type ActionItem = {
  id: string;
  title: string;
  status: "success" | "error" | "info" | "processing";
  timestamp: number;
  duration?: number;
  icon: React.ReactNode;
  type: "job" | "resume" | "api" | "summary" | "log";
  data?: unknown;
};

export function useActionItems(
  debugInfo: DebugInfo,
  job: JobDescription | null,
  logFilters: Set<LogLevel>
): ActionItem[] {
  const duration = debugInfo.endTime && debugInfo.startTime ? debugInfo.endTime - debugInfo.startTime : null;
  const actionItems: ActionItem[] = [];

  // Add summary item if we have start/end time
  if (debugInfo.startTime) {
    actionItems.push({
      id: "summary",
      title: "Job Match Process",
      status: debugInfo.error ? "error" : debugInfo.endTime ? "success" : "processing",
      timestamp: debugInfo.startTime,
      duration: duration || undefined,
      icon: <IconTarget className="w-5 h-5" />,
      type: "summary",
      data: {
        startTime: debugInfo.startTime,
        endTime: debugInfo.endTime,
        duration,
        error: debugInfo.error,
      },
    });
  }

  // Add job extraction item
  if (job) {
    actionItems.push({
      id: "job-extraction",
      title: "Job Extraction",
      status: "success",
      timestamp: debugInfo.startTime || Date.now(),
      icon: <IconFileText className="w-5 h-5" />,
      type: "job",
      data: job,
    });
  }

  // Add resume loading item
  if (debugInfo.resume) {
    actionItems.push({
      id: "resume-loading",
      title: "Resume Loading",
      status: "success",
      timestamp: debugInfo.startTime || Date.now(),
      icon: <IconFileDescription className="w-5 h-5" />,
      type: "resume",
      data: debugInfo.resume,
    });
  }

  // Add API request/response item
  if (debugInfo.apiRequest || debugInfo.apiResponse) {
    actionItems.push({
      id: "api-call",
      title: "API Match",
      status: debugInfo.apiResponse ? "success" : "processing",
      timestamp: debugInfo.startTime || Date.now(),
      icon: <IconRobot className="w-5 h-5" />,
      type: "api",
      data: {
        request: debugInfo.apiRequest,
        response: debugInfo.apiResponse,
      },
    });
  }

  // Add logs item if we have logs
  const filteredLogs = (debugInfo.logs || []).filter((log) => logFilters.has(log.level));
  if (filteredLogs.length > 0) {
    actionItems.push({
      id: "logs",
      title: `Logs (${filteredLogs.length}${debugInfo.logs && debugInfo.logs.length > filteredLogs.length ? `/${debugInfo.logs.length}` : ""})`,
      status: filteredLogs.some((log) => log.level === "error") ? "error" : "info",
      timestamp: filteredLogs[0]?.timestamp || Date.now(),
      icon: <IconTerminal className="w-5 h-5" />,
      type: "log",
      data: filteredLogs,
    });
  }

  // Sort by timestamp
  actionItems.sort((a, b) => a.timestamp - b.timestamp);

  return actionItems;
}
