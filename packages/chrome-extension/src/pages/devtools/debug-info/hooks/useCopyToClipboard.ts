import { useState } from "react";

import type { JobDescription } from "@/entities/job";
import type { DebugInfo } from "@/features/match-job/model/types";

import type { ActionItem } from "./useActionItems";

export function useCopyToClipboard(
  debugInfo: DebugInfo,
  job: JobDescription | null,
  actionItems: ActionItem[],
  duration: number | null
) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const dataToCopy = {
      summary: {
        startTime: debugInfo.startTime ? new Date(debugInfo.startTime).toISOString() : null,
        endTime: debugInfo.endTime ? new Date(debugInfo.endTime).toISOString() : null,
        duration: duration !== null ? `${duration.toFixed(0)}ms` : null,
        error: debugInfo.error || null,
      },
      job: job || null,
      resume: debugInfo.resume || null,
      apiRequest: debugInfo.apiRequest || null,
      apiResponse: debugInfo.apiResponse || null,
      logs: debugInfo.logs || [],
      actionItems: actionItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        timestamp: new Date(item.timestamp).toISOString(),
        duration: item.duration ? `${item.duration.toFixed(0)}ms` : undefined,
        type: item.type,
      })),
    };

    try {
      const jsonString = JSON.stringify(dataToCopy, null, 2);
      await navigator.clipboard.writeText(jsonString);

      // Show temporary feedback
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = JSON.stringify(dataToCopy, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      // Show temporary feedback
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return { copyToClipboard, copied };
}
