"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { copyToClipboard } from "@/shared/lib";
import { Grid, GridItem } from "@/shared/ui";

import { EmptyState } from "./components/empty-state";
import { OutputCard } from "./components/output-card";
import { ResumeChatbot } from "./components/resume-chatbot";
import { Toolbar } from "./components/toolbar";
import { useResumeChatbot } from "./hooks/use-resume-chatbot";
import { useResumeProcessing } from "./hooks/use-resume-processing";
import { useRewriteSection } from "./hooks/use-rewrite-section";
import { useCardsVisibilityStore } from "./stores/cards-visibility-store";
import { useResumeHistoryStore, useResumeStore } from "./stores/resume-store";
import { downloadResumeAsPDF } from "./utils/download-pdf";

export function ResumeAgent() {
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const personalPreferences = useResumeStore((state) => state.personalPreferences);
  const adaptedResume = useResumeStore((state) => state.adaptedResume);
  const sections = useResumeStore((state) => state.sections);
  const gaps = useResumeStore((state) => state.gaps);
  const matchResult = useResumeStore((state) => state.matchResult);
  const changes = useResumeStore((state) => state.changes);
  const rawResponseJson = useResumeStore((state) => state.rawResponseJson);
  const updateOutputs = useResumeStore((state) => state.updateOutputs);
  const clearResults = useResumeStore((state) => state.clearResults);
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

  const rewriteMutation = useRewriteSection();

  const handleProcess = () => {
    clearResults();
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

  const handleCopyAdaptedResume = async () => {
    let textToCopy = adaptedResume;

    // If we have sections, format with structure
    if (sections && sections.length > 0) {
      const lines: string[] = [];

      sections.forEach((section) => {
        const subsections = section.subsections || [];
        const hasSubsections = subsections.length > 0;

        // Add section title
        if (section.name) {
          lines.push(section.name);
          lines.push(""); // Empty line after section title
        }

        if (hasSubsections) {
          subsections.forEach((subsection, index) => {
            // Only add subsection title if there are multiple subsections
            if (subsections.length > 1 && subsection.name) {
              lines.push(subsection.name);
            }
            // Add subsection content
            if (subsection.content) {
              lines.push(subsection.content);
            }
            // Add empty line between subsections (except for the last one)
            if (index < subsections.length - 1) {
              lines.push("");
            }
          });
        } else {
          // Handle old structure with content directly on section
          const sectionWithContent = section as typeof section & { content?: string };
          if (sectionWithContent.content) {
            lines.push(sectionWithContent.content);
          }
        }

        // Add empty line between sections
        lines.push("");
      });

      textToCopy = lines.join("\n").trim();
    }

    const success = await copyToClipboard(textToCopy);
    if (success) {
      toast.success("Adapted resume copied to clipboard!");
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

  // Chatbot integration
  const chatbot = useResumeChatbot();

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
            onToggleChatbot={chatbot.toggle}
            hasChatbotData={chatbot.hasData}
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
          onToggleChatbot={chatbot.toggle}
          hasChatbotData={chatbot.hasData}
        />
      </div>
      {showEmptyState ? (
        <EmptyState hasResume={hasResume} hasJobDescription={hasJobDescription} />
      ) : (
        <div className="flex-1 overflow-hidden pb-4 min-h-0">
          <Grid
            cols={isAdaptedResumeVisible && isGapsAnalysisVisible ? 2 : 1}
            gap="md"
            className="h-full max-h-full overflow-hidden grid-rows-[1fr]"
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
                  isLoading={processing.isLoading || rewriteMutation.isPending}
                  onDownload={handleDownloadPDF}
                  showDownload={true}
                  changes={changes}
                  sections={sections}
                  onHide={() => hideCard("adapted-resume")}
                  useStructuredView={true}
                  rawResponseJson={rawResponseJson}
                  onCopy={handleCopyAdaptedResume}
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
      <ResumeChatbot
        isOpen={chatbot.isOpen}
        onToggle={chatbot.toggle}
        messages={chatbot.messages}
        onSendMessage={chatbot.sendMessage}
        isLoading={chatbot.isLoading}
      />
    </div>
  );
}
