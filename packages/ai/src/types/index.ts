export interface MatchJobRequest {
  jobDescription: string;
  resume: string;
  personalPreferences?: string;
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

export interface ResumeSubsection {
  name: string;
  content: string;
}

export interface ResumeSection {
  name: string;
  subsections: ResumeSubsection[];
}

export interface AdaptResumeResponse {
  adaptedResume: string;
  sections?: ResumeSection[]; // Structured sections of the resume
  changes: {
    section: string;
    description: string;
    originalText?: string;
    newText?: string;
    reason?: string;
    position?: string;
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

export interface ProcessResumeRequest {
  jobDescription: string;
  resume: string;
  tone?: "professional" | "confident" | "concise";
  focus?: string;
  personalPreferences?: string;
}

export interface ProcessResumeResponse {
  matchJob: MatchJobResponse;
  adaptResume: AdaptResumeResponse;
  analyzeGaps: AnalyzeGapsResponse;
}

export interface RewriteSectionRequest {
  fullResume: string;
  jobDescription: string;
  sectionToRewrite: string;
  currentText: string;
  customPrompt: string;
}

export interface RewriteSectionResponse {
  rewrittenText: string;
  reason: string;
}
