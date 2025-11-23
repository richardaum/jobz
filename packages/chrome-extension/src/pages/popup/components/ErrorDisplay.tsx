import { useMatchingStore } from "@/features/match-job";
import { Alert } from "@/shared/ui";

import { useResume } from "../hooks/useResume";

export function ErrorDisplay() {
  const matchError = useMatchingStore((state) => state.error);
  const { error: resumeError } = useResume();
  const error = resumeError || matchError;

  if (!error) return null;

  return <Alert variant="error">{error}</Alert>;
}
