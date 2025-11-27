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
  focus?: string
): string {
  const matchJobPrompt = buildMatchJobPrompt(jobDescription, resume);
  const adaptResumePrompt = buildAdaptResumePrompt(jobDescription, resume, tone, focus);
  const analyzeGapsPrompt = buildAnalyzeGapsPrompt(resume, jobDescription);

  return `You are an expert career advisor helping a candidate with job application preparation. 
You need to perform three comprehensive analyses in a single response.

Job Description:
${jobDescription}

Candidate's Resume:
${resume}

---

**TASK 1: Job Matching Analysis**

${matchJobPrompt}

---

**TASK 2: Resume Adaptation**

${adaptResumePrompt}

---

**TASK 3: Gap Analysis**

${analyzeGapsPrompt}

---

**IMPORTANT**: You must return a single JSON object containing all three analyses with this exact structure:
{
  "matchJob": {
    "matchPercentage": <number 0-100>,
    "analysis": "<2-3 sentences in second person addressing the candidate directly>",
    "checklist": [<array of ChecklistItem objects with category, checked (boolean), and description>]
  },
  "adaptResume": {
    "adaptedResume": "<complete adapted resume as ready-to-use document, well-structured and professional>",
    "changes": [<array of objects with section (string) and description (string)>],
    "keywords": [<array of keywords from job description that were incorporated>]
  },
  "analyzeGaps": {
    "gaps": "<2-3 paragraphs in first person (I, my) explaining gaps and how to address them>"
  }
}

Ensure all three analyses are comprehensive, accurate, and follow their respective instructions and tone requirements.`;
}
