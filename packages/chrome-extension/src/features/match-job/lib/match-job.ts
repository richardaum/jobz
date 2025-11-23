import type { JobDescription } from "@/entities/job";
import type { Resume } from "@/entities/resume";
import type { ChecklistItem } from "@/shared/api";
import { OpenAIClient } from "@/shared/api";
import { getCachedMatch, saveMatchToCache } from "@/shared/lib/match-cache";

export interface MatchResult {
  matchPercentage: number;
  analysis: string;
  checklist: ChecklistItem[];
  job: JobDescription;
  isCached?: boolean;
}

export async function matchJobWithResume(
  job: JobDescription,
  resume: Resume,
  openAIApiKey: string,
  skipCache: boolean = false
): Promise<MatchResult> {
  // Check cache first unless skipCache is true
  if (!skipCache) {
    const cached = await getCachedMatch(job);
    if (cached) {
      return {
        ...cached,
        isCached: true,
      };
    }
  }

  // If not cached or skipCache is true, make API call
  const client = new OpenAIClient(openAIApiKey);

  const response = await client.matchJob({
    jobDescription: job.description,
    resume: resume.content,
  });

  const result: MatchResult = {
    matchPercentage: response.matchPercentage,
    analysis: response.analysis,
    checklist: response.checklist,
    job,
    isCached: false,
  };

  // Save to cache
  await saveMatchToCache(result);

  return result;
}
