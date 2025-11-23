/**
 * Logger utility that redirects logs from content scripts to the extension's background service worker
 */

type LogLevel = "log" | "warn" | "error" | "info";

function sendLogToExtension(level: LogLevel, ...args: unknown[]): void {
  try {
    chrome.runtime.sendMessage({
      action: "log",
      level,
      args: args.map((arg) => {
        // Serialize arguments for sending via message
        if (typeof arg === "object" && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }),
    });
  } catch (error) {
    // If messaging fails (e.g., extension context invalidated), fallback to console
    console[level](...args);
  }
}

export const logger = {
  log: (...args: unknown[]) => {
    sendLogToExtension("log", ...args);
  },
  warn: (...args: unknown[]) => {
    sendLogToExtension("warn", ...args);
  },
  error: (...args: unknown[]) => {
    sendLogToExtension("error", ...args);
  },
  info: (...args: unknown[]) => {
    sendLogToExtension("info", ...args);
  },
};
