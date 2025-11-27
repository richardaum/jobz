"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";
import type { MatchResult } from "../stores/resume-store";

interface JobDescriptionPopoverProps {
  value: string;
  onChange: (value: string) => void;
  matchResult: MatchResult | null;
  isMatching: boolean;
  hasResume: boolean;
  children: React.ReactNode;
}

export function JobDescriptionPopover({
  value,
  onChange,
  matchResult,
  isMatching,
  hasResume,
  children,
}: JobDescriptionPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col overflow-hidden" align="start" side="bottom">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div>
            <h3 className="font-semibold text-lg mb-1">Job Description</h3>
            <p className="text-sm text-muted-foreground">Paste the job description here</p>
          </div>
          <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
            <Label htmlFor="job-description-popover">Job Description</Label>
            <Textarea
              id="job-description-popover"
              placeholder="Paste the job description here..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 min-h-[300px] resize-none"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

