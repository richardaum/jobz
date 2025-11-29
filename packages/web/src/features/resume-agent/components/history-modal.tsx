"use client";

import { HistoryTab } from "@/entities/resume-history";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui";

import { type ResumeHistoryItem, useResumeHistoryStore, useResumeStore } from "../stores/resume-store";

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const history = useResumeHistoryStore((state) => state.history);
  const loadFromHistory = useResumeHistoryStore((state) => state.loadFromHistory);
  const removeFromHistory = useResumeHistoryStore((state) => state.removeFromHistory);
  const clearHistory = useResumeHistoryStore((state) => state.clearHistory);

  const setResume = useResumeStore((state) => state.setResume);
  const setJobDescription = useResumeStore((state) => state.setJobDescription);
  const updateOutputs = useResumeStore((state) => state.updateOutputs);

  const handleLoadFromHistory = (item: ResumeHistoryItem) => {
    loadFromHistory(item, (data) => {
      setResume(data.resume);
      setJobDescription(data.jobDescription);
      updateOutputs({
        adaptedResume: data.adaptedResume,
        gaps: data.gaps,
        matchResult: data.matchResult,
        changes: data.changes || [],
      });
    });
    onOpenChange(false);
  };

  const handleDeleteItem = (id: string) => {
    removeFromHistory(id);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearHistory();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] origin-top-right data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-4 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-right-4 data-[state=open]:slide-in-from-top-4">
        <DialogHeader>
          <DialogTitle>Processing History</DialogTitle>
          <DialogDescription>
            {history.length} {history.length === 1 ? "item" : "items"} in history
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-hidden">
          <HistoryTab
            history={history}
            onLoadItem={handleLoadFromHistory}
            onDeleteItem={handleDeleteItem}
            onClearHistory={handleClearHistory}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
