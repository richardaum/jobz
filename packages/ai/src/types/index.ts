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

