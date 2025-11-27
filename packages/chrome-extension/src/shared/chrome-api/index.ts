/**
 * Chrome API abstractions
 *
 * This module provides type-safe, promise-based abstractions over the Chrome Extension APIs.
 * Use these abstractions instead of calling chrome.* APIs directly for better:
 * - Type safety
 * - Error handling
 * - Testability
 * - Consistency
 */

export { storage, syncStorage } from "./storage";
export { tabs, type ActiveTab } from "./tabs";
export { runtime, type MessageListener } from "./runtime";
export { devtools } from "./devtools";
export { scripting } from "./scripting";
