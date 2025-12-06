"use client";

import {
  IconBriefcase,
  IconChevronDown,
  IconCode,
  IconEye,
  IconFileText,
  IconHistory,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

import { JobDescriptionPopover, PersonalPreferencesPopover } from "@/entities/job";
import { ChecklistButton, JobMatchButton, type MatchResult } from "@/entities/match-result";
import { ResumePopover } from "@/entities/resume";
import { Button, Divider, Menu, MenuAnchor, MenuContent, MenuItem, Tooltip } from "@/shared/ui";

import { useCardsVisibilityStore } from "../stores/cards-visibility-store";
import { useResumeStore } from "../stores/resume-store";
import { HistoryModal } from "./history-modal";
import { PromptModal } from "./prompt-modal";

interface ToolbarProps {
  onProcess: () => void;
  isProcessing: boolean;
  matchResult: MatchResult | null;
  isMatching: boolean;
  onToggleChatbot?: () => void;
  hasChatbotData?: boolean;
}

export function Toolbar({
  onProcess,
  isProcessing,
  matchResult,
  isMatching,
  onToggleChatbot,
  hasChatbotData,
}: ToolbarProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isClearMenuOpen, setIsClearMenuOpen] = useState(false);
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const personalPreferences = useResumeStore((state) => state.personalPreferences);
  const setResume = useResumeStore((state) => state.setResume);
  const setJobDescription = useResumeStore((state) => state.setJobDescription);
  const setPersonalPreferences = useResumeStore((state) => state.setPersonalPreferences);
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        {/* Input Group */}
        <ResumePopover value={resume} onChange={setResume}>
          <Button variant="outline" size="sm" type="button" className="shrink-0">
            <IconFileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{resume.trim() ? "Edit Resume" : "Add Resume"}</span>
            <span className="sm:hidden">Resume</span>
          </Button>
        </ResumePopover>
        <JobDescriptionPopover
          value={jobDescription}
          onChange={setJobDescription}
          matchResult={matchResult}
          isMatching={isMatching}
          hasResume={!!resume.trim()}
        >
          <Button variant="outline" size="sm" type="button" className="shrink-0">
            <IconBriefcase className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">
              {jobDescription.trim() ? "Edit Job Description" : "Add Job Description"}
            </span>
            <span className="md:hidden">Job</span>
          </Button>
        </JobDescriptionPopover>
        <PersonalPreferencesPopover value={personalPreferences} onChange={setPersonalPreferences}>
          <Button variant="outline" size="sm" type="button" className="shrink-0">
            <IconSettings className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Add Personal Preference</span>
            <span className="lg:hidden">Preferences</span>
          </Button>
        </PersonalPreferencesPopover>

        <Divider className="mx-2 hidden sm:block" />

        {/* Info Group - Hoverable buttons */}
        <JobMatchButton
          matchResult={matchResult}
          isMatching={isMatching}
          hasResume={!!resume.trim()}
          hasJobDescription={!!jobDescription.trim()}
        />
        <ChecklistButton checklist={matchResult?.checklist} />

        <Divider className="mx-2 hidden sm:block" />

        {/* Actions Group */}
        {isAdaptedResumeHidden && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => showCard("adapted-resume")}
            type="button"
            className="shrink-0"
          >
            <IconEye className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Show Adapted Resume</span>
            <span className="lg:hidden">Show Resume</span>
          </Button>
        )}
        {isGapsAnalysisHidden && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => showCard("gaps-analysis")}
            type="button"
            className="shrink-0"
          >
            <IconEye className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Show Gaps Analysis</span>
            <span className="lg:hidden">Show Gaps</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPromptOpen(true)}
          type="button"
          disabled={!resume.trim() || !jobDescription.trim()}
          className="shrink-0"
        >
          <IconCode className="h-4 w-4 mr-2" />
          <span className="hidden lg:inline">Show Prompt</span>
          <span className="lg:hidden">Prompt</span>
        </Button>
        {(() => {
          const isButtonDisabled = !hasChatbotData || !onToggleChatbot;
          return (
            <Tooltip disabled={!isButtonDisabled} content={<p>Process your resume first to ask questions about it</p>}>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleChatbot}
                type="button"
                disabled={isButtonDisabled}
                className="shrink-0"
              >
                <span className="mr-2">🤖</span>
                <span className="hidden lg:inline">Ask about Resume</span>
                <span className="lg:hidden">Ask</span>
              </Button>
            </Tooltip>
          );
        })()}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)} type="button" className="shrink-0">
          <IconHistory className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">History</span>
        </Button>
        <Menu open={isClearMenuOpen} onOpenChange={setIsClearMenuOpen}>
          <MenuAnchor asChild>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsClearMenuOpen(!isClearMenuOpen)}
              className="text-red-700 hover:text-red-900 hover:bg-red-50 shrink-0"
            >
              <IconTrash className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
              <IconChevronDown className="h-4 w-4 sm:ml-2" />
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
          className="shrink-0"
        >
          {isProcessing ? "Processing..." : "Start 🚀"}
        </Button>
      </div>
      <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
      <PromptModal open={isPromptOpen} onOpenChange={setIsPromptOpen} resume={resume} jobDescription={jobDescription} />
    </div>
  );
}
