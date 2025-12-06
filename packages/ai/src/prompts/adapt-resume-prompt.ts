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
    professional: "Professional, objective. Action verbs + quantified achievements.",
    confident: "Confident, assertive. Emphasize impact and results.",
    concise: "Concise, impactful. Key achievements only.",
  };

  const focusNote = focus ? `\n\nFocus: ${focus}` : "";

  return `Adapt resume to match job description.

Job Description:
${jobDescription}

Current Resume:
${resume}

CRITICAL:
- Preserve EXACT structure, section order, formatting, spacing, section names
- ONLY modify content within sections, never structure
- Use ONLY information from original resume (no additions/inferences)
- Keep dates, companies, facts unchanged
- If resume has sections in different languages, preserve each section's original language - do not translate or mix languages

Content Adaptation:
- Keywords: Integrate key terms/technologies from job description into summary, skills, experience
- Experience: Keep original order. Align descriptions with job posting. Use STAR naturally. Quantify achievements
- Skills: Maintain original structure/grouping. Prioritize matching skills. No new skills
- Summary: Align with job focus. Keep original length/style
- Tone: ${toneInstructions[tone]}

Format:
- Preserve formatting, line breaks, spacing, indentation
- ASCII only: "- " bullets, regular quotes/apostrophes, regular dashes, "..." ellipsis
- ATS-compatible

${focusNote}

Return JSON:
{
  "adaptedResume": "Complete adapted resume",
  "sections": [
    {
      "name": "Section name (e.g., 'Summary', 'Experience', 'Skills')",
      "subsections": [
        {
          "name": "Subsection name (e.g., 'Company Name', 'Job Title', 'Skill Category')",
          "content": "Content of this subsection"
        }
      ]
    }
  ],
  "changes": [{
    "section": "Section name",
    "description": "What changed and why",
    "originalText": "Exact original text with context",
    "newText": "Exact new text (must match adaptedResume)",
    "reason": "Why this improves alignment",
    "position": "Location context"
  }],
  "keywords": ["keyword1", "keyword2"]
}

IMPORTANT:
- sections: Array of all sections in the resume. Each section must have a "name" and "subsections" array.
- subsections: Break down each section into granular subsections. For example:
  * "Professional Experience" section → subsections for each job/position
  * "Skills" section → subsections for each skill category or group
  * "Education" section → subsections for each degree/certification
  * "Summary" section → can have a single subsection or break into paragraphs
- Each subsection must have a "name" (identifying the subsection) and "content" (the text content).
- The combined content of all subsections in a section must exactly match the corresponding section in "adaptedResume".
- Maintain the same order of sections and subsections as they appear in adaptedResume.
- Section names should match common resume section names (Summary, Professional Experience, Work Experience, Skills, Education, etc.).
- Subsection names should be descriptive but concise (e.g., "Software Engineer at Company X", "Technical Skills", "Bachelor's Degree").

Changes: originalText/newText must exactly match resume content. Include context to identify location.`;
}
