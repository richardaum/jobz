/**
 * Prompt builder for gap analysis
 */
export function buildAnalyzeGapsPrompt(resume: string, jobDescription: string): string {
  return `Analyze the gaps between the candidate's resume and the job description. 
Write from the candidate's perspective using "I" and "my" (first person), explaining what gaps exist 
and how they might address them. Be constructive and helpful.

Candidate's Resume:
${resume}

Job Description:
${jobDescription}

Return a couple of paragraphs (2-3 paragraphs) explaining:
1. What gaps exist between the resume and job requirements
2. How the candidate might address these gaps (skills to learn, experiences to gain, etc.)
3. Any other relevant observations from the candidate's perspective

Write in first person as if the candidate is reflecting on their own resume.`;
}
