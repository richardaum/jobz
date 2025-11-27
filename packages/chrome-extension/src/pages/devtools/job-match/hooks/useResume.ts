import { useEffect, useState } from "react";

import { loadResumeFromAssets, type Resume } from "@/entities/resume";

export function useResume() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = () => {
    try {
      const resumeFromAssets = loadResumeFromAssets();
      setResume(resumeFromAssets);
      setError(null);
    } catch (err) {
      setError(`Failed to load resume: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return {
    resume,
    error,
    loadResume,
  };
}
