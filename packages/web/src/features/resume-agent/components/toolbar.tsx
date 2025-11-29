"use client";

import {
  IconBriefcase,
  IconChevronDown,
  IconCode,
  IconEye,
  IconFileText,
  IconHistory,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

import { JobDescriptionPopover } from "@/entities/job";
import { ChecklistButton, JobMatchButton, type MatchResult } from "@/entities/match-result";
import { ResumePopover } from "@/entities/resume";
import { Button, Divider, Menu, MenuAnchor, MenuContent, MenuItem } from "@/shared/ui";

import { useCardsVisibilityStore } from "../stores/cards-visibility-store";
import { useResumeStore } from "../stores/resume-store";
import { HistoryModal } from "./history-modal";
import { PromptModal } from "./prompt-modal";

interface ToolbarProps {
  onProcess: () => void;
  isProcessing: boolean;
  matchResult: MatchResult | null;
  isMatching: boolean;
}

export function Toolbar({ onProcess, isProcessing, matchResult, isMatching }: ToolbarProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isClearMenuOpen, setIsClearMenuOpen] = useState(false);
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const setResume = useResumeStore((state) => state.setResume);
  const setJobDescription = useResumeStore((state) => state.setJobDescription);
  const clearResults = useResumeStore((state) => state.clearResults);
  const clearAll = useResumeStore((state) => state.clearAll);

  const visibleCards = useCardsVisibilityStore((state) => state.visibleCards);
  const showCard = useCardsVisibilityStore((state) => state.showCard);

  const isAdaptedResumeHidden = !visibleCards.has("adapted-resume");
  const isGapsAnalysisHidden = !visibleCards.has("gaps-analysis");

  const handleClearResults = () => {
    if (
      confirm(
        "Are you sure you want to clear all results? This will remove the adapted resume, gaps analysis, and match results, but keep your resume and job description."
      )
    ) {
      clearResults();
      setIsClearMenuOpen(false);
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear all content? This will remove everything including your resume and job description. This action cannot be undone."
      )
    ) {
      clearAll();
      useCardsVisibilityStore.getState().showAllCards();
      setIsClearMenuOpen(false);
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
        <Menu open={isClearMenuOpen} onOpenChange={setIsClearMenuOpen}>
          <MenuAnchor asChild>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsClearMenuOpen(!isClearMenuOpen)}
              className="text-red-700 hover:text-red-900 hover:bg-red-50"
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Clear
              <IconChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </MenuAnchor>
          <MenuContent align="end" className="w-64">
            <MenuItem onClick={handleClearResults} className="flex flex-col items-start px-3 py-2.5 cursor-pointer">
              <div className="font-medium text-sm">Clear Results</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Remove adapted resume, gaps analysis, and match results
              </div>
            </MenuItem>
            <MenuItem
              onClick={handleClearAll}
              className="flex flex-col items-start px-3 py-2.5 cursor-pointer text-red-700 focus:text-red-900 focus:bg-red-50"
            >
              <div className="font-medium text-sm">Clear All</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Remove everything including resume and job description
              </div>
            </MenuItem>
          </MenuContent>
        </Menu>
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
