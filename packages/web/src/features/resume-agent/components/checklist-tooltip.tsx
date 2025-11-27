import { IconChecklist } from "@tabler/icons-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";

import type { ChecklistItem } from "../hooks/use-resume-outputs";

interface ChecklistTooltipProps {
  checklist: ChecklistItem[];
}

export function ChecklistTooltip({ checklist }: ChecklistTooltipProps) {
  if (!checklist || checklist.length === 0) {
    return null;
  }

  const checkedCount = checklist.filter((item) => item.checked).length;
  const totalCount = checklist.length;

  return (
    <TooltipProvider>
      <Tooltip defaultOpen={false}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <IconChecklist className="h-4 w-4 text-primary" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-md">
          <div className="space-y-3">
            <div className="font-semibold text-sm">
              Checklist: {checkedCount}/{totalCount} items
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className={`mt-0.5 flex-shrink-0 ${item.checked ? "text-green-600" : "text-gray-400"}`}>
                    {item.checked ? "✓" : "○"}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.category}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

