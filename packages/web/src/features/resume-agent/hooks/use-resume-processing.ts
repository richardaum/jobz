import { useEffect } from "react";
import { toast } from "sonner";

import { useResumeAgent } from "./resume-agent";
import type { MatchResult } from "../stores/resume-store";

interface ProcessedData {
  adaptedResume: string;
  gaps: string;
  matchResult: MatchResult;
  changes: { section: string; description: string }[];
}

interface UseResumeProcessingParams {
  onSuccess: (data: ProcessedData) => void;
}

export function useResumeProcessing({ onSuccess }: UseResumeProcessingParams) {
  const mutation = useResumeAgent();

  useEffect(() => {
    if (mutation.error) {
      const errorMessage =
        mutation.error instanceof Error ? mutation.error.message : "An error occurred while processing your resume";
      toast.error(errorMessage);
    }
  }, [mutation.error]);

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

      const matchResult: MatchResult = {
        matchPercentage: result.matchJob.matchPercentage,
        analysis: result.matchJob.analysis,
        checklist: result.matchJob.checklist,
      };

      onSuccess({
        adaptedResume: result.adaptResume.adaptedResume,
        gaps: result.analyzeGaps.gaps,
        matchResult,
        changes: result.adaptResume.changes || [],
      });

      toast.success("Resume processed successfully!");
    } catch (err) {
      // Error is handled by useEffect above
      console.error("Error processing resume:", err);
    }
  };

  return {
    process,
    isLoading: mutation.isPending,
    isMatching: mutation.isPending,
    currentMatchResult: mutation.data
      ? {
          matchPercentage: mutation.data.matchJob.matchPercentage,
          analysis: mutation.data.matchJob.analysis,
          checklist: mutation.data.matchJob.checklist,
        }
      : null,
  };
}
