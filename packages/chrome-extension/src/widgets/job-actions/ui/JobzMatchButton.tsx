import { useEffect, useState } from "react";

import { loadResumeFromAssets, loadResumeFromStorage } from "@/entities/resume";
import { JobExtractorFactory } from "@/features/extract-job";
import { matchJobWithResume } from "@/features/match-job";
import { getCachedMatch } from "@/features/match-job";
import { LinkedInButton, LinkedInTooltip } from "@/shared/ui";

interface MatchState {
  status: "idle" | "loading" | "success" | "error";
  result?: {
    matchPercentage: number;
    analysis: string;
    isCached: boolean;
  };
  error?: string;
}

export function JobzMatchButton() {
  const [matchState, setMatchState] = useState<MatchState>({ status: "idle" });
  const [isOpen, setIsOpen] = useState(false);

  const handleMatch = async () => {
    setMatchState({ status: "loading" });
    setIsOpen(false);

    try {
      // Get API key from storage
      const storage = await chrome.storage.sync.get("openaiApiKey");
      const apiKey = storage.openaiApiKey;

      if (!apiKey) {
        setMatchState({
          status: "error",
          error: "API key not configured. Please set it in the extension popup.",
        });
        return;
      }

      // Extract job
      const factory = new JobExtractorFactory();
      const extractor = factory.getExtractor(window.location.href);
      const job = await extractor.extract();

      // Load resume - try storage first, then fallback to assets
      let resume = await loadResumeFromStorage();
      if (!resume) {
        try {
          resume = loadResumeFromAssets();
        } catch {
          setMatchState({
            status: "error",
            error: "Resume not found. Please add your resume in the extension popup.",
          });
          return;
        }
      }

      // Check cache first
      const cached = await getCachedMatch(job);
      if (cached) {
        setMatchState({
          status: "success",
          result: {
            matchPercentage: cached.matchPercentage,
            analysis: cached.analysis,
            isCached: true,
          },
        });
        return;
      }

      // Make API call
      const result = await matchJobWithResume(job, resume, apiKey, false);

      setMatchState({
        status: "success",
        result: {
          matchPercentage: result.matchPercentage,
          analysis: result.analysis,
          isCached: false,
        },
      });
    } catch (error) {
      setMatchState({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  // Check for existing match on mount
  useEffect(() => {
    const checkExistingMatch = async () => {
      try {
        const factory = new JobExtractorFactory();
        const extractor = factory.getExtractor(window.location.href);
        const job = await extractor.extract();
        const cached = await getCachedMatch(job);
        if (cached) {
          setMatchState({
            status: "success",
            result: {
              matchPercentage: cached.matchPercentage,
              analysis: cached.analysis,
              isCached: true,
            },
          });
          // Auto-open tooltip for cached match
          setIsOpen(true);
          // Auto-close after 5 seconds
          setTimeout(() => {
            setIsOpen(false);
          }, 5000);
        }
      } catch (error) {
        // Ignore errors on initial check
      }
    };

    checkExistingMatch();
  }, []);

  const getTooltipContent = () => {
    if (matchState.status === "loading") {
      return "Matching job with your resume...";
    }

    if (matchState.status === "error") {
      return matchState.error || "Error occurred. Click to try again.";
    }

    if (matchState.status === "success" && matchState.result) {
      return (
        <div style={{ maxWidth: "320px" }}>
          <div
            style={{
              fontWeight: 600,
              marginBottom: "8px",
              fontSize: "14px",
              color: "rgba(0, 0, 0, 0.9)",
            }}
          >
            Match: {matchState.result.matchPercentage}%
            {matchState.result.isCached && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  marginLeft: "6px",
                  color: "rgba(0, 0, 0, 0.6)",
                }}
              >
                (cached)
              </span>
            )}
          </div>
          <div style={{ fontSize: "13px", lineHeight: "1.42857", color: "rgba(0, 0, 0, 0.75)" }}>
            {matchState.result.analysis}
          </div>
        </div>
      );
    }

    return "Click to match this job with your resume";
  };

  // Auto-show tooltip when there's a match or error
  useEffect(() => {
    if (matchState.status === "success" || matchState.status === "error") {
      setIsOpen(true);
    }
  }, [matchState.status]);

  return (
    <LinkedInTooltip content={getTooltipContent()} open={isOpen} onOpenChange={setIsOpen}>
      <LinkedInButton
        data-jobz-match-button-trigger="true"
        data-jobz-match-state={matchState.status}
        onClick={handleMatch}
        disabled={matchState.status === "loading"}
      >
        {matchState.status === "loading" ? "Matching..." : "Jobz Match"}
      </LinkedInButton>
    </LinkedInTooltip>
  );
}
