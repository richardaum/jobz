"use client";

import { IconHistory, IconCode } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/shared/ui";
import { useResumeStore } from "../stores/resume-store";

import { HistoryModal } from "./history-modal";
import { PromptModal } from "./prompt-modal";

export function Toolbar() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);

  return (
    <div className="flex items-center justify-end gap-2 mb-4">
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
      <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)} type="button">
        <IconHistory className="h-4 w-4 mr-2" />
        History
      </Button>
      <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
      <PromptModal open={isPromptOpen} onOpenChange={setIsPromptOpen} resume={resume} jobDescription={jobDescription} />
    </div>
  );
}
