"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { copyToClipboard } from "@/shared/lib";
import { Grid, GridItem } from "@/shared/ui";

import { EmptyState } from "./components/empty-state";
import { OutputCard } from "./components/output-card";
import { Toolbar } from "./components/toolbar";
import { useResumeProcessing } from "./hooks/use-resume-processing";
import { useCardsVisibilityStore } from "./stores/cards-visibility-store";
import { useResumeHistoryStore, useResumeStore } from "./stores/resume-store";
import { downloadResumeAsPDF } from "./utils/download-pdf";

export function ResumeAgent() {
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const personalPreferences = useResumeStore((state) => state.personalPreferences);
  const adaptedResume = useResumeStore((state) => state.adaptedResume);
  const gaps = useResumeStore((state) => state.gaps);
  const matchResult = useResumeStore((state) => state.matchResult);
  const changes = useResumeStore((state) => state.changes);
  const updateOutputs = useResumeStore((state) => state.updateOutputs);
  const addToHistory = useResumeHistoryStore((state) => state.addToHistory);

  const processing = useResumeProcessing({
    onSuccess: (data) => {
      updateOutputs(data);
      // Save to history (separate storage)
      addToHistory({
        resume,
        jobDescription,
        adaptedResume: data.adaptedResume,
        gaps: data.gaps,
        matchResult: data.matchResult,
        changes: data.changes,
      });
    },
  });

  const handleProcess = () => {
    processing.process(resume, jobDescription, personalPreferences);
  };

  // Prioritize store's matchResult (source of truth), but show processing result while actively matching
  // This ensures that when clearing, matchResult is null and not overridden by stale processing data
  const currentMatchResult = matchResult ?? (processing.isMatching ? processing.currentMatchResult : null);

  const handleDownloadPDF = () => {
    downloadResumeAsPDF(adaptedResume, "adapted-resume.pdf");
  };

  const handleCopyGaps = async () => {
    const success = await copyToClipboard(gaps);
    if (success) {
      toast.success("Gaps analysis copied to clipboard!");
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Ensure we're on the client before rendering
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe checks - store always provides string defaults, but be defensive
  const hasResume = !!resume?.trim();
  const hasJobDescription = !!jobDescription?.trim();
  const hasInputs = hasResume && hasJobDescription;
  const hasOutputs = !!adaptedResume?.trim() || !!gaps?.trim();

  // Show empty state if we don't have inputs or outputs, but not when processing (show loading cards instead)
  const showEmptyState = (!hasInputs || !hasOutputs) && !processing.isLoading;

  const visibleCards = useCardsVisibilityStore((state) => state.visibleCards);
  const hideCard = useCardsVisibilityStore((state) => state.hideCard);

  const isAdaptedResumeVisible = visibleCards.has("adapted-resume");
  const isGapsAnalysisVisible = visibleCards.has("gaps-analysis");

  // Show nothing during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="shrink-0 mb-4">
          <Toolbar
            onProcess={handleProcess}
            isProcessing={processing.isLoading}
            matchResult={currentMatchResult}
            isMatching={processing.isMatching}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          {/* Minimal loading state - could be replaced with a spinner if desired */}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 mb-4">
        <Toolbar
          onProcess={handleProcess}
          isProcessing={processing.isLoading}
          matchResult={currentMatchResult}
          isMatching={processing.isMatching}
        />
      </div>
      {showEmptyState ? (
        <EmptyState hasResume={hasResume} hasJobDescription={hasJobDescription} />
      ) : (
        <div className="flex-1 overflow-hidden pb-4 min-h-0">
          <Grid
            cols={isAdaptedResumeVisible && isGapsAnalysisVisible ? 2 : 1}
            gap="md"
            className="h-full"
            style={{ gridTemplateRows: "1fr" }}
          >
            {/* Adapted Resume Card */}
            {isAdaptedResumeVisible && (
              <GridItem rowSpan={1}>
                <OutputCard
                  title="Adapted Resume"
                  description="Your resume tailored for this job"
                  value={adaptedResume}
                  placeholder="The adapted resume will appear here..."
                  id="adapted-resume"
                  isLoading={processing.isLoading}
                  onDownload={handleDownloadPDF}
                  showDownload={true}
                  changes={changes}
                  onHide={() => hideCard("adapted-resume")}
                />
              </GridItem>
            )}

            {/* Gaps Analysis Card */}
            {isGapsAnalysisVisible && (
              <GridItem rowSpan={1}>
                <OutputCard
                  title="Gaps Analysis"
                  description="Understanding gaps from your perspective"
                  value={gaps}
                  placeholder="Gap analysis will appear here..."
                  id="gaps"
                  isLoading={processing.isLoading}
                  onCopy={handleCopyGaps}
                  showCopy={true}
                  onHide={() => hideCard("gaps-analysis")}
                />
              </GridItem>
            )}
          </Grid>
        </div>
      )}
    </div>
  );
}
