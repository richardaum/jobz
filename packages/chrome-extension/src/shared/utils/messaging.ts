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

export interface StartLearningMessage {
  action: "startLearning";
}

export interface StopLearningMessage {
  action: "stopLearning";
}

export interface ElementSelectedMessage {
  action: "elementSelected";
  selector: string;
  text: string;
}

export type ExtensionMessage =
  | PingMessage
  | ExtractJobMessage
  | StartLearningMessage
  | StopLearningMessage
  | ElementSelectedMessage;

export type ExtensionResponse<T extends ExtensionMessage> = T extends PingMessage
  ? PingResponse
  : T extends ExtractJobMessage
    ? ExtractJobResponse
    : T extends StartLearningMessage
      ? { success: boolean }
      : T extends StopLearningMessage
        ? { success: boolean }
        : void;

import { tabs } from "../chrome-api";

export async function sendTabMessage<T extends ExtensionMessage>(
  tabId: number,
  message: T
): Promise<ExtensionResponse<T>> {
  return await tabs.sendMessage<ExtensionResponse<T>>(tabId, message);
}
