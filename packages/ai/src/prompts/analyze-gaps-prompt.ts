/**
 * Prompt builder for gap analysis
 */
export function buildAnalyzeGapsPrompt(resume: string, jobDescription: string): string {
  return `After carefully reviewing my resume and the job description, write a personal reflection in first person about the gaps I noticed.

Resume:
${resume}

Job Description:
${jobDescription}

Write 2-3 paragraphs as if you're reflecting on what you read, using:
- Natural, conversational language with occasional qualifiers ("seems like", "probably", "might need")
- Personal observations and insights that show you actually read both documents
- Slight variations in sentence structure (not overly structured or formulaic)
- A reflective, thoughtful tone as if thinking through this yourself
- Some uncertainty or nuance where appropriate ("I'm not entirely sure if...", "it looks like...")

Cover:
1. What stood out to you as gaps or areas where your experience doesn't fully align
2. Your thoughts on how to bridge those gaps
3. Any other observations or considerations that came to mind while comparing them`;
}
