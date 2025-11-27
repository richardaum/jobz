import { OpenAIClient } from "@jobz/ai";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface MatchResult {
  matchPercentage: number;
  analysis: string;
}

interface UseJobMatchParams {
  resume: string;
  jobDescription: string;
  enabled?: boolean;
  debounceMs?: number;
}

async function fetchJobMatch(resume: string, jobDescription: string): Promise<MatchResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const client = new OpenAIClient(apiKey);
  const result = await client.matchJob({
    resume,
    jobDescription,
  });

  return {
    matchPercentage: result.matchPercentage,
    analysis: result.analysis,
  };
}

export function useJobMatch({
  resume,
  jobDescription,
  enabled = true,
  debounceMs = 1000,
}: UseJobMatchParams) {
  const [debouncedResume, setDebouncedResume] = useState(resume);
  const [debouncedJobDescription, setDebouncedJobDescription] = useState(jobDescription);

  // Debounce inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResume(resume);
      setDebouncedJobDescription(jobDescription);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [resume, jobDescription, debounceMs]);

  const hasValidInputs = debouncedResume.trim().length > 0 && debouncedJobDescription.trim().length > 0;

  const query = useQuery({
    queryKey: ["jobMatch", debouncedResume, debouncedJobDescription],
    queryFn: () => fetchJobMatch(debouncedResume, debouncedJobDescription),
    enabled: enabled && hasValidInputs,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 1,
  });

  return {
    matchResult: query.data ?? null,
    isMatching: query.isFetching,
    error: query.error,
  };
}
