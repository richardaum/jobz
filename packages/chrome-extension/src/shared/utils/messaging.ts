import type { JobDescription } from "@/entities/job";
import { JobExtractorFactory } from "@/features/extract-job";

export interface PingMessage {
  action: "ping";
}

export interface PingResponse {
  success: boolean;
}

export interface ExtractJobMessage {
  action: typeof JobExtractorFactory.ACTION;
}

export interface ExtractJobResponse {
  success: boolean;
  job?: JobDescription;
  error?: string;
}

export type ExtensionMessage = PingMessage | ExtractJobMessage;

export type ExtensionResponse<T extends ExtensionMessage> = T extends PingMessage
  ? PingResponse
  : T extends ExtractJobMessage
    ? ExtractJobResponse
    : never;

export async function sendTabMessage<T extends ExtensionMessage>(
  tabId: number,
  message: T
): Promise<ExtensionResponse<T>> {
  return chrome.tabs.sendMessage(tabId, message);
}
