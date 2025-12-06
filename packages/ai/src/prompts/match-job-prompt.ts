/**
 * Prompt builder for job matching analysis
 */
export function buildMatchJobPrompt(jobDescription: string, resume: string, personalPreferences?: string): string {
  const defaultPreferences =
    'I prefer jobs that explicitly accept remote work in Brazil, LATAM, or remote anywhere (just "remote" is not ' +
    "sufficient), international positions, compensation in USD, and senior+ or staff level positions.";

  const preferences = personalPreferences?.trim() || defaultPreferences;

  return `Analyze job match for candidate. Use "your"/"you" (never "my"/"I").

Job Description:
${jobDescription}

Candidate's Resume:
${resume}

Candidate's Preferences:
${preferences}

Return JSON:
{
  "matchPercentage": 0-100 (profile, skills, experience, career trajectory, preferences),
  "analysis": "2-3 sentences in second person: alignment, growth, concerns, preferences",
  "checklist": [8-10 items]
}

Checklist Rules:
- Proportion of checked items must match matchPercentage (~90% = 7-8 of 9 items)
- If not 100%, include unchecked items explaining gaps
- Each item: "category" (string), "checked" (boolean - true only if STRONG match), "description" (second person, explain concerns if checked=false)

Categories (8-10 items covering):
- Skills Match: Technical skills, languages, frameworks, tools alignment. Check only if strong match.
- Experience & Seniority: Level match (junior/mid/senior/staff), over/under-qualified, seniority preference alignment.
- Location & Work Mode: Remote work (only if "remote in Brazil/LATAM/anywhere" - not just "remote"), international positions. Include only if mentioned.
- Compensation & Benefits: Structure, benefits, USD preference. Include only if mentioned/inferred.
- Growth & Challenge: Learning opportunities, advancement, appropriate challenge level (not too easy/hard).
- Career Fit: Trajectory alignment, step forward/sideways/backward.
- Culture Fit: Company culture, values, work environment (if discernible).`;
}
