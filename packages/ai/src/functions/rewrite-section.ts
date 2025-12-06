import type { AxiosInstance } from "axios";

import { DEFAULT_OPENAI_MODEL } from "../config";
import { buildRewriteSectionPrompt } from "../prompts/rewrite-section-prompt";
import type { RewriteSectionRequest, RewriteSectionResponse } from "../types";

/**
 * System message for section rewriting
 */
const REWRITE_SECTION_SYSTEM_MESSAGE =
  "You are an expert resume writer specializing in refining specific sections of resumes. " +
  "Your goal is to rewrite a specific section of a resume according to user instructions while " +
  "maintaining consistency with the rest of the document and preserving the candidate's authentic voice. " +
  "You must preserve the candidate's original writing style and NEVER add any information, skills, or " +
  "experiences that were not explicitly stated in the original resume or the provided context.";

/**
 * Rewrite a specific section of a resume based on user instructions
 */
export async function rewriteSection(
  client: AxiosInstance,
  request: RewriteSectionRequest
): Promise<RewriteSectionResponse> {
  const prompt = buildRewriteSectionPrompt(
    request.fullResume,
    request.jobDescription,
    request.sectionToRewrite,
    request.currentText,
    request.customPrompt
  );

  try {
    const response = await client.post("/chat/completions", {
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: REWRITE_SECTION_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0.4,
    });

    const content = JSON.parse(response.data.choices[0].message.content);
    return {
      rewrittenText: content.rewrittenText || "",
      reason: content.reason || "",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to rewrite section");
  }
}
