"use client";

import { IconPercentage } from "@tabler/icons-react";

import { Button } from "@/shared/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";

import type { MatchResult } from "../stores/resume-store";

interface JobMatchButtonProps {
  matchResult: MatchResult | null;
  isMatching: boolean;
  hasResume: boolean;
  hasJobDescription: boolean;
}

export function JobMatchButton({ matchResult, isMatching, hasResume, hasJobDescription }: JobMatchButtonProps) {
  const hasData = hasResume && hasJobDescription;
  const isDisabled = !hasData || (!matchResult && !isMatching);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="hoverable"
            size="sm"
            type="button"
            disabled={isDisabled}
            className="gap-2"
          >
            <IconPercentage
              className={`h-4 w-4 ${
                isMatching
                  ? "animate-pulse text-muted-foreground"
                  : matchResult
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            />
            {isMatching
              ? "Matching..."
              : matchResult
                ? `Match: ${matchResult.matchPercentage}%`
                : "Job Match"}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          {isDisabled ? (
            <p className="text-sm">
              {!hasData
                ? "Fill in both resume and job description, then process to see match analysis"
                : "Click 'Process Resume' to see match analysis"}
            </p>
          ) : isMatching ? (
            <p className="text-sm">Matching job with your resume...</p>
          ) : matchResult ? (
            <div className="space-y-2">
              <div className="font-semibold text-sm">Match: {matchResult.matchPercentage}%</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{matchResult.analysis}</div>
            </div>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

