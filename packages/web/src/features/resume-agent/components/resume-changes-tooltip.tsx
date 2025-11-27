import { IconInfoCircle } from "@tabler/icons-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";

interface ResumeChangesTooltipProps {
  changes: { section: string; description: string }[];
  hasValue: boolean;
}

export function ResumeChangesTooltip({ changes, hasValue }: ResumeChangesTooltipProps) {
  const hasChanges = changes.length > 0 && hasValue;

  if (!hasChanges) {
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
            <IconInfoCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
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
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

