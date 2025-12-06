"use client";

import { IconInfoCircle, IconLoader2 } from "@tabler/icons-react";

import { Button, Tooltip } from "@/shared/ui";

import type { ResumeChange } from "../types";

interface AdaptedResumeButtonProps {
  changes: ResumeChange[];
  hasValue: boolean;
  isLoading?: boolean;
}

export function AdaptedResumeButton({ changes, hasValue, isLoading = false }: AdaptedResumeButtonProps) {
  const hasChanges = changes.length > 0 && hasValue;
  const shouldShow = hasChanges || isLoading;

  if (!shouldShow) {
    return null;
  }

  return (
    <Tooltip
      side="bottom"
      className="max-w-sm"
      content={
        isLoading ? (
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
        )
      }
    >
      <Button variant="hoverable" size="sm" type="button" className="group gap-2">
        {isLoading ? (
          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" style={{ animationDuration: "1s" }} />
        ) : (
          <IconInfoCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        )}
        {isLoading ? "Processing..." : "Changes"}
      </Button>
    </Tooltip>
  );
}
