import { OpenAIClient, getOpenAIApiKey } from "@jobz/ai";
import { useQuery } from "@tanstack/react-query";

import { useLocalStorage } from "@/shared/hooks/use-local-storage";

export interface MatchResult {
  matchPercentage: number;
  analysis: string;
}

interface UseJobMatchParams {
  resume: string;
  jobDescription: string;
  enabled?: boolean;
}

const STORAGE_KEY = "resumeAgent:jobMatchAnalysis";

async function fetchJobMatch(resume: string, jobDescription: string): Promise<MatchResult> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const client = new OpenAIClient(apiKey);
  const result = await client.matchJob({ resume, jobDescription });

  return {
    matchPercentage: result.matchPercentage,
    analysis: result.analysis,
  };
}

export function useJobMatch({ resume, jobDescription, enabled = true }: UseJobMatchParams) {
  const trimmedResume = resume.trim();
  const trimmedJobDescription = jobDescription.trim();
  const hasValidInputs = trimmedResume.length > 0 && trimmedJobDescription.length > 0;

  const [storedMatch, setStoredMatch] = useLocalStorage<MatchResult | null>(STORAGE_KEY, null);

  const query = useQuery({
    queryKey: ["jobMatch", trimmedResume, trimmedJobDescription],
    queryFn: async () => {
      const result = await fetchJobMatch(trimmedResume, trimmedJobDescription);
      setStoredMatch(result);
      return result;
    },
    enabled: enabled && hasValidInputs,
    initialData: storedMatch,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    matchResult: query.data ?? null,
    isMatching: query.isFetching,
    error: query.error,
  };
}
