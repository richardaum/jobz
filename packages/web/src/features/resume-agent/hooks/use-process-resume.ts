import { OpenAIClient } from "@jobz/ai";
import { useMutation } from "@tanstack/react-query";

interface ProcessResumeParams {
  resume: string;
  jobDescription: string;
}

interface ProcessResumeResult {
  adaptedResume: string;
  gaps: string;
}

async function processResume({ resume, jobDescription }: ProcessResumeParams): Promise<ProcessResumeResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const client = new OpenAIClient(apiKey);

  // Process both in parallel
  const [adaptResult, gapsResult] = await Promise.all([
    client.adaptResume({
      resume,
      jobDescription,
    }),
    client.analyzeGaps({
      resume,
      jobDescription,
    }),
  ]);

  return {
    adaptedResume: adaptResult.adaptedResume,
    gaps: gapsResult.gaps,
  };
}

export function useProcessResume() {
  return useMutation({
    mutationFn: processResume,
    retry: 1,
  });
}

