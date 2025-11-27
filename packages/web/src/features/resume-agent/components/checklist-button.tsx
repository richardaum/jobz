"use client";

import { IconChecklist } from "@tabler/icons-react";
import { MacScrollbar } from "mac-scrollbar";

import { Button } from "@/shared/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";

import type { ChecklistItem } from "../stores/resume-store";

interface ChecklistButtonProps {
  checklist: ChecklistItem[] | null | undefined;
}

export function ChecklistButton({ checklist }: ChecklistButtonProps) {
  const hasChecklist = checklist && checklist.length > 0;
  const isDisabled = !hasChecklist;

  if (hasChecklist) {
    const checkedCount = checklist.filter((item) => item.checked).length;
    const totalCount = checklist.length;

    // Separate into gaps (unchecked) and successes (checked)
    const gaps = checklist.filter((item) => !item.checked);
    const successes = checklist.filter((item) => item.checked);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="hoverable" size="sm" type="button" disabled={false} className="gap-2">
              <IconChecklist className="h-4 w-4 text-primary" />
              Checklist: {checkedCount}/{totalCount}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-md">
            <div className="space-y-3">
              <div className="font-semibold text-sm">
                Checklist: {checkedCount}/{totalCount} items
              </div>
              <MacScrollbar className="max-h-96" skin="dark">
                <div className="pr-2 space-y-4">
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
              </MacScrollbar>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="hoverable" size="sm" type="button" disabled={isDisabled} className="gap-2">
            <IconChecklist className="h-4 w-4 text-muted-foreground" />
            Checklist
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <p className="text-sm">Process your resume to see the checklist of requirements and gaps</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
