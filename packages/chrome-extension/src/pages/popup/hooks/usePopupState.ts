import { useState } from "react";

import type { MatchResult } from "@/features/match-job";
import type { DebugInfo } from "@/widgets/debug-panel";

export function usePopupState() {
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ steps: [] });
  const [debugOpen, setDebugOpen] = useState(false);

  return {
    loading,
    matchResult,
    error,
    debugInfo,
    debugOpen,
    setLoading,
    setMatchResult,
    setError,
    setDebugInfo,
    setDebugOpen,
  };
}
