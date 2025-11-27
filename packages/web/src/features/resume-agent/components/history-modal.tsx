"use client";

import { IconClock, IconTrash, IconX } from "@tabler/icons-react";
import { format } from "date-fns";
import { MacScrollbar } from "mac-scrollbar";

import { Button } from "@/shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui";
import { useResumeHistoryStore, useResumeStore } from "../stores/resume-store";

import type { ResumeHistoryItem } from "../stores/resume-store";

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
        changes: [],
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

        <MacScrollbar className="max-h-[70vh]" skin="dark">
          <div className="pr-2">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <IconClock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No processing history yet.</p>
                <p className="text-muted-foreground text-sm text-center mt-2">
                  Process a resume to start building your history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleClearHistory} type="button">
                    <IconX className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </div>

                <div className="grid gap-4">
                  {history.map((item) => {
                    const date = new Date(item.timestamp);
                    const matchPercentage = item.matchResult?.matchPercentage ?? 0;

                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-md hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer group active:scale-[0.98]"
                        onClick={() => handleLoadFromHistory(item)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                                {format(date, "MM/dd/yyyy 'at' HH:mm")}
                              </CardTitle>
                              <CardDescription className="text-xs mt-0.5">Match: {matchPercentage}%</CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                              className="shrink-0 ml-2 h-6 w-6 p-0"
                              type="button"
                            >
                              <IconTrash className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.jobDescription.substring(0, 150)}...
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </MacScrollbar>
      </DialogContent>
    </Dialog>
  );
}
