"use client";

import { useLocalStorage } from "@/shared/hooks/use-local-storage";

const STORAGE_KEYS = {
  resume: "resumeAgent:resume",
  jobDescription: "resumeAgent:jobDescription",
} as const;

export function useResumeInputs() {
  const [resume, setResume] = useLocalStorage(STORAGE_KEYS.resume, "");
  const [jobDescription, setJobDescription] = useLocalStorage(STORAGE_KEYS.jobDescription, "");

  return {
    resume,
    setResume,
    jobDescription,
    setJobDescription,
    hasValidInputs: resume.trim().length > 0 && jobDescription.trim().length > 0,
  };
}
