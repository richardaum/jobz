import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useMatchingStore } from "@/features/match-job";
import { Button } from "@/shared/ui";

import { useJobMatching } from "../hooks/useJobMatching";
import { useResume } from "../hooks/useResume";

export function MatchButton() {
  const [loading, setLoading] = useState(false);
  const { resume } = useResume();
  const { setMatchResult, setError } = useMatchingStore(
    useShallow((state) => ({
      setMatchResult: state.setMatchResult,
      setError: state.setError,
    }))
  );

  const { matchJob } = useJobMatching({
    resume,
    setLoading,
    setMatchResult,
    setError,
  });

  return (
    <div className="w-full">
      <Button onClick={matchJob} disabled={loading || !resume}>
        {loading ? "Matching..." : "Match Current Job"}
      </Button>
    </div>
  );
}
