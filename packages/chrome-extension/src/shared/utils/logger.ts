/**
 * Logger utility for Action History
 * - In devtools: adds directly to store
 * - In content script: sends to background, which forwards to devtools
 */

import { runtime } from "../chrome-api";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

/**
 * Check if we're running in devtools context
 */
function isDevtoolsContext(): boolean {
  try {
    return typeof chrome !== "undefined" && !!chrome.devtools;
  } catch {
    return false;
  }
}

/**
 * Add log directly to store (only works in devtools context)
 */
function addToStoreDirectly(level: LogLevel, args: unknown[]): void {
  if (!isDevtoolsContext()) return;

  try {
    // Dynamic import to avoid circular dependencies
    const { useMatchingStore } = require("@/features/match-job");
    const store = useMatchingStore.getState();
    if (!store?.setDebugInfo) return;

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

    store.setDebugInfo(
      (prev: { logs?: Array<{ level: LogLevel; message: string; timestamp: number; args?: unknown[] }> }) => ({
        ...prev,
        logs: [
          ...(prev.logs || []),
          {
            level,
            message: messageText,
            timestamp: Date.now(),
            args: args.length > 1 ? args : undefined,
          },
        ],
      })
    );
  } catch {
    // Store not available, will go through background
  }
}

function sendLogToExtension(level: LogLevel, ...args: unknown[]): void {
  // Always log to console first
  console[level](...args);

  // If in devtools, add directly to store
  if (isDevtoolsContext()) {
    addToStoreDirectly(level, args);
  }

  // Always send to background (for content script logs, background forwards to devtools)
  try {
    runtime
      .sendMessage({
        action: "log",
        level,
        args: args.map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }),
        timestamp: Date.now(),
      })
      .catch(() => {
        // Ignore errors
      });
  } catch {
    // Ignore errors
  }
}

export const logger = {
  log: (...args: unknown[]) => sendLogToExtension("log", ...args),
  warn: (...args: unknown[]) => sendLogToExtension("warn", ...args),
  error: (...args: unknown[]) => sendLogToExtension("error", ...args),
  info: (...args: unknown[]) => sendLogToExtension("info", ...args),
  debug: (...args: unknown[]) => sendLogToExtension("debug", ...args),
};
