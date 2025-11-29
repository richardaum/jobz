import { IconPercentage } from "@tabler/icons-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";

import type { MatchResult } from "../types";

interface JobMatchTooltipProps {
  matchResult: MatchResult | null;
  isMatching: boolean;
  hasResume: boolean;
  hasJobDescription: boolean;
}

export function JobMatchTooltip({ matchResult, isMatching, hasResume, hasJobDescription }: JobMatchTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen={false}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {isMatching ? (
              <IconPercentage className="h-4 w-4 animate-pulse text-muted-foreground" />
            ) : matchResult ? (
              <IconPercentage className="h-4 w-4 text-primary" />
            ) : (
              <IconPercentage className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          {isMatching ? (
            <p className="text-sm">Matching job with your resume...</p>
          ) : matchResult ? (
            <div className="space-y-2">
              <div className="font-semibold text-sm">Match: {matchResult.matchPercentage}%</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{matchResult.analysis}</div>
            </div>
          ) : hasResume && hasJobDescription ? (
            <p className="text-sm">Click &quot;Process Resume&quot; to see match analysis</p>
          ) : (
            <p className="text-sm">Fill in both resume and job description to see match</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
