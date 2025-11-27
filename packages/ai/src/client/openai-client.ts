import axios, { AxiosInstance } from "axios";

import type { MatchJobRequest, MatchJobResponse } from "../types";

export class OpenAIClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: "https://api.openai.com/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async matchJob(request: MatchJobRequest): Promise<MatchJobResponse> {
    const prompt = this.buildMatchPrompt(request.jobDescription, request.resume);

    try {
      const response = await this.client.post("/chat/completions", {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a career advisor providing personalized job matching analysis. Address the " +
              "candidate directly using 'your' and 'you' (second person), as if speaking directly " +
              "to them. Focus on whether the job is a good fit FOR the candidate, not the other " +
              "way around. Provide a percentage match (0-100) and a brief, conversational " +
              "analysis written as if you're advising the candidate personally.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.3,
      });

      const content = JSON.parse(response.data.choices[0].message.content);
      return {
        matchPercentage: content.matchPercentage || 0,
        analysis: content.analysis || "",
        checklist: content.checklist || [],
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to match job with resume");
    }
  }

  private buildMatchPrompt(jobDescription: string, resume: string): string {
    return `Analyze how well this job matches the candidate. Address them directly using "your" and "you"
(never "my" or "I").

Job Description:
${jobDescription}

Candidate's Resume:
${resume}

Candidate's Preferences:
I prefer jobs that explicitly accept remote work in Brazil, LATAM, or remote anywhere (just "remote" is
not sufficient), international positions, compensation in USD, and senior+ or staff level positions.

Return JSON with:

1. "matchPercentage": 0-100 based on profile, skills, experience, career trajectory, and preferences
   alignment.

2. "analysis": 2-3 sentences in second person covering alignment, growth opportunities, concerns, and
   preference matching.

3. "checklist": 8-10 items that MUST reflect the matchPercentage proportionally.
   - The proportion of checked items should approximately match the matchPercentage
   - If 90%, ~90% checked (e.g., 7-8 of 9 items)
   - If 80%, ~80% checked (e.g., 6-7 of 8 items)
   - If not 100%, include unchecked items explaining the gap
   
   Each item must have:
   - "category": A specific category name (see checklist categories below)
   - "checked": Boolean - true only if this aspect is a STRONG match with no significant concerns
   - "description": Brief description in second person ("your", "you"). If checked=false, explain the
     concern or misalignment.
   
Checklist Categories (include 8-10 items covering these areas):

- **Skills Match**: Evaluate how well the required technical skills, programming languages,
  frameworks, and tools align with the candidate's expertise. Check only if there's strong
  alignment.

- **Experience & Seniority Level**: Assess if the job's required experience level
  (junior/mid/senior/staff) matches the candidate's background and preferences. Consider if they're
  over-qualified, under-qualified, or at the right level. Evaluate if the job's seniority level
  (senior+, staff) matches the candidate's preference for senior+ or staff level positions.

- **Location & Work Mode**: Evaluate location and remote work preferences. Only mark checked=true for
  remote work if the job explicitly accepts "remote in Brazil", "remote in LATAM", or "remote
  anywhere". Just "remote" without location specification is NOT sufficient. Also assess if location
  requirements align with the candidate's preference for international positions. Only include if
  location/remote work is mentioned in the job description.

- **Compensation & Benefits**: Evaluate if the compensation structure, benefits, and overall package
  align with the candidate's expectations and market standards. Check if the job offers compensation
  in USD, matching the candidate's preference. Only include if compensation details are mentioned or
  can be inferred.

- **Growth & Challenge Level**: Assess learning opportunities, career advancement potential, and
  whether the role offers appropriate challenges for professional development. Evaluate if the role
  offers an appropriate challenge level - not too easy (boring) nor too hard (overwhelming).
  Consider if the candidate will be stretched appropriately.

- **Career Fit**: Evaluate how well this role fits into the candidate's career trajectory and
  long-term goals. Consider if it's a step forward, sideways, or potentially backward.

- **Culture Fit**: If discernible from the job description, evaluate company culture, work
  environment, values, and whether they align with what would suit the candidate. Include concerns
  about competitive environments, work-life balance, etc.`;
  }
}

