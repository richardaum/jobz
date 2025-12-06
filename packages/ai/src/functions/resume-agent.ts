import type { AxiosInstance } from "axios";

import { DEFAULT_OPENAI_MODEL } from "../config";
import { buildProcessResumePrompt } from "../prompts/process-resume-prompt";
import type { ProcessResumeRequest, ProcessResumeResponse } from "../types";

/**
 * System message for consolidated resume processing
 * Combines job matching (second person), resume adaptation, and gap analysis (first person)
 */
const PROCESS_RESUME_SYSTEM_MESSAGE =
  "You are an expert career advisor and resume writer. You help candidates understand job matches, " +
  "adapt their resumes to specific positions, and identify gaps in their qualifications. " +
  "For job matching analysis, address the candidate directly using 'your' and 'you' (second person). " +
  "For gap analysis, write from the candidate's perspective using 'I' and 'my' (first person). " +
  "You provide comprehensive, actionable advice that helps candidates make informed career decisions.";

/**
 * Process resume: match job, adapt resume, and analyze gaps in a single API call
 */
export async function processResume(
  client: AxiosInstance,
  request: ProcessResumeRequest
): Promise<ProcessResumeResponse> {
  const prompt = buildProcessResumePrompt(
    request.jobDescription,
    request.resume,
    request.tone || "professional",
    request.focus
  );

  try {
    const response = await client.post("/chat/completions", {
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: PROCESS_RESUME_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0.35, // Balanced temperature for all three tasks (slightly lower for more accurate matching)
    });

    const content = JSON.parse(response.data.choices[0].message.content);
    return {
      matchJob: {
        matchPercentage: content.matchJob?.matchPercentage || 0,
        analysis: content.matchJob?.analysis || "",
        checklist: content.matchJob?.checklist || [],
      },
      adaptResume: {
        adaptedResume: content.adaptResume?.adaptedResume || "",
        sections: content.adaptResume?.sections || [],
        changes: content.adaptResume?.changes || [],
        keywords: content.adaptResume?.keywords || [],
      },
      analyzeGaps: {
        gaps: content.analyzeGaps?.gaps || "",
      },
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to process resume");
  }
}
