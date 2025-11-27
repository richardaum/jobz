import type { AxiosInstance } from "axios";

import { DEFAULT_OPENAI_MODEL } from "../config";
import { buildAdaptResumePrompt } from "../prompts/adapt-resume-prompt";
import type { AdaptResumeRequest, AdaptResumeResponse } from "../types";

/**
 * System message for resume adaptation
 */
const ADAPT_RESUME_SYSTEM_MESSAGE =
  "You are an expert resume writer and career advisor specializing in tailoring resumes to specific job postings. " +
  "Your goal is to adapt resumes to highlight the candidate's most relevant qualifications, experiences, and skills " +
  "for each position while maintaining authenticity and professionalism. You excel at identifying keywords, aligning " +
  "experiences with job requirements, and presenting candidates in the best light for each opportunity. " +
  "CRITICAL: You must preserve the candidate's original writing style and NEVER add any information, skills, or " +
  "experiences that were not explicitly stated in the original resume. Only reorganize, rephrase, and emphasize existing content.";

/**
 * Adapt a resume to match a specific job description using OpenAI
 */
export async function adaptResume(client: AxiosInstance, request: AdaptResumeRequest): Promise<AdaptResumeResponse> {
  const prompt = buildAdaptResumePrompt(
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
          content: ADAPT_RESUME_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0.4, // Slightly higher for more creative adaptation while maintaining accuracy
    });

    const content = JSON.parse(response.data.choices[0].message.content);
    return {
      adaptedResume: content.adaptedResume || "",
      changes: content.changes || [],
      keywords: content.keywords || [],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to adapt resume to job description");
  }
}
