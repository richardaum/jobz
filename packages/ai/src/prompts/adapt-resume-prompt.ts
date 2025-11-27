/**
 * Prompt builder for resume adaptation to job postings
 */
export function buildAdaptResumePrompt(
  jobDescription: string,
  resume: string,
  tone: "professional" | "confident" | "concise" = "professional",
  focus?: string
): string {
  const toneInstructions = {
    professional:
      "Maintain a professional, objective tone throughout. Use action verbs and quantify achievements where possible.",
    confident:
      "Use a confident, assertive tone that highlights strengths and achievements. Emphasize impact and results.",
    concise:
      "Keep descriptions concise and impactful. Focus on key achievements and relevant skills without unnecessary details.",
  };

  const focusSection = focus
    ? `\n\nAdditional Focus: ${focus}\nPlease pay special attention to this aspect when adapting the resume.`
    : "";

  return `Adapt the following resume to match the job description provided. The goal is to create a tailored resume that highlights the candidate's most relevant experiences, skills, and achievements for this specific position.

Job Description:
${jobDescription}

Current Resume:
${resume}

Instructions:

1. **Keyword Integration**: Identify and naturally incorporate key terms, skills, and technologies mentioned in the job description into the resume. Ensure keywords appear in relevant sections (summary, skills, experience descriptions).

2. **Experience Alignment**: 
   - Reorder and emphasize experiences that are most relevant to the job requirements
   - Rewrite job descriptions to highlight responsibilities and achievements that align with the job posting
   - Use the STAR method (Situation, Task, Action, Result) framework when describing experiences, but keep it natural and not forced
   - Quantify achievements with metrics, numbers, and percentages where possible

3. **Skills Section**: 
   - Prioritize skills that match the job requirements
   - Add relevant skills from the job description if the candidate has experience with them
   - Group skills logically (technical, soft skills, tools, etc.)

4. **Professional Summary/Objective**: 
   - Rewrite to align with the job's focus and requirements
   - Highlight the most relevant qualifications and career goals for this position

5. **Tone and Style**: ${toneInstructions[tone]}

6. **Maintain Authenticity**: 
   - Only include information that can be reasonably inferred from the original resume
   - Do not fabricate experiences, skills, or achievements
   - Keep all dates, company names, and factual information accurate

7. **Format**: 
   - Maintain a clean, professional format
   - Use consistent formatting throughout
   - Ensure the resume is ATS-friendly (Applicant Tracking System compatible)

${focusSection}

Return a JSON object with the following structure:
{
  "adaptedResume": "The complete adapted resume as a ready-to-use document, well-structured and professional",
  "changes": [
    {
      "section": "Section name (e.g., 'Professional Summary', 'Work Experience - Company X', 'Skills')",
      "description": "Brief description of what was changed and why"
    }
  ],
  "keywords": ["keyword1", "keyword2", ...] // List of important keywords from the job description that were incorporated
}

Make sure the adapted resume is complete, well-structured, professional, and optimized for the specific job posting.`;
}
