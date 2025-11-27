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

function getMatchColorClasses(percentage: number): string {
  if (percentage >= 80) {
    // Excelente match - Verde
    return "border-green-500 text-green-700 hover:bg-green-100 hover:border-green-600 hover:text-green-800";
  } else if (percentage >= 60) {
    // Bom match - Amarelo/Âmbar
    return "border-amber-500 text-amber-700 hover:bg-amber-100 hover:border-amber-600 hover:text-amber-800";
  } else if (percentage >= 40) {
    // Match médio - Laranja
    return "border-orange-500 text-orange-700 hover:bg-orange-100 hover:border-orange-600 hover:text-orange-800";
  } else {
    // Match baixo - Vermelho
    return "border-red-500 text-red-700 hover:bg-red-100 hover:border-red-600 hover:text-red-800";
  }
}

function getIconColorClasses(percentage: number): string {
  if (percentage >= 80) {
    return "text-green-600 group-hover:text-green-800";
  } else if (percentage >= 60) {
    return "text-amber-600 group-hover:text-amber-800";
  } else if (percentage >= 40) {
    return "text-orange-600 group-hover:text-orange-800";
  } else {
    return "text-red-600 group-hover:text-red-800";
  }
}

export function JobMatchButton({ matchResult, isMatching, hasResume, hasJobDescription }: JobMatchButtonProps) {
  const hasData = hasResume && hasJobDescription;
  const isDisabled = !hasData || (!matchResult && !isMatching);
  
  const matchPercentage = matchResult?.matchPercentage ?? 0;
  const buttonColorClasses = matchResult ? getMatchColorClasses(matchPercentage) : "";
  const iconColorClasses = matchResult ? getIconColorClasses(matchPercentage) : "";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="hoverable"
            size="sm"
            type="button"
            disabled={isDisabled}
            className={`group gap-2 ${buttonColorClasses}`}
          >
            <IconPercentage
              className={`h-4 w-4 ${
                isMatching
                  ? "animate-pulse text-muted-foreground"
                  : matchResult
                    ? iconColorClasses
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

