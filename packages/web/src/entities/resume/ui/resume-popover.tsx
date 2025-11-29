"use client";

import { Label, Popover, PopoverContent, PopoverTrigger, Textarea } from "@/shared/ui";

import { PdfImportButton } from "./pdf-import-button";

interface ResumePopoverProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function ResumePopover({ value, onChange, children }: ResumePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col overflow-hidden"
        align="start"
        side="bottom"
      >
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div>
            <h3 className="font-semibold text-lg mb-1">Resume</h3>
            <p className="text-sm text-muted-foreground">Paste your current resume here</p>
          </div>
          <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <Label htmlFor="resume-popover">Resume Content</Label>
              <PdfImportButton onImport={onChange} />
            </div>
            <Textarea
              id="resume-popover"
              placeholder="Paste your resume here..."
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
