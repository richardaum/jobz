import { useState } from "react";

import { useMatchingStore } from "@/shared/stores";
import { Button } from "@/shared/ui";

import { useJobMatching } from "../hooks/useJobMatching";
import { useResume } from "../hooks/useResume";

export function MatchButton() {
  const [loading, setLoading] = useState(false);
  const { resume } = useResume();
  const { setMatchResult, setError, setDebugInfo } = useMatchingStore();

  const { matchJob } = useJobMatching({
    resume,
    setLoading,
    setMatchResult,
    setError,
    setDebugInfo,
  });

  return (
    <div className="w-full">
      <Button onClick={matchJob} disabled={loading || !resume}>
        {loading ? "Matching..." : "Match Current Job"}
      </Button>
    </div>
  );
}
