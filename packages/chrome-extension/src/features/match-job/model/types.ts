import type { ChecklistItem } from "@jobz/ai";

import type { Resume } from "@/entities/resume";

export interface DebugInfo {
  resume?: Resume;
  startTime?: number;
  endTime?: number;
  apiRequest?: {
    model: string;
    promptLength: number;
    resumeLength: number;
    jobDescriptionLength: number;
  };
  apiResponse?: {
    matchPercentage: number;
    analysis: string;
    checklist?: ChecklistItem[];
    rawResponse?: unknown;
  };
  error?: {
    message: string;
    stack?: string;
    details?: unknown;
  };
  logs: Array<{
    level: "log" | "warn" | "error" | "info" | "debug";
    message: string;
    timestamp: number;
    args?: unknown[];
  }>;
}
