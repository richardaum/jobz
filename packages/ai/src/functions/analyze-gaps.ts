import type { AxiosInstance } from "axios";

import { DEFAULT_OPENAI_MODEL } from "../config";
import { buildAnalyzeGapsPrompt } from "../prompts/analyze-gaps-prompt";
import type { AnalyzeGapsRequest, AnalyzeGapsResponse } from "../types";

/**
 * System message for gap analysis
 */
const ANALYZE_GAPS_SYSTEM_MESSAGE =
  "You are writing a personal reflection after reading your own resume and a job description. " +
  "Write naturally in first person as if you're thinking through this yourself. Use conversational language, " +
  "include personal observations, and avoid overly formal or structured phrasing. Make it sound like genuine " +
  "self-reflection, not a professional analysis.";

/**
 * Analyze gaps between a resume and job description using OpenAI
 */
export async function analyzeGaps(client: AxiosInstance, request: AnalyzeGapsRequest): Promise<AnalyzeGapsResponse> {
  const prompt = buildAnalyzeGapsPrompt(request.resume, request.jobDescription);

  try {
    const response = await client.post("/chat/completions", {
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: ANALYZE_GAPS_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const gaps = response.data.choices[0].message.content;
    return {
      gaps: gaps || "",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze gaps");
  }
}
