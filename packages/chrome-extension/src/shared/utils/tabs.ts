export type { ActiveTab } from "../chrome-api";
export { tabs } from "../chrome-api";

/**
 * @deprecated Use tabs.getActiveTab() instead
 */
export async function getActiveTab(): Promise<import("../chrome-api").ActiveTab> {
  const { tabs } = await import("../chrome-api");
  return tabs.getActiveTab();
}
