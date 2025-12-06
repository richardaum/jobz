import { buildAdaptResumePrompt } from "./adapt-resume-prompt";
import { buildAnalyzeGapsPrompt } from "./analyze-gaps-prompt";
import { buildMatchJobPrompt } from "./match-job-prompt";

/**
 * Prompt builder for consolidated resume processing
 * Combines match job, adapt resume, and analyze gaps in a single request
 */
export function buildProcessResumePrompt(
  jobDescription: string,
  resume: string,
  tone: "professional" | "confident" | "concise" = "professional",
  focus?: string,
  personalPreferences?: string
): string {
  const matchJobPrompt = buildMatchJobPrompt(jobDescription, resume, personalPreferences);
  const adaptResumePrompt = buildAdaptResumePrompt(jobDescription, resume, tone, focus);
  const analyzeGapsPrompt = buildAnalyzeGapsPrompt(resume, jobDescription);

  return `Perform three analyses in a single response.

Job Description:
${jobDescription}

Candidate's Resume:
${resume}

---

TASK 1: Job Matching Analysis
${matchJobPrompt}

---

TASK 2: Resume Adaptation
${adaptResumePrompt}

IMPORTANT: If the resume contains sections in different languages, preserve each section's original language throughout the adaptation process.

---

TASK 3: Gap Analysis
${analyzeGapsPrompt}

---

Return single JSON:
{
  "matchJob": {
    "matchPercentage": <0-100>,
    "analysis": "<2-3 sentences, second person>",
    "checklist": [<ChecklistItem: category, checked, description>]
  },
  "adaptResume": {
    "adaptedResume": "<complete adapted resume>",
    "sections": [
      {
        "name": "<Section name (e.g., 'Summary', 'Experience', 'Skills')>",
        "subsections": [
          {
            "name": "<Subsection name (e.g., 'Company Name', 'Job Title', 'Skill Category')>",
            "content": "<Content of this subsection>"
          }
        ]
      }
    ],
    "changes": [<{section, description, originalText?, newText?, reason?, position?}>],
    "keywords": [<string>]
  },
  "analyzeGaps": {
    "gaps": "<2-3 paragraphs, first person>"
  }
}

IMPORTANT for adaptResume.sections:
- Array of all sections in the resume. Each section must have a "name" and "subsections" array.
- subsections: Break down each section into granular subsections. For example:
  * "Professional Experience" section → subsections for each job/position
  * "Skills" section → subsections for each skill category or group
  * "Education" section → subsections for each degree/certification
  * "Summary" section → can have a single subsection or break into paragraphs
- Each subsection must have a "name" (identifying the subsection) and "content" (the text content).
- The combined content of all subsections in a section must exactly match the corresponding section in "adaptedResume".
- Maintain the same order of sections and subsections as they appear in adaptedResume.
- Section names should match common resume section names (Summary, Professional Experience, Work Experience, Skills, Education, etc.).
- Subsection names should be descriptive but concise (e.g., "Software Engineer at Company X", "Technical Skills", "Bachelor's Degree").`;
}
