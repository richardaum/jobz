import type { JobDescription } from "@/entities/job";
import type { Resume } from "@/entities/resume";
import type { ChecklistItem } from "@/shared/api";

export interface DebugInfo {
  job?: JobDescription;
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
  steps: Array<{
    step: string;
    timestamp: number;
    duration?: number;
    status: "success" | "error" | "info";
    details?: string;
  }>;
}
