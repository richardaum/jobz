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
   - Only include skills that are explicitly mentioned in the original resume
   - Do not add new skills, even if they appear in the job description
   - Group skills logically (technical, soft skills, tools, etc.)

4. **Professional Summary/Objective**: 
   - Rewrite to align with the job's focus and requirements
   - Highlight the most relevant qualifications and career goals for this position

5. **Tone and Style**: ${toneInstructions[tone]}

6. **Preserve Original Writing Style**: 
   - Maintain the candidate's original writing style, voice, and phrasing patterns
   - When rephrasing, keep the same level of detail and specificity as the original
   - Preserve the candidate's natural way of describing their experiences
   - Only adjust wording to incorporate keywords, not to change the fundamental style

7. **Maintain Authenticity - Strict Rules**: 
   - ONLY use information that is explicitly stated in the original resume
   - Do NOT add, infer, or fabricate any experiences, skills, achievements, or qualifications
   - Do NOT add skills from the job description that aren't in the original resume
   - Do NOT add responsibilities or achievements that weren't explicitly mentioned
   - Do NOT expand on experiences beyond what was originally written
   - Keep all dates, company names, and factual information exactly as they appear
   - Your role is to reorganize, rephrase, and emphasize existing content, NOT to add new content

8. **Format**: 
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
