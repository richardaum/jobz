import { IconChecklist } from "@tabler/icons-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";

import type { ChecklistItem } from "../stores/resume-store";

interface ChecklistTooltipProps {
  checklist: ChecklistItem[];
}

export function ChecklistTooltip({ checklist }: ChecklistTooltipProps) {
  if (!checklist || checklist.length === 0) {
    return null;
  }

  const checkedCount = checklist.filter((item) => item.checked).length;
  const totalCount = checklist.length;

  // Separate into gaps (unchecked) and successes (checked)
  const gaps = checklist.filter((item) => !item.checked);
  const successes = checklist.filter((item) => item.checked);

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
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Gaps Section */}
              {gaps.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-sm text-red-600 dark:text-red-400">Gaps ({gaps.length})</div>
                  {gaps.map((item, index) => (
                    <div key={`gap-${index}`} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 shrink-0 text-gray-400">○</div>
                      <div className="flex-1">
                        <div className="font-medium">{item.category}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Successes Section */}
              {successes.length > 0 && (
                <div className="space-y-2">
                  {gaps.length > 0 && <div className="border-t border-border pt-2" />}
                  <div className="font-medium text-sm text-green-600 dark:text-green-400">
                    Success ({successes.length})
                  </div>
                  {successes.map((item, index) => (
                    <div key={`success-${index}`} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 shrink-0 text-green-600">✓</div>
                      <div className="flex-1">
                        <div className="font-medium">{item.category}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
