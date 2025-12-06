/**
 * Prompt builder for rewriting a specific resume section
 */
export function buildRewriteSectionPrompt(
  fullResume: string,
  jobDescription: string,
  sectionToRewrite: string,
  currentText: string,
  customPrompt: string
): string {
  return `Rewrite a specific resume section per user instructions.

Full Resume Context:
${fullResume}

Job Description:
${jobDescription}

Section to Rewrite:
${sectionToRewrite}

Current Text:
${currentText}

User Instructions:
${customPrompt}

CRITICAL:
- Rewrite ONLY the specified section
- Maintain consistency with resume style/tone
- Preserve candidate's authentic voice
- Do NOT add information not in resume
- Use ASCII only: "- " bullets, regular quotes/apostrophes, regular dashes, "..." ellipsis
- Maintain formatting and line breaks
- Preserve the original language of the section being rewritten - do not translate or change languages

Return JSON:
{
  "rewrittenText": "Rewritten section text",
  "reason": "Brief explanation of changes"
}`;
}
