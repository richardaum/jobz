export type JobSource = "linkedin" | "indeed" | "glassdoor" | "generic" | "dynamic";

export interface JobDescription {
  title: string;
  company: string;
  description: string;
  source: JobSource;
  url: string;
  extractedAt: string;
  extractionMetadata?: {
    usedSelector: string;
    isCollection?: boolean;
    failedSelectors?: string[];
  };
}
