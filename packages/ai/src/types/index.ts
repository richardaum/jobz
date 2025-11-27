export interface MatchJobRequest {
  jobDescription: string;
  resume: string;
}

export interface ChecklistItem {
  category: string;
  checked: boolean;
  description: string;
}

export interface MatchJobResponse {
  matchPercentage: number;
  analysis: string;
  checklist: ChecklistItem[];
}

export interface AdaptResumeRequest {
  jobDescription: string;
  resume: string;
  tone?: "professional" | "confident" | "concise";
  focus?: string; // Optional focus area or specific instructions
}

export interface AdaptResumeResponse {
  adaptedResume: string;
  changes: {
    section: string;
    description: string;
  }[];
  keywords: string[]; // Keywords from job description that were incorporated
}

export interface AnalyzeGapsRequest {
  resume: string;
  jobDescription: string;
}

export interface AnalyzeGapsResponse {
  gaps: string;
}
