/**
 * Prompt builder for gap analysis
 */
export function buildAnalyzeGapsPrompt(resume: string, jobDescription: string): string {
  return `Analyze gaps between my resume and the job description. Write in first person, be direct and action-oriented.

Resume:
${resume}

Job Description:
${jobDescription}

Return 2-3 concise paragraphs covering:
1. Key gaps between my experience and requirements
2. How I can address them (skills to learn, experiences to gain)
3. Relevant observations`;
}
