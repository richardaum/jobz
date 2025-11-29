import type { AxiosInstance } from "axios";

import { DEFAULT_OPENAI_MODEL } from "../config";
import { buildMatchJobPrompt } from "../prompts/match-job-prompt";
import type { MatchJobRequest, MatchJobResponse } from "../types";

/**
 * System message for job matching analysis
 */
const MATCH_JOB_SYSTEM_MESSAGE =
  "You are a career advisor providing personalized job matching analysis. Address the " +
  "candidate directly using 'your' and 'you' (second person), as if speaking directly " +
  "to them. Focus on whether the job is a good fit FOR the candidate, not the other " +
  "way around. Provide a percentage match (0-100) and a brief, conversational " +
  "analysis written as if you're advising the candidate personally.";

/**
 * Match a job description with a resume using OpenAI
 */
export async function matchJob(client: AxiosInstance, request: MatchJobRequest): Promise<MatchJobResponse> {
  const prompt = buildMatchJobPrompt(request.jobDescription, request.resume, request.personalPreferences);

  try {
    const response = await client.post("/chat/completions", {
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: MATCH_JOB_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0.3,
    });

    const content = JSON.parse(response.data.choices[0].message.content);
    return {
      matchPercentage: content.matchPercentage || 0,
      analysis: content.analysis || "",
      checklist: content.checklist || [],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to match job with resume");
  }
}
