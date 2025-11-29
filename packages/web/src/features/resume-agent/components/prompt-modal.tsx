"use client";

import { buildProcessResumePrompt } from "@jobz/ai";
import { IconCode, IconCopy } from "@tabler/icons-react";
import { MacScrollbar } from "mac-scrollbar";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { copyToClipboard } from "@/shared/lib";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui";

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: string;
  jobDescription: string;
}

export function PromptModal({ open, onOpenChange, resume, jobDescription }: PromptModalProps) {
  const prompt = useMemo(() => {
    if (resume?.trim() && jobDescription?.trim()) {
      return buildProcessResumePrompt(jobDescription.trim(), resume.trim());
    }
    return "";
  }, [resume, jobDescription]);

  const handleCopy = useCallback(async () => {
    if (!prompt || !prompt.trim()) {
      toast.error("No prompt available to copy");
      return;
    }

    const success = await copyToClipboard(prompt);
    if (success) {
      toast.success("Prompt copied to clipboard!");
    } else {
      toast.error("Failed to copy prompt");
    }
  }, [prompt]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] origin-top-right data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-4 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-right-4 data-[state=open]:slide-in-from-top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCode className="h-5 w-5" />
            Prompt Used
          </DialogTitle>
          <DialogDescription>The complete prompt sent to OpenAI for processing</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleCopy} type="button" disabled={!prompt || !prompt.trim()}>
              <IconCopy className="h-4 w-4 mr-2" />
              Copy Prompt
            </Button>
          </div>

          <MacScrollbar className="max-h-[60vh]" skin="dark">
            <div className="pr-2">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap wrap-break-word bg-muted/30 p-4 rounded-lg border border-border/50">
                {prompt || "Loading prompt..."}
              </pre>
            </div>
          </MacScrollbar>
        </div>
      </DialogContent>
    </Dialog>
  );
}
