"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useSettingsStore } from "@/shared/stores";

import type { MatchResult } from "@/entities/match-result";
import type { ResumeChange } from "@/entities/resume";
import { ApiKeyError,useResumeAgent } from "./resume-agent";

interface ProcessedData {
  adaptedResume: string;
  gaps: string;
  matchResult: MatchResult;
  changes: ResumeChange[];
}

interface UseResumeProcessingParams {
  onSuccess: (data: ProcessedData) => void;
}

function createMatchResult(data: {
  matchJob: { matchPercentage: number; analysis: string; checklist: MatchResult["checklist"] };
}): MatchResult {
  return {
    matchPercentage: data.matchJob.matchPercentage,
    analysis: data.matchJob.analysis,
    checklist: data.matchJob.checklist,
  };
}

export function useResumeProcessing({ onSuccess }: UseResumeProcessingParams) {
  const mutation = useResumeAgent();
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);

  useEffect(() => {
    if (mutation.error) {
      const errorMessage =
        mutation.error instanceof Error ? mutation.error.message : "An error occurred while processing your resume";

      // Check if it's an API key error
      const isApiKeyError = mutation.error instanceof ApiKeyError;

      if (isApiKeyError) {
        toast.error(errorMessage, {
          action: {
            label: "Open Settings",
            onClick: () => setIsSettingsOpen(true),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    }
  }, [mutation.error, setIsSettingsOpen]);

  const process = async (resume: string, jobDescription: string) => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast.error("Please fill in both resume and job description");
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        resume,
        jobDescription,
      });

      const matchResult = createMatchResult(result);

      onSuccess({
        adaptedResume: result.adaptResume.adaptedResume,
        gaps: result.analyzeGaps.gaps,
        matchResult,
        changes: result.adaptResume.changes || [],
      });

      toast.success("Resume processed successfully!");
    } catch (err) {
      // Error is handled by useEffect above
      // Only log errors that aren't handled (API key errors are handled via toast)
      if (!(err instanceof ApiKeyError)) {
        console.error("Error processing resume:", err);
      }
    }
  };

  return {
    process,
    isLoading: mutation.isPending,
    isMatching: mutation.isPending,
    currentMatchResult: mutation.data ? createMatchResult(mutation.data) : null,
  };
}
