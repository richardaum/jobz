import { IconInfoCircle, IconLoader2 } from "@tabler/icons-react";

import type { ResumeChange } from "../types";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";

interface ResumeChangesTooltipProps {
  changes: ResumeChange[];
  hasValue: boolean;
  isLoading?: boolean;
}

export function ResumeChangesTooltip({ changes, hasValue, isLoading = false }: ResumeChangesTooltipProps) {
  const hasChanges = changes.length > 0 && hasValue;
  const shouldShow = hasChanges || isLoading;

  if (!shouldShow) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip defaultOpen={false}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View changes made to resume"
          >
            {isLoading ? (
              <IconLoader2 className="h-4 w-4 animate-spin" style={{ animationDuration: "1s" }} />
            ) : (
              <IconInfoCircle className="h-4 w-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" style={{ animationDuration: "1s" }} />
              <p className="text-sm text-muted-foreground">Processing changes...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-sm mb-2">Changes made:</p>
              <ul className="space-y-1.5 text-xs">
                {changes.map((change, index) => (
                  <li key={index} className="flex flex-col gap-0.5">
                    <span className="font-medium">{change.section}</span>
                    <span className="text-muted-foreground">{change.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

