"use client";

import { IconHistory, IconCode, IconFileText, IconBriefcase, IconEye, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { Button, Divider } from "@/shared/ui";
import { useResumeStore } from "../stores/resume-store";
import { useCardsVisibilityStore } from "../stores/cards-visibility-store";

import { HistoryModal } from "./history-modal";
import { PromptModal } from "./prompt-modal";
import { ResumePopover } from "./resume-popover";
import { JobDescriptionPopover } from "./job-description-popover";
import { JobMatchButton } from "./job-match-button";
import { ChecklistButton } from "./checklist-button";

interface ToolbarProps {
  onProcess: () => void;
  isProcessing: boolean;
  matchResult: any;
  isMatching: boolean;
}

export function Toolbar({ onProcess, isProcessing, matchResult, isMatching }: ToolbarProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const setResume = useResumeStore((state) => state.setResume);
  const setJobDescription = useResumeStore((state) => state.setJobDescription);
  const clearAll = useResumeStore((state) => state.clearAll);

  const visibleCards = useCardsVisibilityStore((state) => state.visibleCards);
  const showCard = useCardsVisibilityStore((state) => state.showCard);

  const isAdaptedResumeHidden = !visibleCards.has("adapted-resume");
  const isGapsAnalysisHidden = !visibleCards.has("gaps-analysis");

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all content? This action cannot be undone.")) {
      clearAll();
      useCardsVisibilityStore.getState().showAllCards();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-2">
        {/* Input Group */}
        <ResumePopover value={resume} onChange={setResume}>
          <Button variant="outline" size="sm" type="button">
            <IconFileText className="h-4 w-4 mr-2" />
            {resume.trim() ? "Edit Resume" : "Add Resume"}
          </Button>
        </ResumePopover>
        <JobDescriptionPopover
          value={jobDescription}
          onChange={setJobDescription}
          matchResult={matchResult}
          isMatching={isMatching}
          hasResume={!!resume.trim()}
        >
          <Button variant="outline" size="sm" type="button">
            <IconBriefcase className="h-4 w-4 mr-2" />
            {jobDescription.trim() ? "Edit Job Description" : "Add Job Description"}
          </Button>
        </JobDescriptionPopover>

        <Divider className="mx-2" />

        {/* Info Group - Hoverable buttons */}
        <JobMatchButton
          matchResult={matchResult}
          isMatching={isMatching}
          hasResume={!!resume.trim()}
          hasJobDescription={!!jobDescription.trim()}
        />
        <ChecklistButton checklist={matchResult?.checklist} />

        <Divider className="mx-2" />

        {/* Actions Group */}
        {isAdaptedResumeHidden && (
          <Button variant="outline" size="sm" onClick={() => showCard("adapted-resume")} type="button">
            <IconEye className="h-4 w-4 mr-2" />
            Show Adapted Resume
          </Button>
        )}
        {isGapsAnalysisHidden && (
          <Button variant="outline" size="sm" onClick={() => showCard("gaps-analysis")} type="button">
            <IconEye className="h-4 w-4 mr-2" />
            Show Gaps Analysis
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPromptOpen(true)}
          type="button"
          disabled={!resume.trim() || !jobDescription.trim()}
        >
          <IconCode className="h-4 w-4 mr-2" />
          Show Prompt
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)} type="button">
          <IconHistory className="h-4 w-4 mr-2" />
          History
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          type="button"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <IconTrash className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onProcess}
          disabled={isProcessing || !resume.trim() || !jobDescription.trim()}
          type="button"
        >
          {isProcessing ? "Processing..." : "Start 🚀"}
        </Button>
      </div>
      <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
      <PromptModal open={isPromptOpen} onOpenChange={setIsPromptOpen} resume={resume} jobDescription={jobDescription} />
    </div>
  );
}
