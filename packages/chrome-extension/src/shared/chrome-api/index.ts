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

export { devtools } from "./devtools";
export { type MessageListener, runtime } from "./runtime";
export { scripting } from "./scripting";
export { storage, syncStorage } from "./storage";
export { type ActiveTab, tabs } from "./tabs";
