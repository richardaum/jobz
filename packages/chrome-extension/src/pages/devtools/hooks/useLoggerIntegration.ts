import { useEffect } from "react";

import { useMatchingStore } from "@/features/match-job";
import { runtime } from "@/shared/chrome-api";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

interface LogToStoreMessage {
  action: "logToStore";
  level: LogLevel;
  args: unknown[];
  timestamp: number;
}

/**
 * Hook that listens for log messages from content scripts (via background)
 * and adds them to the matching store for action history
 *
 * Note: Logs from devtools are added directly to store by logger.ts
 */
export function useLoggerIntegration() {
  const { setDebugInfo } = useMatchingStore();

  useEffect(() => {
    const handleMessage = (
      message: unknown,
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: unknown) => void
    ) => {
      if (typeof message !== "object" || message === null) return;

      const logMessage = message as LogToStoreMessage;
      if (logMessage.action !== "logToStore") return;

      const { level, args, timestamp } = logMessage;

      // Format message from args
      const messageText = args
        .map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");

      // Add log to store
      setDebugInfo((prev) => ({
        ...prev,
        logs: [
          ...(prev.logs || []),
          {
            level,
            message: messageText,
            timestamp,
            args: args.length > 1 ? args : undefined,
          },
        ],
      }));
    };

    // Listen for messages from background (content script logs)
    const cleanup = runtime.onMessage(handleMessage);

    return cleanup;
  }, [setDebugInfo]);
}
