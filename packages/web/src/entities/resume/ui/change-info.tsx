"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";

import type { ResumeChange } from "../types";

interface ChangeInfoProps {
  change: ResumeChange;
  onHoverChange: (change: ResumeChange | null) => void;
  isHovered: boolean;
  children: React.ReactNode;
}

export function ChangeInfo({ change, onHoverChange, isHovered, children }: ChangeInfoProps) {
  const handleOpenChange = (open: boolean) => {
    onHoverChange(open ? change : null);
  };

  return (
    <Popover open={isHovered} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span className="inline-block">{children}</span>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-96 max-h-none p-4">
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-sm mb-1">{change.section}</p>
            {change.reason && <p className="text-xs text-muted-foreground mb-2">{change.reason}</p>}
          </div>

          {change.originalText && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Original:</p>
              <p className="text-xs bg-muted p-2 rounded border border-border whitespace-pre-wrap break-words">
                {change.originalText}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
