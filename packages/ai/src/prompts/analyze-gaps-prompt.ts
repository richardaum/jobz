/**
 * Prompt builder for gap analysis
 */
export function buildAnalyzeGapsPrompt(resume: string, jobDescription: string): string {
  return `Write a personal reflection in first person about gaps between your resume and the job.

Resume:
${resume}

Job Description:
${jobDescription}

CRITICAL: Focus ONLY on technical skills, experience, qualifications, requirements. Ignore personal preferences (location, remote, compensation, seniority).

Style: 2-3 paragraphs, natural/conversational. Use qualifiers ("seems like", "probably"), personal observations, varied sentence structure, reflective tone, some uncertainty ("I'm not entirely sure if...", "it looks like...").

Cover:
1. Gaps/areas where experience doesn't fully align
2. Thoughts on bridging those gaps
3. Other observations from comparing them`;
}
